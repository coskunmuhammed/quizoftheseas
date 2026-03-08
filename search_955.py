import os

search_str = "955".encode('utf-8')
root = r'c:\Users\Dell'

for r, d, files in os.walk(root):
    if any(skip in r for skip in ['node_modules', '.gemini', 'AppData', '.git', 'Local', 'Roaming']):
        continue
    for f in files:
        p = os.path.join(r, f)
        try:
            if os.path.getsize(p) < 10000000: # Skip huge files
                with open(p, 'rb') as file:
                    content = file.read()
                    if search_str in content:
                        print(f"FOUND 955 IN: {p}")
        except:
            pass
