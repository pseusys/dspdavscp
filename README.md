# Distributed Similar Project Data Analysis Visual Studio Code Plugin


Use Case:
analysis of assignments

ASSUMPTIONS:
1. no fancy extensions to run the code, all code is run on integrated terminal only
2. DO NOT CHANGE FILE NAME aka file name is consistent for all students 

What kind of data (json) to transmit from extension to server?
* email of the student
* file name
* active coding time aka: the time the project is opened
* run time
* line differences
* line number and the number of modifications per line
* line number most modified >> defined as the line number that is modified 1/3 of the time at least
* terminal outputs of error
* total number of times a file was run in terminal
* (if possible)ctrl+c ctrl+v frequency

end result report should include:
1. rank student hard-workingness 
	>> project open time, no. of saves, no. times it is run << preset it first, make it variate later
2. top 10 most challenging lines of code
3. top 5 most common error message received
4. avg time spent on project
5. average time code executed



this is the api specification
the endpoints and the json string format to be parsed

for the record:
log is a json string with the following data:
{
    'email': email of the person,
    'details': {
        'file_name': file name,
        'stats':{
            'active_coding_time': the active coding time of user (in seconds),
            'run_time': time spend in running program in terminal (in seconds),
            'num_save': number of time the file is saved,
            'error': [{line_num: the line number, 'error_details': the error that occured}],
            'line_num_most_modify': (line number most modifies (1/3 of the time modify this line))
        }
    }
}

endpoints and examples:
the dashboard:
http://127.0.0.1:5000/

to pass data into server:
http://127.0.0.1:5000/report/
log is a json object

e.g. http://127.0.0.1:5000/report/
PLEASE HAVE IT DDOUBLE QUOTED
json_log = {
    "email": "hehehaha@mail.com",
    "files": [
        {
            "path": "function1.cpp",
            "codeTime": 1000000,
            "saveNumber": 100,
            "linesModified": {"1":5,"6":4},
        },
        {
            "path": "function2.cpp",
            "codeTime": 10000,
            "saveNumber": 7,
            "linesModified": {"1":5,"6":4},
        }
    ],
    "codeTime": 178878758,
    "runTime": 6,
    "saveNumber": 34,
    "errorOutputs": ["Segmentation fault", "Runtime error"]
}

