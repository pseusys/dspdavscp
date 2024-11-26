import json
from flask import Flask, jsonify, request
from flask import render_template
import time

import danalysis as a
import db_handler as db
import helper_function as h

# start point of the app
app = Flask(__name__)

#============================= dashbaord route ======================================
@app.route('/')
def index():
    return render_template('home.html')


#======================= routing of the API endpoints ===============================
# posts the data into the db
@app.route('/api/postlog/<log>', methods=['POST'])
def postlog(log):
    # get time server obtained the request
    timestamp = int(time.time()) # I DONT CARE THAT NORMALLY IT IS A FLOAT MAN NO NEED TO HAVE SECOND PRECISION MAN
    data = h.process(log,timestamp)
    # store to db
    db.dbinsert(data)
    return


# get the report
# should be invoked when first enter page/ refresh page/ click the BUTTON!!!!!!!!!!!!!!!
@app.route('/api/get_report', methods=['GET'])
def get_report():
    # calls the function in danalysis.py 
    # temparily here as a placeholder
    analysis_result = [{"hehe":1,"haha":2},{"hehe":1,"haha":2},{"hehe":1,"haha":2}]
    return jsonify(analysis_result)


#=================================== RUN APP =========================================
if __name__ == '__main__':
    db.db_create()
    app.run(port=5000)