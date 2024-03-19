from flask import Flask, jsonify, request
from helper import file_excel_to_json1
from databaseOperation import database_search
from flask_cors import CORS
import psycopg2
import logging

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
        GROUP BY day, u.id, u.username
        ORDER BY day
    """)
    daily_visits = cur.fetchall()

    # Fetch monthly visits
    cur.execute("""
        SELECT DATE_TRUNC('month', f.time_uploaded) AS month, u.id AS user_id, u.username, COUNT(*) AS monthly_visits
        FROM filestore f
        JOIN users u ON f.owner_id = u.id
        GROUP BY month, u.id, u.username
        ORDER BY month
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

@app.route('/api/upload', methods=['GET', 'POST'])
def api_upload():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'})

    uploaded_files = request.files.getlist('files')

    data = []
    for f in uploaded_files:
        data.append(file_excel_to_json1(f))

    return jsonify(data)
   

    

    filenames = []
    for file in uploaded_files:
        if file.filename == '':
            return jsonify({'error': 'No selected file'})
        filenames.append(file.filename)

    return jsonify({'message': 'Files uploaded successfully', 'filenames': filenames})

@app.route('/api/search', methods = ['POST', 'GET'])
def api_search():
    upload_content = request.json

    dic = upload_content.get('Data', {})
    database_search(dic)
        
    return jsonify(upload_content)

if __name__ == '__main__':
    app.run(debug=True)
