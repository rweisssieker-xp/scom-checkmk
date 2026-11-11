import json, wave, math, textwrap
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
p=Path('output/playwright'); scenes=json.loads((p/'scenes.json').read_text(encoding='utf-8')); font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',30); small=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',21)
parts=[]; srt=[]; manifest=[]; total=0; settings=None
for i,(img,caption) in enumerate(scenes):
    with wave.open(str(p/f'narration-{i:02}.wav'),'rb') as w:
        prm=w.getparams(); raw=w.readframes(w.getnframes()); duration=w.getnframes()/w.getframerate()
        if settings is None: settings=prm
        assert prm[:3]==settings[:3]
        segment=max(12.0, math.ceil((duration+0.6)*10)/10); parts.append(raw+b'\0'*(int((segment-duration)*prm.framerate)*prm.nchannels*prm.sampwidth))
    im=Image.new('RGB',(1600,1080),'#07182a'); im.paste(Image.open(p/f'{img}.png').convert('RGB'),(0,0)); d=ImageDraw.Draw(im);d.text((36,918),'SERVICE ATLAS  /  PRODUKTÜBERBLICK',font=small,fill='#65d9c3');
    line='';lines=[]
    for word in caption.split():
        candidate=(line+' '+word).strip()
        if d.textlength(candidate,font=font)>1528 and line: lines.append(line);line=word
        else: line=candidate
    if line: lines.append(line)
    for j,line in enumerate(lines):d.text((36,955+j*39),line,font=font,fill='white')
    im.save(p/f'frame-{i:02}.png');manifest.append(f"file 'frame-{i:02}.png'\nduration {segment:.3f}\n")
    def stamp(t):
        ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
    srt.append(f'{i+1}\n{stamp(total)} --> {stamp(total+segment)}\n'+ '\n'.join(lines)+'\n');total+=segment
manifest.append(f"file 'frame-{len(scenes)-1:02}.png'\n")
(p/'frames.txt').write_text(''.join(manifest),encoding='utf-8');(p/'Service-Atlas-Untertitel.srt').write_text('\n'.join(srt),encoding='utf-8')
with wave.open(str(p/'narration.wav'),'wb') as w:w.setparams(settings);w.writeframes(b''.join(parts))
print(f'video duration: {total:.1f}s; scenes: {len(scenes)}')
