import json
from flask import Flask, jsonify, request
from flask import render_template

import sqlite3 as db

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
    pass


@app.route('/api/get_report', methods=['GET'])
def get_report():
    # temparily here as a placeholder
    analysis_result = [{"hehe":1,"haha":2},{"hehe":1,"haha":2},{"hehe":1,"haha":2}]
    return jsonify(analysis_result)


#=================================== RUN APP =========================================
if __name__ == '__main__':
    app.run(port=5000)