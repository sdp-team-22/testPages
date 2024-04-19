import json
from sqlalchemy import or_, and_
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from flask_sqlalchemy import SQLAlchemy
import logging
from helper import file_excel_to_json, find_duplicates

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)


app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://sdp-dev:sdp123@24.62.166.59:5432/postgres'
db = SQLAlchemy(app)

conn = conn = psycopg2.connect(
        database="postgres",
        user="sdp-dev",
        password="sdp123",
        host="24.62.166.59",
        port="5432"
    )
cur = conn.cursor()

def database_stats():
    # Fetch total data points
    try:
        from statsHelper import getTotalRows
        data_points = getTotalRows(conn)
    except:
        print("app.py: total data points failed")

    # Fetch upload history
    try:
        from statsHelper import getUploadHistory
        upload_history = getUploadHistory(conn)
    except:
        print("app.py: upload history failed")

    # Fetch daily visits
    try:
        from statsHelper import getToday
        daily_visits = getToday(conn)
    except:
        print("app.py: daily visits failed")

    # Fetch monthly visits
    try:
        from statsHelper import getMonth
        monthly_visits = getMonth(conn)
    except:
        print("app.py: monthly visits failed")

    return data_points, upload_history, daily_visits, monthly_visits

@app.route('/api/updateVisits', methods=['POST'])
def updateVisits():
    try:
        from statsHelper import incrementToday
        # Call the incrementDaily() method
        incrementToday(conn)
        return jsonify('Visit count incremented successfully')
    except Exception as e:
        return jsonify(f'Error incrementing visit count: {e}')

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
    xrpd = db.Column(db.String(100))
    temp = db.Column(db.Float)
    volfrac1 = db.Column(db.Float)
    volfrac2 = db.Column(db.Float)
    volfrac3 = db.Column(db.Float)
    wtfrac1 = db.Column(db.Float)
    wtfrac2 = db.Column(db.Float)
    wtfrac3 = db.Column(db.Float)
    solubility_mg_g_solvn = db.Column(db.String(100))
    solubility_mg_g_solv = db.Column(db.String(100))
    solubility_mg_mL_solv = db.Column(db.String(100))
    solubility_wt = db.Column(db.String(100))
    file_name = db.Column(db.String(200))
    scientist_name = db.Column(db.String(200))
    solute_lot_num = db.Column(db.Float(200))
    eln_sample_num_measure = db.Column(db.Float(200))

    def serialize(self):
        return {
            'id': self.id,
            'compound_name': self.compound_name,
            'solvent_1': self.solvent_1,
            'solvent_2': self.solvent_2,
            'solvent_3': self.solvent_3,
            'xrpd': self.xrpd,
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
            'solubility_wt': self.solubility_wt,
            'file_name': self.file_name,
            'scientist_name': self.scientist_name,
            'solute_lot_num': self.solute_lot_num,
            'eln_sample_num_measure': self.eln_sample_num_measure
        }

@app.route('/api/basicSearch', methods=[ 'GET' ,'POST', 'OPTIONS'])
def basic_search():
        search_query = request.args.get('query')
        query = solubility_data.query.filter(solubility_data.compound_name.ilike(f'%{search_query}%')) 
        # query = solubility_data.query.filter(solubility_data.compound_name == search_query) #ilike will work better for case insensitive search, but both works fine
        results = [record.serialize() for record in query.all()]
        return jsonify(results)

@app.route('/api/advancedSearch', methods=[ 'GET' ,'POST', 'OPTIONS'])
def advancedSearch():
    search_query = request.args.get('query')
    if not search_query:
        return jsonify({'error': 'No search criteria provided'}), 400

    search_criteria = json.loads(search_query)
    if not search_criteria:
        return jsonify({'error': 'No search criteria provided'}), 400
    query = solubility_data.query
    for key, value in search_criteria.items():
        if key == 'field':
            continue
        if key == 'compound_name' and value:
            query = query.filter(solubility_data.compound_name.ilike(f'%{value}%'))
            print(query)
        elif key == 'xrpd' and value:
            query = query.filter(solubility_data.xrpd == value)
        elif key.startswith('solvent_') and value:
            solvent_number = int(key.split('_')[1])
            if search_criteria.get('solventMatch') == 'exact':
                solvent_filters = []
                for i in range(1, 4):
                    solvent_key = f'solvent_{i}'
                    solvent_column = getattr(solubility_data, solvent_key)
                    if i == solvent_number:
                        solvent_filter = solvent_column == value
                        query = query.filter(solvent_filter)
            elif search_criteria.get('solventMatch') == 'contains':
                solvent_filters = []
                for i in range(1, 4):
                    solvent_key = f'solvent_{i}'
                    solvent_column = getattr(solubility_data, solvent_key)
                    solvent_filters.append(solvent_column == value)
                query = query.filter(or_(*solvent_filters))
    results = [record.serialize() for record in query.all()]
    return jsonify(results)

@app.route('/api/grabAllCompounds', methods=['GET'])
def grabAllCompounds():
    from searchHelper import getAllCompoundNames
    return jsonify(getAllCompoundNames(conn))

@app.route('/api/grabAllXRPD', methods=['GET'])
def grabAllXRPD():
    from searchHelper import getAllXRPD
    return jsonify(getAllXRPD(conn))

@app.route('/api/grabAllSolvents', methods=['GET'])
def grabAllSolvents():
    from searchHelper import getAllSolvent
    return jsonify(getAllSolvent(conn))

@app.route('/api/basicSearch2', methods=['POST'])
def basicSearch2():
    from searchHelper import basicSearch2
    return jsonify(basicSearch2(conn, request.json.get('searchQuery')))

@app.route('/api/advancedSearch2', methods=['POST'])
def advancedSearch2():
    from searchHelper import advancedSearch2
    return jsonify(advancedSearch2(conn, request.json.get('searchQuery')))

@app.route('/api/constrainFilter', methods=['POST'])
def getConstrained():
    from searchHelper import search_restricted_form
    return search_restricted_form(conn, request.json)

@app.route('/api/upload', methods=['GET', 'POST'])
def api_upload_confirmation():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'})

    uploaded_files = request.files.getlist('files')

    data = []
    for f in uploaded_files:
        f_json = file_excel_to_json(f)
        row_dups = find_duplicates(f_json, conn)
        f_json['row_dups'] = row_dups
        data.append(f_json)
        
    # print(jsonify(data))
    # print(data)
    return jsonify(data)

def search_unique_form():
    try:
        # Fetch unique xrpd, compound names, and solvent options
        cur.execute("SELECT DISTINCT xrpd, compound_name, solvent_1, solvent_2, solvent_3 FROM solubility_data")
        all_options = cur.fetchall()

        # Separate options into individual lists
        xrpd_options = set()
        compound_name_options = set()
        solvent_1_options = set()
        solvent_2_options = set()
        solvent_3_options = set()
        solvent_combinations_options = set()

        for row in all_options:
            xrpd_options.add(row[0])
            compound_name_options.add(row[1])
            solvent_1_options.add(row[2])
            solvent_2_options.add(row[3])
            solvent_3_options.add(row[4])
            solvent_combinations_options.add(tuple(value if value != 'nan' else '' for value in row[2:5]))
        
        return {
            "xrpd_options": list(xrpd_options),
            "compound_name_options": list(compound_name_options),
            "solvent_1_options": list(solvent_1_options),
            "solvent_2_options": list(solvent_2_options),
            "solvent_3_options": list(solvent_3_options),
            "solvent_combinations_options": [list(combination) for combination in solvent_combinations_options]
        }
    except Exception as e:
        print("Error fetching options from the database:", e)
        return []
        
@app.route('/api/form', methods=['GET'])
def populate_form():
    options = search_unique_form()
    return jsonify(options)

@app.route('/api/db_upload', methods=['POST'])
def databaseUpload():
    try:
        from uploadHelper import uploadMultiple, uploadToFilestore
        data = request.get_json() # list of jsons
        for file in data:
            # print('\n', file, '\n')
            uploadToFilestore(conn, file)
            uploadMultiple(conn, file)
        return jsonify('upload successful')
    except Exception as e:
        print(e)
        return jsonify('it did not work')

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port= 5000,
        debug=True
    )
