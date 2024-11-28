import ast

from .db_handler import db_init, fetchabc


def analysis():
    # connect to db
    conn, cursor = db_init()
    # analysis of the data
    # 1. general stat 
    # >>> chart analysis, numerical
    # 1a. average time spent on project
    data = [p[0] for p in cursor.execute('SELECT code_time FROM log').fetchall()]
    global_avg_time = (sum(data) / len(data)) if len(data) > 0 else 0

    # 1b. average time code executed
    data = [p[0] for p in cursor.execute('SELECT run_time FROM log').fetchall()]
    global_run_time = (sum(data) / len(data)) if len(data) > 0 else 0

    # 2. details 
    # 2a. ranking of student's hardworkingness (or struggling)
    # default formula: (a)codeTime + (b)runTime + (c)totalLinesModified
    a, b, c = fetchabc()
    # a,b,c = (1,1,1)
    dataPT1 = cursor.execute('SELECT email, SUM(code_time), SUM(run_time) FROM log GROUP BY email').fetchall()
    # make this into a dict
    record = {}
    for i in dataPT1:
        record[i[0]] = [i[1],i[2],0]

    dataPT2 = cursor.execute('SELECT email, files FROM log').fetchall()
    dataPT2_cleaned0 = [ast.literal_eval(x[1]) for x in dataPT2]
    dataPT2_email = [x[0] for x in dataPT2]
    dataPT2_cleaned = [sum(y["lines_modified"].values()) for sublist in dataPT2_cleaned0 for y in sublist]
     
    ranking = {}
    # zip them and loop to be added to a dict key is email??
    for (email,count) in zip(dataPT2_email,dataPT2_cleaned):
        record[email][2] += count
     
    for email, data in record.items():
        ranking[email] = a*data[0]/1000 + b*data[1]/1000 + c*data[2]
     
    ranking_2a = sorted(ranking.items(), key=lambda x: x[1], reverse=True)

    # 2b. top 10 most challenging lines of code
    analysis2b = {}
    for sublist in dataPT2_cleaned0:
        for entry in sublist:
            path = entry["path"]
            for (line,count) in entry["lines_modified"].items():
                key = f"{path}, line {line}"
                if key in analysis2b:
                    analysis2b[key] += count
                else:
                    analysis2b[key] = count

    ranking_2b = sorted(analysis2b.items(), key=lambda x: x[1], reverse=True)[:10]
     
    # 2c. top 5 most common error message received
    error_raw = cursor.execute('SELECT error_output FROM log GROUP BY email').fetchall()
    error_clean = [ast.literal_eval(x[0]) for x in error_raw]
    error_clean2 = [x for sublist in error_clean for x in sublist]
    error_count = {}
    for i in error_clean2:
        if i in error_count:
            error_count[i] += 1
        else:
            error_count[i] = 1
    ranking_2c = sorted(error_count.items(), key=lambda x: x[1], reverse=True)[:5]

    # 2d. top 3 ctrl+c ctrl+v warrior suspects
    # formula: totalLinesModified/(codeTime*100) << intuitive thought : how many time per lines spent
    ranking_temp = {}
    for email, data in record.items():
        ranking_temp[email] = (data[0]/10000)/data[2]
    # intuitive thinking >> less time spent per line aka short time big mod = more ctrl c ctrl v
    ranking_2d = sorted(ranking_temp.items(), key=lambda x: x[1])[:3]

    cursor.close()
    conn.close()
    # form a more stuctured response
    return {'avg_coding_time':global_avg_time, "avg_run_time":global_run_time, "rank_hardworking":ranking_2a, "rank_challenging_lines":ranking_2b, "rank_error":ranking_2c, "rank_ctrlc_ctrlv":ranking_2d}
