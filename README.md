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
