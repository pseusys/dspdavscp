import connexion
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.report import Report  # noqa: E501
from openapi_server import util


def upload_report(report):  # noqa: E501
    """Upload a new report

     # noqa: E501

    :param report: 
    :type report: dict | bytes

    :rtype: Union[None, Tuple[None, int], Tuple[None, int, Dict[str, str]]
    """
    if connexion.request.is_json:
        report = Report.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
