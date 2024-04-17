import psycopg2
from datetime import date

# total data points
def getTotalRows(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT COUNT(*) FROM solubility_data
    """)
    return cur.fetchone()[0]

# upload history
def getUploadHistory(conn):
    cur = conn.cursor()
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
    cur = conn.cursor()
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
    cur = conn.cursor()
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
    cur = conn.cursor()
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
    cur = conn.cursor()
    # check if today exists
    cur.execute("""
        SELECT * FROM visits
        WHERE date = %s;
    """, (today, ))
    temp = cur.fetchall()
    if len(temp):
        # exists
        print("exists")
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