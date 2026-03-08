import sqlite3
import os
import glob

def check_sqlite(path):
    try:
        size = os.path.getsize(path)
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'")
        if cursor.fetchone():
            cursor.execute("SELECT COUNT(*) FROM questions")
            count = cursor.fetchone()[0]
            print(f"FILE: {path} | SIZE: {size} bytes | QUESTIONS: {count}")
        else:
            print(f"FILE: {path} | SIZE: {size} bytes | NO QUESTIONS TABLE")
        conn.close()
    except Exception as e:
        print(f"FILE: {path} | ERROR: {e}")

root = 'c:/Users/Dell/Desktop/Derin Deniz'
for path in glob.glob(os.path.join(root, '**/*.sqlite*'), recursive=True):
    if os.path.isfile(path):
        check_sqlite(path)
