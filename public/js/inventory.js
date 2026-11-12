const sparkyWitchHatId = 'sparky_witch_hat';
const sparkyWitchAssets = '/assets/accessories/sparky-witch-v7/';
const sparkyWitchIdle = sparkyWitchAssets + 'sparky-witch-v7.gif';

function createWitchHatIcon() {
  const image = document.createElement('img');
  image.src = sparkyWitchAssets + 'witch-hat-v7.png';
  image.alt = '';
  image.className = 'sparky-witch-item-icon';
  return image;
}

let accessoryCatalog=[];
let accessoryRequestPending=false;
function applyRoomInvitationFromUrl(){
  const url=new URL(location.href),code=(url.searchParams.get('room')||'').toUpperCase();
  if(!/^TOK-[A-Z0-9]{4,12}$/.test(code)||!currentUserAccount?.userId)return;
  navTo('minigame');selectArenaMode('casual');
  const input=document.getElementById('input_casual_room_code');if(input)input.value=code;
  url.searchParams.delete('room');history.replaceState(null,'',url);
  showToast('Đã điền mã '+code+'. Bấm Tham gia để vào phòng của bạn bè.','info');
}
function renderAccessoryOverlays(){
  const equippedItem = currentUserAccount?.accessory;
  const item = equippedItem?.locked ? null : equippedItem;
  const sparkyWearsHat = item?.id === sparkyWitchHatId && currentEquippedPet?.id === 'dragon';
  const portrait = document.querySelector('#current-pet-icon-large > img');
  if (portrait) {
    if (sparkyWearsHat) {
      if (!portrait.dataset.originalPetImage) {
        portrait.dataset.originalPetImage = portrait.getAttribute('src');
        portrait.src = sparkyWitchIdle;
        portrait.classList.add('sparky-witch-idle');
      }
    } else if (portrait.dataset.originalPetImage) {
      portrait.src = portrait.dataset.originalPetImage;
      delete portrait.dataset.originalPetImage;
      portrait.classList.remove('sparky-witch-idle');
    }
  }
  for(const id of ['current-pet-icon-large','hub-pet-avatar','sidebar-pet-avatar','arena-lobby-pet','casual-lobby-pet','my-pet']){
    const host=document.getElementById(id);if(!host)continue;
    host.querySelector('.pet-accessory-badge')?.remove();
    if(!item)continue;
    if (item.id === sparkyWitchHatId) {
      if (sparkyWearsHat && id !== 'current-pet-icon-large') {
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        const hat = createWitchHatIcon();
        hat.classList.add('pet-accessory-badge', 'sparky-witch-badge');
        hat.alt = item.name;
        host.appendChild(hat);
      }
      continue;
    }
    if(getComputedStyle(host).position==='static')host.style.position='relative';
    const badge=document.createElement('span');badge.className='pet-accessory-badge';badge.textContent=item.icon;
    badge.title='Phụ kiện: '+item.name;badge.setAttribute('aria-label','Phụ kiện: '+item.name);host.appendChild(badge);
  }
}
function renderAccessories(){
  const grid=document.getElementById('shop-items-grid');if(!grid)return;
  grid.replaceChildren();
  for(const item of accessoryCatalog){
    const card=document.createElement('div');card.dataset.itemId=item.id;
    card.className='bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex items-center gap-3';
    const icon = item.id === sparkyWitchHatId ? createWitchHatIcon() : document.createElement('span');
    if (item.id !== sparkyWitchHatId) {
      icon.className = 'text-2xl';
      icon.textContent = item.icon;
    }
    const info=document.createElement('div');info.className='min-w-0 flex-1';
    const name=document.createElement('strong');name.className='block text-xs';name.textContent=item.name;
    const detail=document.createElement('p');detail.className='text-[10px] text-[var(--muted-foreground)] mt-1';detail.textContent=item.description;
    info.append(name,detail);
    const button=document.createElement('button');button.id='btn_item_'+item.id;button.className='shrink-0 px-3 py-2 rounded-xl border border-emerald-500/30 text-xs font-bold text-emerald-600';
    button.textContent=item.locked?'Tạm khóa':item.equipped?'Đang trang bị':item.owned?'Đã sở hữu':item.price+' 🪙';
    button.disabled=accessoryRequestPending||item.owned||item.locked;button.onclick=()=>purchaseAccessory(item.id);
    card.append(icon,info,button);grid.appendChild(card);
  }
  const collection = document.getElementById('owned-accessories');
  const list = document.getElementById('owned-accessories-list');
  const owned = accessoryCatalog.filter(item => item.owned);
  collection.hidden = owned.length === 0;
  list.replaceChildren(...owned.map(item => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-2 text-xs';
    const name = document.createElement('span');
    name.textContent = item.name;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rounded-lg border border-[var(--border)] px-2 py-1 font-semibold';
    button.textContent = item.equipped ? 'Tháo' : item.locked ? 'Tạm khóa' : 'Trang bị';
    button.disabled = accessoryRequestPending || (item.locked && !item.equipped);
    button.onclick = item.equipped ? removeAccessory : () => equipOwnedAccessory(item.id);
    row.append(name, button);
    return row;
  }));
}

async function equipOwnedAccessory(id) {
  const token = localStorage.getItem('tok_token');
  const item = accessoryCatalog.find(entry => entry.id === id);
  if (!token || !item?.owned || item.locked || accessoryRequestPending) return;
  accessoryRequestPending = true;
  renderAccessories();
  try {
    await setEquippedAccessory(id, token);
    if (token === localStorage.getItem('tok_token')) showToast('Đã trang bị ' + item.name + '.', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    accessoryRequestPending = false;
    if (token === localStorage.getItem('tok_token')) await loadRealItems();
  }
}
async function loadRealItems(){
  const token=localStorage.getItem('tok_token');if(!token)return;
  try{
    const response=await fetch('/api/items',{headers:{Authorization:'Bearer '+token}}),result=await response.json();
    if(!result.success)throw Error(result.error?.message||'Không tải được phụ kiện.');
    if(token!==localStorage.getItem('tok_token'))return;
    accessoryCatalog=result.data;currentUserAccount.accessory=accessoryCatalog.find(item=>item.owned&&item.equipped)||null;
    renderAccessories();renderAccessoryOverlays();
  }catch(error){showToast(error.message||'Không tải được phụ kiện.','error');}
}
async function purchaseAccessory(id){
  const item=accessoryCatalog.find(row=>row.id===id),token=localStorage.getItem('tok_token');
  if(!item||item.owned||item.locked||!token||accessoryRequestPending)return;
  if(!confirm(`Mua ${item.name} với ${item.price} Xu?`))return;
  accessoryRequestPending=true;renderAccessories();
  try{
    const response=await fetch('/api/items/'+encodeURIComponent(id)+'/buy',{method:'POST',headers:{Authorization:'Bearer '+token}}),result=await response.json();
    if(!result.success)throw Error(result.error?.message||'Không mua được phụ kiện.');
    if(token!==localStorage.getItem('tok_token'))return;
    userCoins=result.data.newCoins;updateCoinsUI();
    showToast('Đã thêm '+item.name+' vào bộ sưu tập.','success');
  }catch(error){showToast(error.message||'Chưa lưu được phụ kiện.','error');}
  finally{accessoryRequestPending=false;if(token===localStorage.getItem('tok_token'))await loadRealItems();}
}
async function setEquippedAccessory(id,token=localStorage.getItem('tok_token')){
  const response=await fetch('/api/items/equipped',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({itemId:id})}),result=await response.json();
  if(!result.success)throw Error(result.error?.message||'Không trang bị được phụ kiện.');
  if(token!==localStorage.getItem('tok_token'))return;
  currentUserAccount.accessory=result.data.equipped;renderAccessoryOverlays();
}
async function removeAccessory(){
  if(accessoryRequestPending)return;accessoryRequestPending=true;
  try{await setEquippedAccessory(null);await loadRealItems();showToast('Đã tháo phụ kiện.','success');}
  catch(error){showToast(error.message||'Không tháo được phụ kiện.','error');}
  finally{accessoryRequestPending=false;renderAccessories();}
}
