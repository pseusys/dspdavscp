from random import choices, choice, randint
from string import ascii_lowercase, digits, printable
from typing import List
from uuid import uuid4

from serv.openapi_server.models import Report, FileReport

_USER_SUFFIX = 5
_PATH_PARTS = 4
_PATH_LENGTH = 7
_CODE_TIME = 25000
_RUN_TIME = 15000
_ONE_RUN = 3000
_SAVE_NUMBER = 150
_LINES_MODIFIED = 200
_MODIFIED_TIMES = 300
_ERROR_LENGTH = 1000


def _random_string(length: int) -> str:
    return "".join(choices(ascii_lowercase + digits, k=length))


def _random_string_multiline(length: int) -> str:
    return "".join(choices(printable, k=randint(1, length)))


def generate_fixtures(num: int, max_files: int = 10, max_lines: int = 15) -> List[Report]:
    report_list = list()

    users = [f"user+{_random_string(_USER_SUFFIX)}" for _ in range(num // 2)]
    paths = ["/".join(_random_string(_PATH_LENGTH) for _ in range(randint(1, _PATH_PARTS))) for _ in range(num)]

    for _ in range(num):
        r_id = str(uuid4())
        r_email = f"{choice(users)}@example.com"
        r_run_time = randint(0, _RUN_TIME)
        r_code_time = 0
        r_save_number = 0

        r_files = list()
        for _ in range(randint(0, max_files)):
            fr_path = choice(paths)
            fr_code_time = randint(1, _CODE_TIME)
            r_code_time += fr_code_time
            fr_save_number = randint(1, _SAVE_NUMBER)
            r_save_number += fr_save_number
            fr_lines_modified = dict()
            for _ in range(randint(1, max_lines)):
                fr_lines_modified.update({randint(1, _LINES_MODIFIED): randint(1, _MODIFIED_TIMES)})
            r_files.append(FileReport(fr_path, fr_code_time, fr_save_number, fr_lines_modified))

        r_error_outputs = list()
        for _ in range(r_run_time // _ONE_RUN):
            r_error_outputs.append(_random_string_multiline(_ERROR_LENGTH))

        report_list.append(Report(r_id, r_email, r_files, r_code_time, r_run_time, r_save_number, r_error_outputs))

    return report_list