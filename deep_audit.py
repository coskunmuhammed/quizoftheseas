import os
import sqlite3

search_root = r'c:\Users\Dell'
output_path = r'c:\Users\Dell\Desktop\Derin Deniz\system_wide_audit.txt'

found_dbs = []

for root, dirs, files in os.walk(search_root):
    if any(skip in root for skip in ['node_modules', '.git', '.gemini', '.next', 'AppData']):
        continue
    for f in files:
        if f.lower().endswith('.sqlite') or f.lower().endswith('.db'):
            path = os.path.join(root, f)
            try:
                size = os.path.getsize(path)
                if size > 10000:
                    conn = sqlite3.connect(path)
                    cursor = conn.cursor()
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'")
                    if cursor.fetchone():
                        cursor.execute("SELECT COUNT(*) FROM questions")
                        count = cursor.fetchone()[0]
                        found_dbs.append(f"{path} | SIZE: {size} | QUESTIONS: {count}")
                    conn.close()
            except:
                pass

with open(output_path, 'w', encoding='utf-8') as out:
    for db in found_dbs:
        out.write(db + '\n')

print(f"Audit complete. Results in {output_path}")
