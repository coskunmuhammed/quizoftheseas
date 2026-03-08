import sqlite3
import os

db_path = r'c:\Users\Dell\Desktop\Derin Deniz\backend\database.sqlite'
out_path = r'c:\Users\Dell\Desktop\Derin Deniz\backend\recovered_questions.txt'

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, category_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation FROM questions")
    rows = cursor.fetchall()
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(f"RECOVERED {len(rows)} QUESTIONS\n")
        f.write("-" * 50 + "\n")
        for r in rows:
            f.write(f"ID: {r[0]} | Cat: {r[1]} | Text: {r[2][:50]}...\n")
            
    print(f"Successfully wrote {len(rows)} questions to {out_path}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
