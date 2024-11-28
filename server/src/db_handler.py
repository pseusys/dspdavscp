from pathlib import Path
import sqlite3

from openapi_server.models.report import Report


# initializes the database
def db_init():
     conn = sqlite3.connect('records.db')
     cursor = conn.cursor()
     return conn, cursor


# this creates the table
def db_create(drop: bool = False):
     if drop:
          Path("records.db").unlink(True)
     conn, cursor = db_init()

     # create a table
     cursor.execute('''CREATE TABLE IF NOT EXISTS log (
                         id INTEGER PRIMARY KEY,
                         email TEXT,
                         ts INTEGER,
                         files TEXT,
                         code_time INTEGER,
                         run_time INTEGER,
                         save_num INTEGER,
                         error_output TEXT
                    )''') 

     conn.commit()

     # create a table
     cursor.execute('''CREATE TABLE IF NOT EXISTS temp (
                         id INTEGER PRIMARY KEY,
                         a INTEGER,
                         b INTEGER,
                         c INTEGER
                    )''') 
     conn.commit()

     cursor.execute("DELETE FROM temp")
     conn.commit()

     cursor.execute('INSERT INTO temp (a,b,c) VALUES (?,?,?)', (1,1,1))
     conn.commit()

     cursor.close()
     conn.close()


# handles inserts to db 
'''
data in the format of dictionary??????? since parse json
'''
def dbinsert(data: Report, ts):
     # check 
     conn, cursor = db_init()

     cursor.execute('INSERT INTO log (email,ts,files,code_time,run_time,save_num,error_output) VALUES (?,?,?,?,?,?,?)', (data.email, ts, str(data.files), data.code_time, data.run_time, data.save_number, str(data.error_outputs)))
     
     conn.commit()
     cursor.close()
     conn.close()
     return 1


def dbfetch(email):
     conn, cursor = db_init()

     cursor.execute('SELECT * FROM log WHERE email = ?', (email))
     data = cursor.fetchall()

     cursor.close()
     conn.close()

     return data


def dbfetchall():
     conn, cursor = db_init()

     cursor.execute('SELECT * FROM log')
     data = cursor.fetchall()

     cursor.close()
     conn.close()

     return data


def fetchabc():
     conn, cursor = db_init()

     cursor.execute('SELECT * FROM temp')
     abc = cursor.fetchall()

     cursor.close()
     conn.close()

     return abc[0][0], abc[0][1], abc[0][2]


def alterCoefficient(na,nb,nc):
     conn, cursor = db_init()

     cursor.execute('UPDATE temp SET a = ?, b = ?, c = ? ',(na,nb,nc))
     conn.commit()
     cursor.close()
     conn.close()
     return
