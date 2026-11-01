from pathlib import Path
from PIL import Image
import json,sys
root=Path(__file__).resolve().parents[1]/'public/assets/garden-v2'
data=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
for theme,source in data.items():
 if theme=='boss':continue
 im=Image.open(source).convert('RGB');w,h=im.size;out=root/theme;out.mkdir(parents=True,exist_ok=True);sizes={}
 for i,season in enumerate(['spring','summer','autumn','winter']):
  x,y=i%2,i//2
  panel=im.crop((round(x*w/2)+2,round(y*h/2)+2,round((x+1)*w/2)-2,round((y+1)*h/2)-2))
  for slot in [480,960]:
   width=min(slot,panel.width);art=panel.resize((width,round(panel.height*width/panel.width)),Image.Resampling.LANCZOS)
   for fmt,q in [('AVIF',45),('WEBP',73)]:
    file=out/f'{season}-{slot}.{fmt.lower()}'
    art.save(file,fmt,quality=q,**({'speed':6} if fmt=='AVIF' else {'method':4}))
    sizes[file.name]=file.stat().st_size
 (out/'sizes.json').write_text(json.dumps(sizes,indent=2));print(theme,sum(sizes.values()),flush=True)
if 'boss' in data:
 im=Image.open(data['boss']).convert('RGBA');w,h=im.size;out=root/'nodes';out.mkdir(parents=True,exist_ok=True)
 for i,theme in enumerate(['sky','halloween','teachers','christmas','new-year','tet','valentine','womens-day','youth-spring']):
  x,y=i%3,i//3;cell=im.crop((round(x*w/3)+3,round(y*h/3)+3,round((x+1)*w/3)-3,round((y+1)*h/3)-3))
  cell.putalpha(cell.getchannel('A').point(lambda a:0 if a<35 else a));cell=cell.crop(cell.getbbox());cell.thumbnail((164,164),Image.Resampling.LANCZOS)
  canvas=Image.new('RGBA',(176,176));canvas.alpha_composite(cell,((176-cell.width)//2,(176-cell.height)//2));canvas.save(out/f'{theme}-boss.webp','WEBP',quality=80,method=4)
 print('boss variants exported',flush=True)
