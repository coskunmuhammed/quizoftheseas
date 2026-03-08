import os

search_str = "Çatışmayı Önleme Tüzüğü".encode('utf-8')
root = r'c:\Users\Dell\Desktop\Derin Deniz'

for r, d, files in os.walk(root):
    if 'node_modules' in r or '.git' in r:
        continue
    for f in files:
        p = os.path.join(r, f)
        try:
            with open(p, 'rb') as file:
                content = file.read()
                if search_str in content:
                    print(f"FOUND IN: {p}")
        except:
            pass
