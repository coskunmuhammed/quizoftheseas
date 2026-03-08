import sqlite3
import os

paths = [
    r'c:\Users\Dell\Desktop\Derin Deniz\database.sqlite',
    r'c:\Users\Dell\Desktop\Derin Deniz\backend\database.sqlite'
]

for p in paths:
    if os.path.exists(p):
        try:
            conn = sqlite3.connect(p)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM questions")
            count = cursor.fetchone()[0]
            print(f"PATH: {p} | QUESTIONS: {count}")
            conn.close()
        except Exception as e:
            print(f"PATH: {p} | ERROR: {e}")
    else:
        print(f"PATH: {p} | NOT FOUND")
