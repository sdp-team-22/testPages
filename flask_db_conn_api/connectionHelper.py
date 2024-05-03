import psycopg2
import time

database = "test-fresh"
user = "sdp-dev"
password = "sdp123"
host = "24.62.166.59"
port = "5432"

def getConn():
    try:
        conn = psycopg2.connect(
            database=database,
            user=user,
            password=password,
            host=host,
            port=port
        )
        return conn
    except Exception as e:
        print("Intitial DB connection failed:", e)
        # db connection failure, retry connection every 10 sec
        while True:
            # sleep for 10 seconds before retrying connection
            time.sleep(10)
            # try to make connection
            try:
                conn = psycopg2.connect(
                    database=database,
                    user=user,
                    password=password,
                    host=host,
                    port=port
                )
                return conn
            except Exception as e:
                print("Initial DB connection failed:", e)

def getCursor(conn):
    try:
        # try to get a cursor from db connection
        cur = conn.cursor()
        return cur
    except Exception as e:
        print("DB connection failed:", e)
        # db connection failure, retry connection every 10 sec
        while True:
            # sleep for 10 seconds before retrying connection
            time.sleep(10)
            # close current conn
            try:
                if conn:
                    conn.close()
            except Exception as e:
                pass
            # open new conn
            try:
                conn = psycopg2.connect(
                    database=database,
                    user=user,
                    password=password,
                    host=host,
                    port=port
                )
                cur = conn.cursor()
                # automatically kicks out of loop if cur is successful
                return cur
            except Exception as e:
                print("DB connection failed:", e)
                pass