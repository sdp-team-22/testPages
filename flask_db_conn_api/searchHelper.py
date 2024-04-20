import psycopg2

def getAllCompoundNames(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT(compound_name) FROM solubility_data
        WHERE compound_name != 'nan'
    """)
    return [t[0] for t in cur.fetchall()]

def getAllXRPD(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT(xrpd) FROM solubility_data
        WHERE xrpd != 'nan'
    """)
    return [t[0] for t in cur.fetchall()]

def getAllSolvent(conn):
    cur = conn.cursor()
    distinctSolvents = set()
    # go through solvent 1
    cur.execute("""
        SELECT DISTINCT(solvent_1) FROM solubility_data
        WHERE solvent_1 != 'nan'
    """)
    for element in cur.fetchall():
        distinctSolvents.add(element[0])
    # go through solvent 2
    cur.execute("""
        SELECT DISTINCT(solvent_2) FROM solubility_data
        WHERE solvent_2 != 'nan'
    """)
    for element in cur.fetchall():
        distinctSolvents.add(element[0])
    # go through solvent 3
    cur.execute("""
        SELECT DISTINCT(solvent_3) FROM solubility_data
        WHERE solvent_3 != 'nan'
    """)
    for element in cur.fetchall():
        distinctSolvents.add(element[0])
    return list(distinctSolvents)

keys = [
    'id', 'file_name', 'project_name', 
    'scientist_name', 'compound_name', 'molecular_weight', 
    'solid_form', 'tmelt', 'hfus', 
    'solvent_1', 'solvent_2', 'solvent_3', 
    'volfrac1', 'volfrac2', 'volfrac3', 
    'wtfrac1', 'wtfrac2', 'wtfrac3', 
    'temp', 'xrpd', 'solubility_mg_g_solvn', 
    'solubility_mg_g_solv', 'solubility_wt', 'solubility_mg_mL_solv', 
    'solute_lot_num', 'eln_sample_num_measure', 'measure_method', 
    'comments']

def basicSearch2(conn, searchQuery):
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT * FROM solubility_data
            WHERE LOWER(compound_name) LIKE LOWER(%s)
        """, ('%' + searchQuery + '%',))
        # Fetch and return the results
        temp = cur.fetchall()
        finalResult = []
        for i in range(len(temp)):
            tempResult = {key: value for key, value in zip(keys, temp[i])}
            finalResult.append(tempResult)
        return finalResult
    except Exception as e:
        for i in range(len(temp)):
            tempResult = {key: value for key, value in zip(keys, None)}
            finalResult.append(tempResult)
        return finalResult

def advancedSearch2(conn, searchQuery):
    cur = conn.cursor()
    compoundNames = searchQuery['Compound Name']
    xrpd = searchQuery['XRPD']
    solvExact = searchQuery['Solvent Exact']
    solvHas = searchQuery['Solvent Contains']
    result = []
    try:
        # query through compound names
        for name in compoundNames:
            cur.execute("SELECT * FROM solubility_data WHERE LOWER(compound_name) LIKE LOWER(%s)", ('%' + name + '%',))
            result.extend(cur.fetchall())
    except Exception as e:
        pass
    try:
        # query through xrpd
        for x in xrpd:
            cur.execute("SELECT * FROM solubility_data WHERE LOWER(xrpd) = LOWER(%s)", (x,))
            result.extend(cur.fetchall())
    except Exception as e:
        pass
    try:
        # query through exact solvent combinations
        for combination in solvExact:
            cleanCombo = [str(x) for x in combination if x is not None]
            print(cleanCombo)
            if len(cleanCombo) == 1:
                cur.execute("""
                    SELECT * FROM solubility_data 
                    WHERE (LOWER(solvent_1) = LOWER(%s) and solvent_2 = 'nan' and solvent_3 = 'nan')
                    OR (solvent_1 = 'nan' and LOWER(solvent_2) = LOWER(%s) and solvent_3 = 'nan')
                    OR (solvent_1 = 'nan' and solvent_2 = 'nan' and LOWER(solvent_3) = LOWER(%s))
                """, (cleanCombo[0], cleanCombo[0], cleanCombo[0],))
                result.extend(cur.fetchall())
            elif len(cleanCombo) == 2:
                cur.execute("""
                    SELECT * FROM solubility_data 
                    WHERE (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and solvent_3 = 'nan')
                    OR (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and solvent_3 = 'nan')
                    OR (LOWER(solvent_1) = LOWER(%s) and solvent_2 = 'nan' and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and solvent_2 = 'nan' and LOWER(solvent_3) = LOWER(%s))
                    OR (solvent_1 = 'nan' and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (solvent_1 = 'nan' and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                """, (cleanCombo[0], cleanCombo[1],
                    cleanCombo[1], cleanCombo[0],
                    cleanCombo[0], cleanCombo[1],
                    cleanCombo[1], cleanCombo[0],
                    cleanCombo[0], cleanCombo[1],
                    cleanCombo[1], cleanCombo[0],
                ))
                result.extend(cur.fetchall())
            elif len(cleanCombo) == 3:
                cur.execute("""
                    SELECT * FROM solubility_data 
                    WHERE (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and LOWER(solvent_2) = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                """, (cleanCombo[0], cleanCombo[1], cleanCombo[2],
                    cleanCombo[0], cleanCombo[2], cleanCombo[1],
                    cleanCombo[1], cleanCombo[0], cleanCombo[2],
                    cleanCombo[1], cleanCombo[2], cleanCombo[0],
                    cleanCombo[2], cleanCombo[0], cleanCombo[1],
                    cleanCombo[2], cleanCombo[1], cleanCombo[0],
                ))
                result.extend(cur.fetchall())
    except Exception as e:
        pass
    try:
        # now query through has any
        for solvent in solvHas:
            cur.execute("""
                SELECT * FROM solubility_data
                WHERE solvent_1 = %s
                OR solvent_2 = %s
                OR solvent_3 = %s
            """, (solvent, solvent, solvent))
            result.extend(cur.fetchall())
    except Exception as e:
        pass
    unique_rows = set(result)
    #set are not iterable 
    unique_rows = list(unique_rows)
    finalResult = []
    if len(unique_rows) == 0:
        for i in range(len(unique_rows)):
            tempResult = {key: value for key, value in zip(keys, None)}
            finalResult.append(tempResult)
        return finalResult
    for i in range(len(unique_rows)):
        tempResult = {key: value for key, value in zip(keys, unique_rows[i])}
        finalResult.append(tempResult)
    return finalResult

def test(conn):
    cur = conn.cursor()
    cleanCombo = ['2-Butanol', '1,2-Dimethoxyethane', 'Formic acid']
    cur.execute("""
                    SELECT * FROM solubility_data 
                    WHERE (LOWER(solvent_1) = LOWER(%s) and solvent_2 = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and solvent_2 = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and solvent_2 = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and solvent_2 = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and solvent_2 = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                    OR (LOWER(solvent_1) = LOWER(%s) and solvent_2 = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                """, (cleanCombo[0], cleanCombo[1], cleanCombo[2],
                    cleanCombo[0], cleanCombo[2], cleanCombo[1],
                    cleanCombo[1], cleanCombo[0], cleanCombo[2],
                    cleanCombo[1], cleanCombo[2], cleanCombo[0],
                    cleanCombo[2], cleanCombo[0], cleanCombo[1],
                    cleanCombo[2], cleanCombo[1], cleanCombo[0],
                ))
    cur.execute("""
                    SELECT * FROM solubility_data 
                    WHERE (LOWER(solvent_1) = LOWER(%s) and solvent_2 = LOWER(%s) and LOWER(solvent_3) = LOWER(%s))
                """, (
                    cleanCombo[1], cleanCombo[2], cleanCombo[0],
                ))
    cur.execute("""
                    SELECT * FROM solubility_data 
                    WHERE solvent_1 = '1,2-Dimethoxyethane'""")
    #cur.execute("""
    #                SELECT DISTINCT(solvent_1) FROM solubility_data where solvent_1 = '1,2-Dimethoxyethane';
    #            """)
    print(cur.fetchall())

def search_unique_form(cur):
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
    
def search_restricted_form(conn, selectedOptions):
    cur = conn.cursor()
    try:
        # Fetch unique xrpd, compound names, and solvent options
        # cur.execute("SELECT DISTINCT xrpd, compound_name, solvent_1, solvent_2, solvent_3 FROM solubility_data")
        # all_options = cur.fetchall()
        s0 = selectedOptions[0]
        if len(selectedOptions) == 1:
            cur.execute("""
                SELECT solvent_1, solvent_2, solvent_3 
                FROM solubility_data
                WHERE solvent_1 = %s
                OR solvent_2 = %s
                OR solvent_3 = %s
            """, (selectedOptions[0], selectedOptions[0], selectedOptions[0]))
            options = cur.fetchall()
            print(options)
        elif len(selectedOptions) == 2:
            s1 = selectedOptions[1]
            cur.execute("""
                SELECT solvent_1, solvent_2, solvent_3
                FROM solubility_data
                WHERE 
                    (solvent_1 = %s AND solvent_2 = %s) OR
                    (solvent_1 = %s AND solvent_2 = %s) OR
                    (solvent_1 = %s AND solvent_3 = %s) OR
                    (solvent_1 = %s AND solvent_3 = %s) OR
                    (solvent_2 = %s AND solvent_3 = %s) OR
                    (solvent_2 = %s AND solvent_3 = %s);
            """, (s0, s1, 
                  s1, s0, 
                  s0, s1, 
                  s1, s0, 
                  s0, s1, 
                  s1, s0, ))
            options = cur.fetchall()
            print(options)

        if len(selectedOptions) == 1:
            solvent_2_options = set()
            solvent_3_options = set()
            for option in options:
                if option[0] != s0 and option[0] != 'nan':
                    solvent_2_options.add(option[0])
                if option[1] != s0 and option[1] != 'nan':
                    solvent_2_options.add(option[1])
                if option[2] != s0 and option[2] != 'nan':
                    solvent_2_options.add(option[2])
            return {
                "solvent_2_options": list(solvent_2_options),
                "solvent_3_options": list(solvent_3_options)
            }
        else:
            solvent_3_options = set()
            for option in options:
                if option[0] != s0 and option[0] != s1 and option[0] != 'nan':
                    solvent_3_options.add(option[0])
                if option[1] != s0 and option[1] != s1 and option[1] != 'nan':
                    solvent_3_options.add(option[1])
                if option[2] != s0 and option[2] != s1 and option[2] != 'nan':
                    solvent_3_options.add(option[2])
            return {
                "solvent_3_options": list(solvent_3_options)
            }
    except Exception as e:
        print("Error in searchHelper.py:", e)

def deleteRow(conn, item):
    print(item)
    if (item['solvent_1'] == ''):
        item['solvent_1'] = 'nan'
    if (item['solvent_2'] == ''):
        item['solvent_2'] = 'nan'
    if (item['solvent_3'] == ''):
        item['solvent_3'] = 'nan'
    cur = conn.cursor()
    try:
        cur.execute("""
            DELETE FROM solubility_data
            WHERE 
                compound_name = %s
                AND solvent_1 = %s
                AND solvent_2 = %s
                AND solvent_3 = %s
                AND volfrac1 = %s
                AND volfrac2 = %s
                AND volfrac3 = %s
                AND wtfrac1 = %s
                AND wtfrac2 = %s
                AND wtfrac3 = %s
                AND temp = %s
                AND xrpd = %s
        """, (
            item['compound_name'],
            item['solvent_1'],
            item['solvent_2'],
            item['solvent_3'],
            item['volfrac1'],
            item['volfrac2'],
            item['volfrac3'],
            item['wtfrac1'],
            item['wtfrac2'],
            item['wtfrac3'],
            item['temp'],
            item['xrpd'],
        ))
        conn.commit()
        return 'Deleted successfully from database'
    except Exception as e:
        print(e)
        return 'Failed to delete from database'


if __name__ == "__main__":
    conn = conn = psycopg2.connect(
        database="postgres",
        user="sdp-dev",
        password="sdp123",
        host="24.62.166.59",
        port="5432"
    )

    # print(getCompoundNames(conn))
    # print(getAllXRPD(conn))
    # print(getAllSolvent(conn))
    # print(basicSearch(conn, 'XX'))

    # search_restricted_form(conn, 'water')

    # print(advancedSearch2(conn, 
    #                       {'Compound Name': ['BI654321 XX'], 
    #                         'XRPD': ['Form III', 'Acetone Solvate'], 
    #                         'Solvent Exact': [[], ['Isobutanol', 'Methylethyl ketone', 'Water'], ['Isobutanol', 'Methylethyl ketone', 'Water']], 
    #                         'Solvent Contains': ['Ethyl acetate', 't-Butanol', 'Heptane', None]}))
    test(conn)