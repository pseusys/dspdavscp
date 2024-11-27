from time import time
from typing import Dict

from openapi_server.models.report import Report

import db_handler as db


def healthcheck():
    return "", 200


def report(report: Dict):
    if db.dbinsert(Report.from_dict(report), time()):
        return "Upload success", 200
    return "Report malformed", 422
