import unittest

from flask import json

from openapi_server.models.report import Report  # noqa: E501
from openapi_server.test import BaseTestCase


class TestDefaultController(BaseTestCase):
    """DefaultController integration test stubs"""

    def test_upload_report(self):
        """Test case for upload_report

        Upload a new report
        """
        report = {"errorOutputs":["errorOutputs","errorOutputs"],"files":[{"path":"path","linesModified":"{}","codeTime":0,"saveNumber":6},{"path":"path","linesModified":"{}","codeTime":0,"saveNumber":6}],"codeTime":1,"id":"046b6c7f-0b8a-43b9-b35d-6489e6daee91","runTime":5,"email":"email","saveNumber":5}
        headers = { 
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/report',
            method='POST',
            headers=headers,
            data=json.dumps(report),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
