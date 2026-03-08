import os

input_file = r'c:\Users\Dell\Desktop\Derin Deniz\desktop_large_files.txt'

with open(input_file, 'r', encoding='utf-8') as f_in:
    for line in f_in:
        path = line.split(' | ')[0]
        if os.path.exists(path):
            try:
                with open(path, 'rb') as f:
                    header = f.read(16)
                    if header == b'SQLite format 3\x00':
                        print(f"SQLITE FOUND: {path}")
            except:
                pass
