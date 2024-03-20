from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

def database_stats():
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

    # Fetch user upload history
    cur.execute("""
        SELECT  f.id, f.compound_name, u.username, f.time_uploaded
        FROM filestore f
        JOIN users u ON f.owner_id = u.id
        ORDER BY f.time_uploaded DESC
    """)
    upload_history = cur.fetchall()

    # Fetch daily visits
    cur.execute("""
        SELECT DATE_TRUNC('day', f.time_uploaded) AS day, u.id AS user_id, u.username, COUNT(*) AS daily_visits
        FROM filestore f
        JOIN users u ON f.owner_id = u.id
        WHERE f.time_uploaded > CURRENT_DATE - INTERVAL '1 day'
        GROUP BY day, u.id, u.username
        ORDER BY day
    """)
    daily_visits = cur.fetchall()

    # Fetch monthly visits
    cur.execute("""
        SELECT DATE_TRUNC('day', f.time_uploaded) AS day, u.id AS user_id, u.username, COUNT(*) AS daily_visits
        FROM filestore f
        JOIN users u ON f.owner_id = u.id
        WHERE DATE_TRUNC('month', f.time_uploaded) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY day, u.id, u.username
        ORDER BY day;
    """)
    monthly_visits = cur.fetchall()

    cur.close()
    conn.close()

    return db_storage, upload_history, daily_visits, monthly_visits
@app.route('/api/data', methods=['GET'])
def get_data():
    db_storage, upload_history, daily_visits, monthly_visits = database_stats()

    return jsonify({
        'db_storage':db_storage,
        'upload_history':upload_history,
        'daily_visits':daily_visits,
        'monthly_visits':monthly_visits
                    })

if __name__ == '__main__':
    app.run(debug=True)
