import json
from sqlalchemy import or_
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from flask_sqlalchemy import SQLAlchemy
import logging
from helper import file_excel_to_json1, file_excel_to_json, get_engine, get_db_session, create_new_solubility_data_entry

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://sdp-dev:sdp123@24.62.166.59:5432/postgres'
db = SQLAlchemy(app)

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
    cur.execute("""
        SELECT COUNT(*) solubility_mg_g_solvn 
        FROM solubility_data
    """)
    data_points = cur.fetchone()[0]

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
    

    return data_points, upload_history, daily_visits, monthly_visits
@app.route('/api/data', methods=['GET'])
def get_data():
    data_points, upload_history, daily_visits, monthly_visits = database_stats()

    return jsonify({
        'data_points':data_points,
        'upload_history':upload_history,
        'daily_visits':daily_visits,
        'monthly_visits':monthly_visits
                    })

class solubility_data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    compound_name = db.Column(db.String(200))
    solvent_1 = db.Column(db.String(100))
    solvent_2 = db.Column(db.String(100))
    solvent_3 = db.Column(db.String(100))
    xrpdf = db.Column(db.String(100))
    temp = db.Column(db.Float)
    volfrac1 = db.Column(db.Float)
    volfrac2 = db.Column(db.Float)
    volfrac3 = db.Column(db.Float)
    wtfrac1 = db.Column(db.Float)
    wtfrac2 = db.Column(db.Float)
    wtfrac3 = db.Column(db.Float)
    solubility_mg_g_solvn = db.Column(db.Float)
    solubility_mg_g_solv = db.Column(db.Float)
    solubility_mg_mL_solv = db.Column(db.Float)
    solubility_wt = db.Column(db.Float)

    def serialize(self):
        return {
            'id': self.id,
            'compound_name': self.compound_name,
            'solvent_1': self.solvent_1,
            'solvent_2': self.solvent_2,
            'solvent_3': self.solvent_3,
            'xrpdf': self.xrpdf,
            'temp': self.temp,
            'volfrac1': self.volfrac1,
            'volfrac2': self.volfrac2,
            'volfrac3': self.volfrac3,
            'wtfrac1': self.wtfrac1,
            'wtfrac2': self.wtfrac2,
            'wtfrac3': self.wtfrac3,
            'solubility_mg_g_solvn': self.solubility_mg_g_solvn,
            'solubility_mg_g_solv': self.solubility_mg_g_solv,
            'solubility_mg_mL_solv': self.solubility_mg_mL_solv,
            'solubility_wt': self.solubility_wt
        }

@app.route('/api/basicSearch', methods=[ 'GET' ,'POST', 'OPTIONS'])
def basic_search():
        search_query = request.args.get('query')
        query = solubility_data.query.filter(solubility_data.compound_name.ilike(search_query)) 
        # query = solubility_data.query.filter(solubility_data.compound_name == search_query) #ilike will work better for case insensitive search, but both works fine
        results = [record.serialize() for record in query.all()]
        return jsonify(results)

@app.route('/api/advancedSearch', methods=[ 'GET' ,'POST', 'OPTIONS'])
def advancedSearch():
    search_query = request.args.get('query')
    if not search_query:
        return jsonify({'error': 'No search criteria provided'}), 400

    search_criteria = json.loads(search_query)

    query = solubility_data.query
    for key, value in search_criteria.items():
        if key == 'field':
            continue
        if key == 'compound_name' and value:
            query = query.filter(solubility_data.compound_name.ilike(f'%{value}%'))
        elif key == 'xrpdf' and value:
            query = query.filter(solubility_data.xrpdf == value)
        elif key.startswith('solvent_') and value:
            solvent_number = int(key.split('_')[1])
            solvent_filters = []
            for i in range(1, 4):
                solvent_key = f'solvent_{i}'
                solvent_column = getattr(solubility_data, solvent_key)
                solvent_filters.append(solvent_column == value)
            query = query.filter(or_(*solvent_filters))
            
    results = [record.serialize() for record in query.all()]
    return jsonify(results)

@app.route('/api/upload', methods=['GET', 'POST'])
def api_upload():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'})

    uploaded_files = request.files.getlist('files')

    data = []
    for f in uploaded_files:
        data.append(file_excel_to_json1(f))
    # print(jsonify(data))
    # print(data)
    return jsonify(data)


USERNAME = "sdp-dev"
PASSWORD = "sdp123"
HOSTNAME = "24.62.166.59"
DBNAME = "postgres"
@app.route('/api/db_upload', methods=['POST'])
def database_upload():
    #Upload to database
    try:
        data = request.get_json()[0]
        engine = get_engine(
            username= USERNAME,
            password= PASSWORD,
            hostname= HOSTNAME,
            dbname = DBNAME
        )
        session = get_db_session(engine)
        
        #print(json.dumps(data, indent=1))

        create_new_solubility_data_entry(
        session= session,
        data= data
        )
        session.close()
            
    except Exception as e:
        return jsonify("failed")
    
    return jsonify("success")


if __name__ == '__main__':
    app.run(debug=True)
