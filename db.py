import sqlite3
import os

DB_NAME = 'baby_data.db'

def create_table():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS baby_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            baby_name_surname TEXT,
            age_months INTEGER,
            nurse_name_surname TEXT,
            head_circumference REAL,
            predicted_brain_weight REAL
        )
    ''')
    conn.commit()
    conn.close()

def insert_record(baby_name, age_months, nurse_name, head_circumference, predicted_brain_weight):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO baby_predictions (baby_name_surname, age_months, nurse_name_surname, head_circumference, predicted_brain_weight)
        VALUES (?, ?, ?, ?, ?)
    ''', (baby_name, age_months, nurse_name, head_circumference, predicted_brain_weight))
    conn.commit()
    conn.close()

def fetch_all_records():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM baby_predictions')
    rows = cursor.fetchall()
    conn.close()
    return rows

# Initialize table when module is loaded
create_table()
