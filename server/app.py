import json
from flask import Flask, jsonify, request
from flask import render_template
import time

import danalysis as a
import db_handler as db

# start point of the app
app = Flask(__name__)

#============================= dashbaord route ======================================
@app.route('/')
def index():
    return render_template('home.html')


#======================= routing of the API endpoints ===============================
# posts the data into the db
@app.route('/report', methods=['POST'])
def report():
    # get time server obtained the request
    ts = int(time.time()) # I DONT CARE THAT NORMALLY IT IS A FLOAT MAN NO NEED TO HAVE SECOND PRECISION MAN
    # store to db
    log_data = request.json
    flag = db.dbinsert(log_data,ts)
    if flag:
        return '',200, {'msg': 'Upload success'}
    return '',422, {'msg': 'Report malformed'}


# get the report
# for testing
# should be invoked when first enter page/ refresh page/ click the BUTTON!!!!!!!!!!!!!!!
@app.route('/get_report', methods=['GET'])
def get_report():
    # calls the function in danalysis.py 
    # temparily here as a placeholder
    analysis_result = db.dbfetchall()
    return jsonify(analysis_result)


#=================================== RUN APP =========================================
db.db_create()
if __name__ == '__main__':
    app.run(port=5000, debug=True)