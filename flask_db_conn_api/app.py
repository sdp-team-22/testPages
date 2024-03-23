from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from flask_sqlalchemy import SQLAlchemy
import logging

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://sdp-dev:sdp123@24.62.166.59:5432/postgres'
db = SQLAlchemy(app)

# def database_stats():
#     conn = psycopg2.connect(
#         database="postgres",
#         user="sdp-dev",
#         password="sdp123",
#         host="24.62.166.59",
#         port="5432"
#     )
#     cur = conn.cursor()
#     # make multiple queries as needed
#     cur.execute("SELECT pg_size_pretty(pg_database_size('postgres')) AS size") 
#     db_storage = cur.fetchone()[0]

#     # Fetch user upload history
#     cur.execute("""
#         SELECT  f.id, f.compound_name, u.username, f.time_uploaded
#         FROM filestore f
#         JOIN users u ON f.owner_id = u.id
#         ORDER BY f.time_uploaded DESC
#     """)
#     upload_history = cur.fetchall()

#     # Fetch daily visits
#     cur.execute("""
#         SELECT DATE_TRUNC('day', f.time_uploaded) AS day, u.id AS user_id, u.username, COUNT(*) AS daily_visits
#         FROM filestore f
#         JOIN users u ON f.owner_id = u.id
#         WHERE f.time_uploaded > CURRENT_DATE - INTERVAL '1 day'
#         GROUP BY day, u.id, u.username
#         ORDER BY day
#     """)
#     daily_visits = cur.fetchall()

#     # Fetch monthly visits
#     cur.execute("""
#         SELECT DATE_TRUNC('day', f.time_uploaded) AS day, u.id AS user_id, u.username, COUNT(*) AS daily_visits
#         FROM filestore f
#         JOIN users u ON f.owner_id = u.id
#         WHERE DATE_TRUNC('month', f.time_uploaded) = DATE_TRUNC('month', CURRENT_DATE)
#         GROUP BY day, u.id, u.username
#         ORDER BY day;
#     """)
#     monthly_visits = cur.fetchall()

#     cur.close()
#     conn.close()

#     return db_storage, upload_history, daily_visits, monthly_visits
# @app.route('/api/data', methods=['GET'])
# def get_data():
#     db_storage, upload_history, daily_visits, monthly_visits = database_stats()

#     return jsonify({
#         'db_storage':db_storage,
#         'upload_history':upload_history,
#         'daily_visits':daily_visits,
#         'monthly_visits':monthly_visits
#                     })

class solubility_data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    compound_name = db.Column(db.String(200))
    solvent_1 = db.Column(db.String(100))
    solvent_2 = db.Column(db.String(100))
    solvent_3 = db.Column(db.String(100))
    solid_form = db.Column(db.String(100))
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
            'solid_form': self.solid_form,
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
        query = solubility_data.query.filter(solubility_data.compound_name.ilike(f'%{search_query}%'))
        # query = solubility_data.query.filter(solubility_data.compound_name == search_query) #ilike will work better for insensitive search, but both works fine
        results = [record.serialize() for record in query.all()]
        return jsonify(results)

@app.route('/api/advancedSearch', methods=[ 'GET' ,'POST', 'OPTIONS'])
def advancedSearch():
    search_query = request.json()
    query = solubility_data.query
    if 'compound_name' in search_query:
        query = query.filter(solubility_data.compound_name.like(f'%{search_query["compound_name"]}%'))
    
    if 'solid_form' in search_query:
        query = query.filter(solubility_data.solid_form == search_query["solid_form"])

    if 'temp' in search_query:
        query = query.filter(solubility_data.temp == search_query["temp"])

    if 'solvent_1' in search_query:
        query = query.filter(solubility_data.solvent_1 == search_query["solvent_1"])

    if 'solvent_2' in search_query:
        query = query.filter(solubility_data.solvent_2 == search_query["solvent_2"])

    if 'solvent_3' in search_query:
        query = query.filter(solubility_data.solvent_3 == search_query["solvent_3"])

    results = [record.serialize() for record in query.all()]

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True)
