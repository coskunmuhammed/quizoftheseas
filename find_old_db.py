import os
import sqlite3

desktop = r'c:\Users\Dell\Desktop'
for root, dirs, files in os.walk(desktop):
    if 'node_modules' in root or '.git' in root:
        continue
    for f in files:
        if f.lower() == 'database.sqlite':
            path = os.path.join(root, f)
            size = os.path.getsize(path)
            try:
                conn = sqlite3.connect(path)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'")
                if cursor.fetchone():
                    cursor.execute("SELECT COUNT(*) FROM questions")
                    count = cursor.fetchone()[0]
                    print(f"PATH: {path} | SIZE: {size} | QUESTIONS: {count}")
                else:
                    print(f"PATH: {path} | SIZE: {size} | NO QUESTIONS TABLE")
                conn.close()
            except Exception as e:
                print(f"PATH: {path} | ERROR: {e}")
