from connexion import FlaskApp
from connexion.resolver import RelativeResolver

from flask import jsonify, request
from flask import render_template, redirect

from serv.openapi_server.encoder import JSONEncoder

import db_handler as db

# start point of the app
app = FlaskApp(__name__, specification_dir="serv/openapi_server/openapi/")
app.app.json_provider_class = JSONEncoder

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
    return redirect(url_for('index'))

#============================= smth else ======================================

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

app.add_api("openapi.yaml", arguments={"title": "DSPDAVSCP"}, resolver=RelativeResolver("api"), pythonic_params=True, strict_validation=True, resolver_error=501)
if __name__ == '__main__':
    app.run(port=5000, debug=True)
