from connexion import FlaskApp

from flask import jsonify, request, url_for
from flask import render_template, redirect

from .analyze import analysis
from .db_handler import alterCoefficient


def _index():
    analysis_report = analysis()
    return render_template('home.html',report=analysis_report)


def _change_cof():
    a = request.form.get("a")
    b = request.form.get("b")
    c = request.form.get("c")
    alterCoefficient(a, b, c)
    return redirect(url_for('index'))


def _get_report():
    analysis_result = analysis()
    return jsonify(analysis_result)


def apply_rules(app: FlaskApp):
    app.add_url_rule("/", "index", _index, methods=["GET"])
    app.add_url_rule("/cc", "change_cof", _change_cof, methods=["POST"])
    app.add_url_rule("/get_report", "get_report", _get_report, methods=["GET"])
