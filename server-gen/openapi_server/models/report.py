from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from openapi_server.models.base_model import Model
from openapi_server.models.file_report import FileReport
from openapi_server import util

from openapi_server.models.file_report import FileReport  # noqa: E501

class Report(Model):
    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).

    Do not edit the class manually.
    """

    def __init__(self, id=None, email=None, files=None, code_time=None, run_time=None, save_number=None, error_outputs=None):  # noqa: E501
        """Report - a model defined in OpenAPI

        :param id: The id of this Report.  # noqa: E501
        :type id: str
        :param email: The email of this Report.  # noqa: E501
        :type email: str
        :param files: The files of this Report.  # noqa: E501
        :type files: List[FileReport]
        :param code_time: The code_time of this Report.  # noqa: E501
        :type code_time: int
        :param run_time: The run_time of this Report.  # noqa: E501
        :type run_time: int
        :param save_number: The save_number of this Report.  # noqa: E501
        :type save_number: int
        :param error_outputs: The error_outputs of this Report.  # noqa: E501
        :type error_outputs: List[str]
        """
        self.openapi_types = {
            'id': str,
            'email': str,
            'files': List[FileReport],
            'code_time': int,
            'run_time': int,
            'save_number': int,
            'error_outputs': List[str]
        }

        self.attribute_map = {
            'id': 'id',
            'email': 'email',
            'files': 'files',
            'code_time': 'codeTime',
            'run_time': 'runTime',
            'save_number': 'saveNumber',
            'error_outputs': 'errorOutputs'
        }

        self._id = id
        self._email = email
        self._files = files
        self._code_time = code_time
        self._run_time = run_time
        self._save_number = save_number
        self._error_outputs = error_outputs

    @classmethod
    def from_dict(cls, dikt) -> 'Report':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The Report of this Report.  # noqa: E501
        :rtype: Report
        """
        return util.deserialize_model(dikt, cls)

    @property
    def id(self) -> str:
        """Gets the id of this Report.

        Report unique identifier  # noqa: E501

        :return: The id of this Report.
        :rtype: str
        """
        return self._id

    @id.setter
    def id(self, id: str):
        """Sets the id of this Report.

        Report unique identifier  # noqa: E501

        :param id: The id of this Report.
        :type id: str
        """

        self._id = id

    @property
    def email(self) -> str:
        """Gets the email of this Report.

        Student email address  # noqa: E501

        :return: The email of this Report.
        :rtype: str
        """
        return self._email

    @email.setter
    def email(self, email: str):
        """Sets the email of this Report.

        Student email address  # noqa: E501

        :param email: The email of this Report.
        :type email: str
        """

        self._email = email

    @property
    def files(self) -> List[FileReport]:
        """Gets the files of this Report.

        Individual file reports  # noqa: E501

        :return: The files of this Report.
        :rtype: List[FileReport]
        """
        return self._files

    @files.setter
    def files(self, files: List[FileReport]):
        """Sets the files of this Report.

        Individual file reports  # noqa: E501

        :param files: The files of this Report.
        :type files: List[FileReport]
        """

        self._files = files

    @property
    def code_time(self) -> int:
        """Gets the code_time of this Report.

        Total coding time in milliseconds  # noqa: E501

        :return: The code_time of this Report.
        :rtype: int
        """
        return self._code_time

    @code_time.setter
    def code_time(self, code_time: int):
        """Sets the code_time of this Report.

        Total coding time in milliseconds  # noqa: E501

        :param code_time: The code_time of this Report.
        :type code_time: int
        """

        self._code_time = code_time

    @property
    def run_time(self) -> int:
        """Gets the run_time of this Report.

        Total running time in milliseconds  # noqa: E501

        :return: The run_time of this Report.
        :rtype: int
        """
        return self._run_time

    @run_time.setter
    def run_time(self, run_time: int):
        """Sets the run_time of this Report.

        Total running time in milliseconds  # noqa: E501

        :param run_time: The run_time of this Report.
        :type run_time: int
        """

        self._run_time = run_time

    @property
    def save_number(self) -> int:
        """Gets the save_number of this Report.

        Total number of times a file was saved  # noqa: E501

        :return: The save_number of this Report.
        :rtype: int
        """
        return self._save_number

    @save_number.setter
    def save_number(self, save_number: int):
        """Sets the save_number of this Report.

        Total number of times a file was saved  # noqa: E501

        :param save_number: The save_number of this Report.
        :type save_number: int
        """

        self._save_number = save_number

    @property
    def error_outputs(self) -> List[str]:
        """Gets the error_outputs of this Report.

        Top most frequent error messages  # noqa: E501

        :return: The error_outputs of this Report.
        :rtype: List[str]
        """
        return self._error_outputs

    @error_outputs.setter
    def error_outputs(self, error_outputs: List[str]):
        """Sets the error_outputs of this Report.

        Top most frequent error messages  # noqa: E501

        :param error_outputs: The error_outputs of this Report.
        :type error_outputs: List[str]
        """

        self._error_outputs = error_outputs