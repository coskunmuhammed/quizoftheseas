import os

search_dir = r'c:\Users\Dell'
output_file = r'c:\Users\Dell\Desktop\Derin Deniz\all_potential_dbs.txt'

with open(output_file, 'w', encoding='utf-8') as f_out:
    for root, dirs, files in os.walk(search_dir):
        # Skip noisy directories
        if any(skip in root for skip in ['node_modules', '.gemini', 'AppData', '.git', 'Local', 'Roaming']):
            continue
        for f in files:
            path = os.path.join(root, f)
            try:
                lower_f = f.lower()
                if lower_f.endswith('.sqlite') or lower_f.endswith('.db') or 'database' in lower_f:
                    size = os.path.getsize(path)
                    if size > 100000: # 100KB
                        f_out.write(f"{path} | SIZE: {size}\n")
            except:
                pass

print(f"Results written to {output_file}")
