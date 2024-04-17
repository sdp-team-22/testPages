import psycopg2

def printData(cur):
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM solubility_data        
    """)
    data = cur.fetchall()
    for row in data:
        print(row, "\n")

def uploadMultiple(conn, data):
    cur = conn.cursor()
    projectInfo = data['projectInfo']
    for i in range(len(data['rowData'])):
        # get projectInfo
        fileName = getFromDICT(projectInfo, 'fileName')
        projectName = getFromDICT(projectInfo, 'projectName')
        scientistName = getFromDICT(projectInfo, 'scientistName')
        molecularWeight = getFromDICT(projectInfo, 'molecularWeight')
        compoundName = getFromDICT(projectInfo, 'compoundName')
        solidForm = getFromDICT(projectInfo, 'solidForm')
        tmelt = getFromDICT(projectInfo, 'Tmelt')
        hfus = getFromDICT(projectInfo, 'Hfus')
        # get rowData
        row = data['rowData'][i]
        comments = getFromDICT(row, 'Comments')
        eln = getFromDICT(row, 'ELN/Sample Number of Measurements')
        mm = getFromDICT(row, 'Measurement Method')
        lot = getFromDICT(row, 'Solute Lot Number')
        volfrac1 = getFromDICT(row, 'SolvFrac1_volfrac')
        volfrac2 = getFromDICT(row, 'SolvFrac2_volfrac')
        volfrac3 = getFromDICT(row, 'SolvFrac3_volfrac')
        wtfrac1 = getFromDICT(row, 'SolvFrac1_wtfrac')
        wtfrac2 = getFromDICT(row, 'SolvFrac2_wtfrac')
        wtfrac3 = getFromDICT(row, 'SolvFrac3_wtfrac')
        solv1 = getFromDICT(row, 'Solvent 1')
        solv2 = getFromDICT(row, 'Solvent 2')
        solv3 = getFromDICT(row, 'Solvent 3')
        temp = getFromDICT(row, 'Temp')
        xrpd = getFromDICT(row, 'XRPD')
        solu1 = getFromDICT(row, 'mg/g soln.')
        solu2 = getFromDICT(row, 'mg/g solv.')
        solu3 = getFromDICT(row, 'mg/mL solv.')
        solu4 = getFromDICT(row, 'wt %')
        cur.execute("""
            SELECT * FROM solubility_data
            WHERE compound_name = %s
            AND solvent_1 = %s
            AND solvent_2 = %s
            AND solvent_3 = %s
        """, (compoundName,
            solv1,
            solv2,
            solv3))
        response = cur.fetchall()
        if response:
            try:
                id = response[0][0]
                # print(f'exists in db with id = {id}')
                # exists already, we need to update entry
                cur.execute("""
                    UPDATE solubility_data
                    SET id = %s,
                        file_name = %s,
                        project_name = %s,
                        scientist_name = %s,
                        molecular_weight = %s,
                        solid_form = %s,
                        tmelt = %s,
                        hfus = %s,
                        volfrac1 = %s,
                        volfrac2 = %s,
                        volfrac3 = %s,
                        wtfrac1 = %s,
                        wtfrac2 = %s,
                        wtfrac3 = %s,
                        temp = %s,
                        xrpd = %s,
                        solubility_mg_g_solvn = %s,
                        solubility_mg_g_solv = %s,
                        solubility_wt = %s,
                        "solubility_mg_mL_solv" = %s,
                        solute_lot_num = %s,
                        eln_sample_num_measure = %s,
                        measure_method = %s,
                        comments = %s
                    WHERE compound_name = %s
                        AND solvent_1 = %s
                        AND solvent_2 = %s
                        AND solvent_3 = %s
                """, (id,
                    fileName, 
                    projectName,
                    scientistName,
                    molecularWeight,
                    solidForm,
                    tmelt,
                    hfus,
                    volfrac1,
                    volfrac2,
                    volfrac3,
                    wtfrac1,
                    wtfrac2,
                    wtfrac3,
                    temp,
                    xrpd,
                    solu1,
                    solu2,
                    solu4,
                    solu3,
                    lot,
                    eln,
                    mm,
                    comments,
                    compoundName,
                    solv1,
                    solv2,
                    solv3))
                conn.commit()
            except Exception as e:
                print(e)
        else:
            # print("doesn't exist in db")
            # doesn't exist yet, we need to add the entry
            try:
                cur.execute("""
                    SELECT max(id) FROM solubility_data;
                """)
                response = cur.fetchone()[0]
                if response is None:
                    response = -1
                newID = response + 1
                cur.execute("""
                    INSERT INTO solubility_data VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                        %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    newID,
                    fileName, 
                    projectName,
                    scientistName,
                    compoundName,
                    molecularWeight,
                    solidForm,
                    tmelt,
                    hfus,
                    solv1,
                    solv2,
                    solv3,
                    volfrac1,
                    volfrac2,
                    volfrac3,
                    wtfrac1,
                    wtfrac2,
                    wtfrac3,
                    temp,
                    xrpd,
                    solu1,
                    solu2,
                    solu4,
                    solu3,
                    lot,
                    eln,
                    mm,
                    comments
                ))
                conn.commit()
            except Exception as e:
                print(e)

def getFromDICT(data, searchTerm):
    temp = data.get(searchTerm, None)
    floatColumns = {'SolvFrac1_wtfrac', 'SolvFrac2_wtfrac', 'SolvFrac3_wtfrac', 'SolvFrac1_volfrac', 'SolvFrac2_volfrac', 'SolvFrac3_volfrac', 'Solute Lot Number', 'ELN/Sample Number of Measurements'}
    if temp is None:
        if searchTerm in floatColumns:
            temp = 0.0
        else:
            temp = 'nan'
    return temp

if __name__=="__main__":
    conn = conn = psycopg2.connect(
        database="postgres",
        user="sdp-dev",
        password="sdp123",
        host="24.62.166.59",
        port="5432"
    )
    # printData(conn)

    data = {'projectInfo': {'fileName': 'D1_new_vol1.xlsx', 'projectName': 'XYZi / BI123456', 'scientistName': 'Paul Larson', 'molecularWeight': 530.3, 'compoundName': 'BI123456 XX', 'solidForm': 'Form III', 'Tmelt': 200.4, 'Hfus': 30.1}, 'rowData': [{'Comments': 'nan', 'ELN/Sample Number of Measurements': 'nan', 'Measurement Method': 'nan', 'Solute Lot Number': 'nan', 'SolvFrac1_volfrac': 1, 'SolvFrac2_volfrac': 0, 'SolvFrac3_volfrac': 0, 'Solvent 1': 'Ethyl acetate', 'Solvent 2': 'nan', 'Solvent 3': 'nan', 'Status': 'OK', 'Temp': 25, 'XRPD': 'Form III', 'mg/g soln.': 40.307, 'mg/g solv.': 42, 'mg/mL solv.': 37.884, 'wt %': 4.031}]}
    # uploadMultiple(conn, data)