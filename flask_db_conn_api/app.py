from flask import Flask, jsonify, request
from helper import file_excel_to_json1
from databaseOperation import database_search, database_stats
from flask_cors import CORS
import psycopg2
import logging

app = Flask(__name__)
CORS(app)

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

@app.route('/api/search', methods = ['POST', 'GET'])
def api_search():
    upload_content = request.json
    search_result = database_search(upload_content)
    return jsonify(search_result)

if __name__ == '__main__':
    app.run(debug=True)
