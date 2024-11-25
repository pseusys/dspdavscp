import json
from flask import Flask, jsonify, request
from flask import render_template
import db_handler as db
import time

import danalysis as a

# start point of the app
app = Flask(__name__)

#============================= dashbaord route ======================================
@app.route('/')
def index():
    return render_template('home.html')


#======================= routing of the API endpoints ===============================
@app.route('/api/postlog/<log>', methods=['POST'])
def postlog(log):
    # get time server obtained the request
    timestamp = int(time.time()) # I DONT CARE THAT NORMALLY IT IS A FLOAT MAN NO NEED TO HAVE SECOND PRECISION MAN
    data = (log['email'],timestamp,log['active_coding_time'],log['run_time'])
    # store to db
    db.dbinsert(data)
    return


@app.route('/api/get_report', methods=['GET'])
def get_report():
    # temparily here as a placeholder
    analysis_result = [{"hehe":1,"haha":2},{"hehe":1,"haha":2},{"hehe":1,"haha":2}]
    return jsonify(analysis_result)


#=================================== RUN APP =========================================
if __name__ == '__main__':
    app.run(port=5000)