import sqlite3


# initializes the database
def db_init():
     conn = sqlite3.connect('records.db')
     cursor = conn.cursor()
     return conn, cursor


# this creates the table
def db_create():
     conn, cursor = db_init()

     # create a table
     cursor.execute('''CREATE TABLE IF NOT EXIST log (
                         id INTEGER PRIMARY KEY,
                         email TEXT,
                         ts INTEGER,
                         active_coding_time INTEGER,
                         run_time INTEGER
                    )''') # line differences, line num most modified

     conn.commit()
     cursor.close()
     conn.close()


# handles inserts to db 
'''
data in the format of dictionary??????? since parse json
'''
def dbinsert(data):
     conn, cursor = db_init()

     cursor.executemany('INSERT INTO log (email,ts,active_coding_time,run_time) VALUES (?,?,?,?)', data)

     conn.commit()
     cursor.close()
     conn.close()
     return
