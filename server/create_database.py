'''
THIS IS JUST TO INIT THE DB 
MAY OR MAYNOT HAVE USE OH GOD
'''
import sqlite3

# start creation of the db
conn = sqlite3.connect('records.db')

# create cursor to execure *shivers* SQL statements
cursor = conn.cursor()

# create a table
cursor.execute('''CREATE TABLE IF NOT EXIST log (
                    id INTEGER PRIMARY KEY,
                    email TEXT,
                    ts INTEGER,
                    active_coding_time INTEGER,
                    run_time INTEGER
               )''')

conn.commit()
cursor.close()
conn.close()