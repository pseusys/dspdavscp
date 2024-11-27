from connexion import FlaskApp
from serv.openapi_server import encoder
from serv.openapi_server.models import Report

from flask import jsonify, request
from flask import render_template, redirect
import time

import db_handler as db

# start point of the app
app = FlaskApp(__name__, specification_dir="serv/openapi_server/openapi/")
app.app.json_provider_class = encoder.JSONEncoder

#============================= dashbaord route ======================================
@app.route('/')
def index():
    analysis_report = db.analysis()
    return render_template('home.html',report=analysis_report)


@app.route('/cc', methods=['POST'])
def change_cof():
    a = request.form.get("a")
    b = request.form.get("b")
    c = request.form.get("c")
    db.alterCoefficient(a,b,c)
    return redirect('/')


#======================= routing of the API endpoints ===============================
# posts the data into the db
@app.route('/report', methods=['POST'])
def report(report: Report):
    # get time server obtained the request
    ts = int(time.time()) 
    # store to db
    log_data = request.json
    flag = db.dbinsert(log_data,ts)
    if flag:
        return '',200, {'msg': 'Upload success'}
    return '',422, {'msg': 'Report malformed'}


@app.route("/healthcheck")
def healthcheck():
    return "", 200

# get the report
# for testing
# should be invoked when first enter page/ refresh page/ click the BUTTON!!!!!!!!!!!!!!!
@app.route('/get_report', methods=['GET'])
def get_report():
    # calls the function in danalysis.py 
    # temparily here as a placeholder
    analysis_result = db.analysis()
    # need to reform the format a bit
    return jsonify(analysis_result)


#=================================== RUN APP =========================================
db.db_create()

app.add_api("openapi.yaml", arguments={"title": "DSPDAVSCP"}, pythonic_params=True)
if __name__ == '__main__':
    app.run(port=5000, debug=True)
