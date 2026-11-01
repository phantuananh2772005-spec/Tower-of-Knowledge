from PIL import Image
from pathlib import Path
import json,sys
repo=Path(__file__).resolve().parents[1]
names=['hub','enrolled','saga','catalog','minigame','pet','shop','arena','ranked','casual','extreme','leaderboard','quests']
for theme,source in json.loads(Path(sys.argv[1]).read_text(encoding='utf-8')).items():
 im=Image.open(source).convert('RGBA');w,h=im.size
 out=repo/'public/assets/seasonal-icons'/theme;out.mkdir(parents=True,exist_ok=True)
 sizes={}
 for i,name in enumerate(names):
  x,y=i%4,i//4
  cell=im.crop((round(x*w/4)+4,round(y*h/4)+4,round((x+1)*w/4)-4,round((y+1)*h/4)-4))
  cell.putalpha(cell.getchannel('A').point(lambda a:0 if a<35 else a))
  box=cell.getbbox()
  if not box:raise ValueError(f'Empty icon {theme}/{name}')
  cell=cell.crop(box);cell.thumbnail((112,112),Image.Resampling.LANCZOS)
  canvas=Image.new('RGBA',(128,128));canvas.alpha_composite(cell,((128-cell.width)//2,(128-cell.height)//2))
  target=out/(name+'.webp');canvas.save(target,'WEBP',quality=78,method=4);sizes[name]=target.stat().st_size
 (out/'sizes.json').write_text(json.dumps(sizes,indent=2))
 print(theme,sum(sizes.values()),flush=True)
