import sqlite3
import os

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
            print(f"FOUND: {db_path} | SIZE: {os.path.getsize(db_path)} | QUESTIONS: {count}")
        else:
            print(f"INFO: {db_path} | SIZE: {os.path.getsize(db_path)} | NO QUESTIONS TABLE")
        conn.close()
    except Exception as e:
        print(f"ERROR: {db_path} | {e}")

root_dir = r'c:\Users\Dell\Desktop\Derin Deniz'
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if '.sqlite' in file.lower() or '.db' in file.lower():
            check_db(os.path.join(root, file))
