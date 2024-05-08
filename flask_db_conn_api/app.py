from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2, sqlalchemy
from helper import file_excel_to_json, find_duplicates
from solubility import Base as solubility_base
from connectionHelper import getConn, releaseConn

app = Flask(__name__)
CORS(app)
url = 'postgresql://sdp-dev:sdp123@24.62.166.59:5432/test-fresh'
app.config['SQLALCHEMY_DATABASE_URI'] = url

# create tables if they dont exist
engine = sqlalchemy.create_engine(url)
solubility_base.metadata.create_all(engine)


@app.route('/api/updateVisits', methods=['POST'])
def updateVisits():
    """
    Updates number of visits in database
    This is called every time Angular page is refreshed (app is accessed)
    """
    try:
        from statsHelper import incrementToday
        # Call the incrementDaily() method
        conn = getConn()
        incrementToday(conn)
        releaseConn(conn)
        return jsonify('Visit count incremented successfully')
    except Exception as e:
        return jsonify(f'Error incrementing visit count: {e}')

@app.route('/api/data', methods=['GET'])
def get_data():
    """
    Gets statistics from database
    This is called every time statistics page is accessed
    """
    from statsHelper import database_stats
    conn = getConn()
    data_points, upload_history, daily_visits, monthly_visits = database_stats(conn)
    releaseConn(conn)
    return jsonify({
        'data_points':data_points,
        'upload_history':upload_history,
        'daily_visits':daily_visits,
        'monthly_visits':monthly_visits
                    })

@app.route('/api/grabAllCompounds', methods=['GET'])
def grabAllCompounds():
    """
    Gets a list of all distinct compound names in the database
    """
    from searchHelper import getAllCompoundNames
    conn = getConn()
    res = jsonify(getAllCompoundNames(conn))
    releaseConn(conn)
    return res

@app.route('/api/grabAllRestricted', methods=['POST'])
def grabAllRestricted():
    """
    Gets options for filters in restrictive advanced search mode

    Parameters:
    request['filterContents']
        the current values selected in filter contents
    request['type']
        what the current filter type is, we will exclude the same type from restrictions
    request['exact']
        this is for solvent exact filters, because we need to know previous filter values
    """
    from searchHelper import getRestricted
    conn = getConn()
    res = jsonify(getRestricted(conn, request.json['filterContents'], request.json['type'], request.json['exact']))
    releaseConn(conn)
    return res

@app.route('/api/grabAllXRPD', methods=['GET'])
def grabAllXRPD():
    """
    Gets a list of all distinct XRPD in the database 
    """
    from searchHelper import getAllXRPD
    conn = getConn()
    res = jsonify(getAllXRPD(conn))
    releaseConn(conn)
    return res

@app.route('/api/grabAllSolvents', methods=['GET'])
def grabAllSolvents():
    """
    Gets a list of all distinct solvents in the database 
    """
    from searchHelper import getAllSolvent
    conn = getConn()
    res = jsonify(getAllSolvent(conn))
    releaseConn(conn)
    return res

@app.route('/api/basicSearch', methods=['POST'])
def basicSearch():
    """
    Does a basic search to the database on column 'compound_name'
    request.json['searchQuery']
        this is the search string (complete or partial compound name)
    """
    from searchHelper import basicSearch
    conn = getConn()
    res = jsonify(basicSearch(conn, request.json.get('searchQuery')))
    releaseConn(conn)
    return res

@app.route('/api/advancedSearch', methods=['POST'])
def advancedSearch():
    """
    Does the open advanced search to the database
        result = options from filter 1 + options from filter 2 + options from filter 3 + ...

    Parameters:
    request.json['searchQuery']
        these are the current filter values
    """
    from searchHelper import advancedSearch
    conn = getConn()
    res = advancedSearch(conn, request.json.get('searchQuery'))
    releaseConn(conn)
    return res

@app.route('/api/advancedSearchRestricted', methods=['POST'])
def advancedSearchRestricted():
    """
    Does the restricted advanced search to the database
        result = options from filter 1 & options from filter 2 & options from filter 3 & ...

    Parameters:
    request.json['searchQuery']
        these are the current filter values
    """
    from searchHelper import advancedSearchRestricted
    conn = getConn()
    res = advancedSearchRestricted(conn, request.json)
    releaseConn(conn)
    return res

@app.route('/api/constrainFilter', methods=['POST'])
def getConstrained():
    """
    Gets options for solvent exact in open advanced search
        the options returned are not restricted based on other filters, just current exact selection
    """
    from searchHelper import search_restricted_form
    conn = getConn()
    res = search_restricted_form(conn, request.json)
    releaseConn(conn)
    return res

@app.route('/api/deleteRow', methods=['POST'])
def deleteRow():
    """
    Deletes a row from the database based on the primary key
        pkey = cname, solv1, solv2, solv3, volfrac1, volfrac2, volfrac3, wtfrac1, wtfrac2, wtfrac3, temp, xrpd
    """
    from searchHelper import deleteRow
    conn = getConn()
    res = jsonify(deleteRow(conn, request.json['item']))
    releaseConn(conn)
    return res

@app.route('/api/upload', methods=['GET', 'POST'])
def api_upload_confirmation():
    """
    Gets rows in preliminary upload that are already in database
        This is used to recolor to specify repeats
    """
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'})

    uploaded_files = request.files.getlist('files')

    data = []
    conn = getConn()
    for f in uploaded_files:
        f_json = file_excel_to_json(f)
        row_dups = find_duplicates(f_json, conn)
        f_json['row_dups'] = row_dups
        data.append(f_json)
    releaseConn(conn)
    return jsonify(data)

@app.route('/api/db_upload', methods=['POST'])
def databaseUpload():
    """
    Uploads data to database
        Uploads to solubility_data table (for data)
        Uploads to file_store table (for stats)
    """
    try:
        from uploadHelper import uploadMultiple, uploadToFilestore
        data = request.get_json() # list of jsons
        conn = getConn()
        for file in data:
            # print('\n', file, '\n')
            uploadToFilestore(conn, file)
            uploadMultiple(conn, file)
        releaseConn(conn)
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
