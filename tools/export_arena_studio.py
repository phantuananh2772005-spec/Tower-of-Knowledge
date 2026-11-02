from PIL import Image
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[1]
out=root/'public/design/arena-assets';out.mkdir(parents=True,exist_ok=True)
for name,path in json.loads(Path(sys.argv[1]).read_text()).items():
 im=Image.open(path).convert('RGB');w,h=im.size;columns=[]
 for x in range(int(w*.6),int(w*.75)):
  score=sum(min(p)>228 for p in im.crop((x,0,x+1,h)).get_flattened_data())/h
  if score>.85:columns.append(x)
 split=round(sum(columns)/len(columns)) if columns else round(w*2/3)
 for mode,box,width in [('desktop',(0,0,split-6,h),960),('mobile',(split+6,0,w,h),480)]:
  art=im.crop(box);width=min(width,art.width);art=art.resize((width,round(width*art.height/art.width)),Image.Resampling.LANCZOS)
  for fmt,q in [('AVIF',48),('WEBP',76)]:art.save(out/f'{name}-{mode}.{fmt.lower()}',fmt,quality=q,**({'speed':6} if fmt=='AVIF' else {'method':4}))
 print(name,split,flush=True)
im=Image.open(root/'public/assets/logo_transparent.png');im.thumbnail((128,128),Image.Resampling.LANCZOS);im.save(out/'brand.webp','WEBP',quality=82,method=4)
