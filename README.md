# Distributed Similar Project Data Analysis Visual Studio Code Plugin

> by Aleksand Sergeev and Annie Wong

DSPDAVSCP is a distributed system for multiple developers work analysis.
The primary use cases should be e.g. a university or an online academy course, where multiple learners perform similar assignment based on the common starting code.
The DSPDAVSCP system facilitates their coding time, file modifications and errors analysis, that might be helpful in assignment evaluation or distributing hints.

## Assumptions

Current project version has several limitations that have to be taken into account.

1. **Starter code immutability**:  
    The analysis performed by DSPDAVSCP is based on exact file names and line numbers.
    It is important that the starter code file structure and primary app skeleton remains the same for all the participants, otherwise some of the analysis features might become less representative.
2. **Code execution in terminal**:  
    Apart from source code analysis, DSPDAVSCP also collects data about the code running time and results.
    The data is collected from _one active terminal session only_.
    That means, the code running using specific extensions, in multiple terminal windows simultaneously or in an external terminal will be ignored.

## Protocol

DSPDAVSCP uses 2-layer analysis system:

- First, user data is collected using a VSCode extension.
- Then (once in a while) it is analysed and transmitted to a remote server (belonging to a professor or a course supervisor).
- The server collects all the incoming reports and stores them in a database.
- Upon request, server performs analysis of all the data users have ever sent and presents results in form of a web page or JSON data.

## Client

The client VSCode extension can be configured with the following parameters:

- `userEmail`: The email that will be included into report (default: `user@example.com`)
- `remoteHost`: The DSPDAVSCP server URL (default: `http://localhost:35129`)
- `reportTimer`: Timeout of the report submission, in seconds (default: `900`, every 15 minutes)
- `projectPath`: Project source directories (starter code roots) to track (default: `.`, current directory)

> NB! In addition to the timeout, the report can be also sent manually (by clicking on the extension widget or by running a special command).
> It will also be sent right after extension initialization, before session termination and upon any configuration change.

The extension supports the following commands (can be executed by pressing `Ctrl+Shift+P` by default):

- `resetHost`: Retry connecting to the host specified by `remoteHost` setting
- `resetPaths`: Retry searching for the paths specified by `projectPath` setting
- `resetTimer`: Reset the timer specified by `reportTimer` setting
- `resendReport`: Resend the report

> NB! The extension also shows a status bar icon all the time, indicating its configuration status.
> According to this status different actions can be performed on click (see tooltip message).

The extension collects the following information:

- Time, when any document or notebook under any of the paths specified by the `projectPath` setting is opened
- Modified line numbers, when any document or notebook under any of the paths specified by the `projectPath` setting is changed
- Nothing, when any document or notebook under any of the paths specified by the `projectPath` setting is saved
- Time, when any document or notebook under any of the paths specified by the `projectPath` setting is closed
- Time, when the integrated terminal starts running a command (if it is not already running something)
- Time, when the integrated terminal finishes running a command (if it is not already running something)
  - Error message if it finished running with an error

Upon sending of the report (either by timeout or manually), it processes the collected data in the following way:

- All the numeric data is sent unchanges
- The file-related reports are sorted by `score` and top-25 files are taken; the score is calculated like this:
    $$score = \frac{FMLN}{FLN} + \frac{FCT}{TCT} + \frac{FSN}{TSN}$$
    - `FMLN` stands for number of lines modified in this file
    - `FLN` stands for total number of lines in this file
    - `FCT` stands for the time this file was opened in editor
    - `TCT` stands for total time all project files were opened in editor
    - `FSN` stands for the number of times this file was saved
    - `TSN` stands for the total number of times all project files were saved
- For all the selected files, modified lines are sorted by the modifiaction number and top-25 are taken
- A non-max-suppression-like sorting algorithm is applied to the terminal error strings and top-25 of them are taken; the algorithm goes like this:
    - Cumulative levinshtein distance is calculated between all the error strnigs
    - The strings are sorted according to this distance, ascending (lowest distance means error lines that are **more similar** to all the others)
    - For all the lines, first one is taken, then all the other error strings, that are more than 70% similar to the taken one are discarded (similarity is calculated by levinshtein distance again, divided by the string length)

After that, the report is cleaned and all the data is erased.

> NB! In case you encounter any issues with the extension, please consult the development logs to gain an impression of its current status and past actions.

## DSPDAVSCP API

The report that clients send to the server specification can be viewed [here](https://rest.wiki/?https://raw.githubusercontent.com/pseusys/dspdavscp/refs/heads/main/DSPDAVSCPAPI.yaml).
It includes the following information:

- Report unique identifier
- Email address of the user (as a form of authentication)
- Total time all the files belonging to the projects were opened in VSCode (in milliseconds)
- Running time, one terminal window at a time (in milliseconds)
- Number of times all the files belonging to the projects were saved
- For all the project files modified (maximum 25, sorted):
  - File name (path relative to the project root)
  - Total time this particular file was opened in VSCode (in milliseconds)
  - Number of times this particular file was saved
  - For all the lines modified (maximum 25, sorted):
    - Line number
    - Number of times it was modified
- For all the unsuccessful terminal executions (maximum 25, sorted):
  - The error message printed to `stdout`

