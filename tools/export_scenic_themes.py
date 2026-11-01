from PIL import Image
from pathlib import Path
import json,sys
repo=Path(__file__).resolve().parents[1]
manifest=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
for theme,source in manifest.items():
 im=Image.open(source).convert('RGBA'); w,h=im.size
 out=repo/'public/assets/scenic'/(theme+'-v1');out.mkdir(parents=True,exist_ok=True)
 cells=[im.crop((round(x*w/3)+5,round(y*h/2)+5,round((x+1)*w/3)-5,round((y+1)*h/2)-5)) for y in range(2) for x in range(3)]
 def save(im,name,width,alpha=False):
  im=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
  if alpha:
   im.putalpha(im.getchannel('A').point(lambda a: 0 if a<40 else a))
  if not alpha:
   bg=Image.new('RGBA',im.size,'#faf7ee');bg.alpha_composite(im);im=bg.convert('RGB')
  im.save(out/(name+'.webp'),'WEBP',quality=76,method=4)
  if not alpha:im.save(out/(name+'.avif'),'AVIF',quality=48,speed=6)
 # The desktop and mobile header are distinct source compositions.
 for index,name,width in [(0,'header-1440',768),(5,'header-640',512)]:
  cell=cells[index];cw,ch=cell.size
  save(cell.crop((0,round(ch*.25),cw,round(ch*.85))),name,width)
 save(cells[2],'sidebar-320',320)
 save(cells[1],'frame-640',512,True)
 save(cells[3],'corner-mobile',220,True)
 save(cells[4],'book-mobile',180,True)
 sizes={p.name:p.stat().st_size for p in out.iterdir() if p.suffix in ['.avif','.webp']}
 (out/'sizes.json').write_text(json.dumps(sizes,indent=2))
 print(theme,sum(sizes.values()),sizes)
