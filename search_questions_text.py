import os

search_str = "questions".encode('utf-8')
root = r'c:\Users\Dell\Desktop'

for r, d, files in os.walk(root):
    if any(skip in r for skip in ['node_modules', '.git', '.gemini', '.next']):
        continue
    for f in files:
        p = os.path.join(r, f)
        try:
            if os.path.getsize(p) > 100000 and os.path.getsize(p) < 10000000:
                with open(p, 'rb') as file:
                    content = file.read()
                    if search_str in content:
                        print(f"FOUND 'questions' IN: {p} | SIZE: {os.path.getsize(p)}")
        except:
            pass
