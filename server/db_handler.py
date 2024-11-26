import sqlite3
import json


# initializes the database
def db_init():
     conn = sqlite3.connect('records.db')
     cursor = conn.cursor()
     return conn, cursor


# this creates the table
def db_create():
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
     cursor.close()
     conn.close()


# handles inserts to db 
'''
data in the format of dictionary??????? since parse json
'''
def dbinsert(data,ts):
     # check 
     conn, cursor = db_init()

     cursor.execute('INSERT INTO log (email,ts,files,code_time,run_time,save_num,error_output) VALUES (?,?,?,?,?,?,?)', (data['email'],ts,str(data["files"]),data['codeTime'],data['runTime'],data['saveNumber'],str(data['errorOutputs'])))
     
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