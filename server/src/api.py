from time import time
from typing import Dict

from openapi_server.models.report import Report

import src.db_handler as db


def healthcheck():
    return "", 200


def report(body: Dict):
    if db.dbinsert(Report.from_dict(body), time()):
        return "Upload success", 200
    return "Report malformed", 422
