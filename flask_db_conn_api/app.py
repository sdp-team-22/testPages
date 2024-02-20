from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

def database_storage():
    conn = psycopg2.connect(
        database="postgres",
        user="sdp-dev",
        password="sdp123",
        host="24.62.166.59",
        port="5432"
    )
    cur = conn.cursor()
    # make multiple queries as needed
    cur.execute("SELECT pg_size_pretty(pg_database_size('postgres')) AS size") 
    db_storage = cur.fetchone()[0]
    
    cur.close()
    conn.close()

    return db_storage
@app.route('/api/db_storage')
def api_db_storage():
    db_storage = database_storage()

    return jsonify(db_storage)

if __name__ == '__main__':
    app.run(debug=True)
