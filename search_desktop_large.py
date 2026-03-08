import os

search_dir = r'c:\Users\Dell\Desktop'
output_file = r'c:\Users\Dell\Desktop\Derin Deniz\desktop_large_files.txt'

found_count = 0
with open(output_file, 'w', encoding='utf-8') as f_out:
    for root, dirs, files in os.walk(search_dir):
        if any(skip in root for skip in ['node_modules', '.git', '.gemini', '.next']):
            continue
        for f in files:
            path = os.path.join(root, f)
            try:
                size = os.path.getsize(path)
                if size > 200000: # 200KB
                    f_out.write(f"{path} | {size}\n")
                    found_count += 1
            except:
                pass

print(f"Results written to {output_file}. Found {found_count} files.")
