import sqlite3
import os

results = []

def check_db(db_path):
    if not os.path.isfile(db_path):
        return
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'")
        has_questions = cursor.fetchone() is not None
        if has_questions:
            cursor.execute("SELECT COUNT(*) FROM questions")
            count = cursor.fetchone()[0]
            results.append(f"FOUND: {db_path} | SIZE: {os.path.getsize(db_path)} | QUESTIONS: {count}")
        else:
            results.append(f"INFO: {db_path} | SIZE: {os.path.getsize(db_path)} | NO QUESTIONS TABLE")
        conn.close()
    except Exception as e:
        results.append(f"ERROR: {db_path} | {e}")

root_dir = r'c:\Users\Dell\Desktop\Derin Deniz'
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if '.sqlite' in file.lower() or '.db' in file.lower():
            check_db(os.path.join(root, file))

with open(os.path.join(root_dir, 'backend', 'sqlite_audit.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(results))
