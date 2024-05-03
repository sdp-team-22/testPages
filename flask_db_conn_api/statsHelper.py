import psycopg2
from datetime import date
from connectionHelper import getCursor

# total data points
def getTotalRows(conn):
    cur = getCursor(conn)
    cur.execute("""
        SELECT COUNT(*) FROM solubility_data
    """)
    return cur.fetchone()[0]

# upload history
def getUploadHistory(conn):
    cur = getCursor(conn)
    cur.execute("""
        SELECT  id, scientist, time_uploaded, file_name, compound_name
        FROM filestore
        ORDER BY time_uploaded DESC
    """)
    return cur.fetchall()

# total number of user visits today
def getToday(conn):
    today = date.today()
    today = today.strftime("%m%d%Y")
    cur = getCursor(conn)
    # make multiple queries as needed
    cur.execute("""
        SELECT * FROM visits
        WHERE date = %s;
    """, (today, ))
    # print(cur.fetchone()[1])
    return cur.fetchone()[1]

# total number of user visits this month
def getMonth(conn):
    today = date.today()
    thisMonth = today.strftime("%m")
    thisYear = today.strftime("%Y")
    monthPattern = f"%{thisMonth}%%{thisYear}"
    cur = getCursor(conn)
    # make multiple queries as needed
    cur.execute("""
        SELECT * FROM visits
        WHERE date LIKE %s;
    """, (monthPattern, ))
    sum = 0
    for element in cur.fetchall():
        sum += element[1]
    # print(sum)
    return sum

# total number of user visits this year
def getYear(conn):
    today = date.today()
    thisYear = today.strftime("%Y")
    yearPattern = f"%%{thisYear}"
    cur = getCursor(conn)
    # make multiple queries as needed
    cur.execute("""
        SELECT * FROM visits
        WHERE date LIKE %s;
    """, (yearPattern, ))
    sum = 0
    for element in cur.fetchall():
        sum += element[1]
    # print(sum)
    return sum

def incrementToday(conn):
    today = date.today()
    today = today.strftime("%m%d%Y")
    cur = getCursor(conn)
    # check if today exists
    cur.execute("""
        SELECT * FROM visits
        WHERE date = %s;
    """, (today, ))
    temp = cur.fetchall()
    if len(temp):
        # print("exists")
        visitsToday = temp[0][1]
        visitsToday += 1
        cur.execute("""
            UPDATE visits
            SET visits = %s
            WHERE date = %s;
        """, (visitsToday, today))
        conn.commit()
    else:
        # doesn't exist
        print("doesn't exist")
        cur.execute("""
            INSERT INTO VISITS(date, visits)
            VALUES (%s, 1);
        """, (today, ))
        conn.commit()

def database_stats(conn):
    # Fetch total data points
    try:
        data_points = getTotalRows(conn)
        upload_history = getUploadHistory(conn)
        daily_visits = getToday(conn)
        monthly_visits = getMonth(conn)
        return data_points, upload_history, daily_visits, monthly_visits
    except Exception as e:
        print('Error database_stats:', e)
        return -1, [], -1, -1

if __name__=="__main__":
    conn = psycopg2.connect(
        database="postgres",
        user="sdp-dev",
        password="sdp123",
        host="24.62.166.59",
        port="5432"
    )
    getToday(conn)
    getMonth(conn)
    getYear(conn)
    incrementToday(conn)