import subprocess, os
os.chdir('C:/Users/HP Omen/Documents/deepseek-harness/default-workspace/currency-converter')
for cmd in [['git','init'], ['git','add','.'], ['git','-c','user.name=ArtPlayZ','-c','user.email=artplayz@users.noreply.github.com','commit','-m','init: currency converter']]:
 r = subprocess.run(cmd, capture_output=True, text=True)
 print('>', ' '.join(cmd))
 print(r.stdout.strip())
 print(r.stderr.strip())
