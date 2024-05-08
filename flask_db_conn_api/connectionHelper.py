import psycopg2
import time
from psycopg2 import pool

database = "test-fresh"
user = "sdp-dev"
password = "sdp123"
host = "24.62.166.59"
port = "5432"



connection_pool = pool.SimpleConnectionPool(1, 100,
                                        database=database,
                                        user=user,
                                        password=password,
                                        host=host,
                                        port=port
                                    )

def getConn():
    try:
        # Acquire a connection from the pool
        conn = connection_pool.getconn()
        return conn
    except Exception as e:
        print("Error occurred while obtaining connection:", e)
        return None

# Release connection back to the pool
def releaseConn(conn):
    if conn:
        connection_pool.putconn(conn)

# Close all connections in the pool
def closePool():
    global connection_pool
    if connection_pool:
        connection_pool.closeall()