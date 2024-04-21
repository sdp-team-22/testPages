import psycopg2

def getAllCompoundNames(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT(compound_name) FROM solubility_data
        WHERE compound_name != 'nan'
    """)
    return [t[0] for t in cur.fetchall()]

def getRestricted(conn, filterContents, type, exact):
    cur = conn.cursor()
    if (filterContents is None):
        return 'No filters with content'
    if type == 'Compound Name':
        type = 'compound_name'
    elif type == 'XRPD':
        type = 'xrpd'
    if (type == 'compound_name' or type == 'xrpd'):
        query = "SELECT DISTINCT(" + type + ") FROM solubility_data WHERE 1 = 1"
        if type != 'compound_name':
            cnameQuery = ''
            for cname in filterContents['Compound Name']:
                if (cname):
                    cname = "'" + cname + "'"
                    cnameQuery = cnameQuery + f' OR LOWER(compound_name) = LOWER({cname})'
            if cnameQuery != '':
                cnameQuery = cnameQuery[4:]
                query = query + f' AND ({cnameQuery})'
        if type != 'xrpd':
            xrpdQuery = ''
            for xrpd in filterContents['XRPD']:
                if (xrpd):
                    xrpd = "'" + xrpd + "'"
                    xrpdQuery = xrpdQuery + f' OR LOWER(xrpd) = LOWER({xrpd})'
            if xrpdQuery != '':
                xrpdQuery = xrpdQuery[4:]
                query = query + f' AND ({xrpdQuery})'
        # adjust query based on solvent filters too
        exactQuery = ' AND ('
        for exactCombination in filterContents['Solvent Exact']:
            for i in range(len(exactCombination)):
                if exactCombination[i] is None:
                    exactCombination[i] = 'nan'
            if len(exactCombination) == 1 and exactCombination[0]:
                exactQuery = exactQuery + " LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') OR"
                exactQuery = exactQuery + " LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') OR"
                exactQuery = exactQuery + " LOWER(solvent_3) = LOWER('" + exactCombination[0] + "') OR"
            elif len(exactCombination) == 2:
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and solvent_3 = 'nan') OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and solvent_3 = 'nan') OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and solvent_3 = 'nan') OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and solvent_3 = 'nan') OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = 'nan' and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and solvent_3 = LOWER('" + exactCombination[1] + "')) OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = 'nan' and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and solvent_3 = LOWER('" + exactCombination[0] + "')) OR"
            elif len(exactCombination) == 3:
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[2] + "')) OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[1] + "')) OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[2] + "')) OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[0] + "')) OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[1] + "')) OR"
                exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[0] + "')) OR"
        if exactQuery != ' AND (':
            exactQuery = exactQuery[:-2] + ")"
            query = query + exactQuery
        anyQuery = ' AND ('
        for anySolv in filterContents['Solvent Contains']:
            if anySolv is None:
                anySolv = 'nan'
            anyQuery = anyQuery + " LOWER(solvent_1) = LOWER('" + anySolv + "') OR"
            anyQuery = anyQuery + " LOWER(solvent_2) = LOWER('" + anySolv + "') OR"
            anyQuery = anyQuery + " LOWER(solvent_3) = LOWER('" + anySolv + "') OR"
        if anyQuery != ' AND (':
            anyQuery = anyQuery[:-2] + ')'
            query = query + anyQuery
        try:
            cur.execute(query)
            response = cur.fetchall()
            return [responseTup[0] for responseTup in response if responseTup[0] != 'nan']
        except Exception as e:
            return 'searchHelper.py: getRestrictedCompounds failed'
    else:
        # print(filterContents, type)
        if type == 'has any':
            # if it's has any, first contains should be based on distinct s1, s2, s3 with x compound name
            # if there's anything in exact, we can just return options in exact
            if filterContents['Solvent Exact'] == [[]]:
                # need to do actual queries
                solventOptions = set()
                query1 = "SELECT DISTINCT(solvent_1) FROM solubility_data WHERE 1 = 1"
                query2 = "SELECT DISTINCT(solvent_2) FROM solubility_data WHERE 1 = 1"
                query3 = "SELECT DISTINCT(solvent_3) FROM solubility_data WHERE 1 = 1"
                cnameQuery = ''
                for cname in filterContents['Compound Name']:
                    if (cname):
                        cname = "'" + cname + "'"
                        cnameQuery = cnameQuery + f' OR LOWER(compound_name) = LOWER({cname})'
                if cnameQuery != '':
                    cnameQuery = cnameQuery[4:]
                    query1 = query1 + f' AND ({cnameQuery})'
                    query2 = query2 + f' AND ({cnameQuery})'
                    query3 = query3 + f' AND ({cnameQuery})'
                xrpdQuery = ''
                for xrpd in filterContents['XRPD']:
                    if (xrpd):
                        xrpd = "'" + xrpd + "'"
                        xrpdQuery = xrpdQuery + f' OR LOWER(xrpd) = LOWER({xrpd})'
                if xrpdQuery != '':
                    xrpdQuery = xrpdQuery[4:]
                    query1 = query1 + f' AND ({xrpdQuery})'
                    query2 = query2 + f' AND ({xrpdQuery})'
                    query3 = query3 + f' AND ({xrpdQuery})'
                # make all necessary queries
                cur.execute(query1)
                response = cur.fetchall()
                response = [responseTup[0] for responseTup in response if responseTup[0] != 'nan']
                solventOptions.update(response)
                cur.execute(query2)
                response = cur.fetchall()
                response = [responseTup[0] for responseTup in response if responseTup[0] != 'nan']
                solventOptions.update(response)
                cur.execute(query3)
                response = cur.fetchall()
                response = [responseTup[0] for responseTup in response if responseTup[0] != 'nan']
                solventOptions.update(response)
                return list(solventOptions)
            else:
                solventOptions = set()
                for exactCombos in filterContents['Solvent Exact']:
                    if (len(exactCombos) > 0):
                        solventOptions.add(exactCombos[0])
                    if (len(exactCombos) > 1):
                        solventOptions.add(exactCombos[1])
                    if (len(exactCombos) > 2):
                        solventOptions.add(exactCombos[2])
                if None in solventOptions:
                    solventOptions.remove(None)
                return list(solventOptions)
        elif type == 'has exact':
            # has exact
            # check compound name, xrpd, as well as current exact selections then query for all possible solvents
            # then remove from all possible solvents if it's not in contains list
            solventOptions = set()
            query1 = "SELECT DISTINCT(solvent_1) FROM solubility_data WHERE 1 = 1"
            query2 = "SELECT DISTINCT(solvent_2) FROM solubility_data WHERE 1 = 1"
            query3 = "SELECT DISTINCT(solvent_3) FROM solubility_data WHERE 1 = 1"
            cnameQuery = ''
            for cname in filterContents['Compound Name']:
                if (cname):
                    cname = "'" + cname + "'"
                    cnameQuery = cnameQuery + f' OR LOWER(compound_name) = LOWER({cname})'
            if cnameQuery != '':
                cnameQuery = cnameQuery[4:]
                query1 = query1 + f' AND ({cnameQuery})'
                query2 = query2 + f' AND ({cnameQuery})'
                query3 = query3 + f' AND ({cnameQuery})'
            xrpdQuery = ''
            for xrpd in filterContents['XRPD']:
                if (xrpd):
                    xrpd = "'" + xrpd + "'"
                    xrpdQuery = xrpdQuery + f' OR LOWER(xrpd) = LOWER({xrpd})'
            if xrpdQuery != '':
                xrpdQuery = xrpdQuery[4:]
                query1 = query1 + f' AND ({xrpdQuery})'
                query2 = query2 + f' AND ({xrpdQuery})'
                query3 = query3 + f' AND ({xrpdQuery})'
            exactQuery = ''
            if len(exact) == 1:
                # print('adjust query for exact filter 2')
                exactQuery = " AND (LOWER(solvent_1) = LOWER('" + exact[0] + "')"
                exactQuery = exactQuery + " OR LOWER(solvent_2) = LOWER('" + exact[0] + "')"
                exactQuery = exactQuery + " OR LOWER(solvent_3) = LOWER('" + exact[0] + "'))"
            elif len(exact) == 2:
                # print('adjust query for exact filter 3')
                exactQuery = " AND ((LOWER(solvent_1) = LOWER('" + exact[0] + "') AND LOWER(solvent_2) = LOWER('" + exact[1] + "')) OR"
                exactQuery = exactQuery + "(LOWER(solvent_1) = LOWER('" + exact[1] + "') AND LOWER(solvent_2) = LOWER('" + exact[0] + "')) OR"
                exactQuery = exactQuery + "(LOWER(solvent_1) = LOWER('" + exact[0] + "') AND LOWER(solvent_3) = LOWER('" + exact[1] + "')) OR"
                exactQuery = exactQuery + "(LOWER(solvent_1) = LOWER('" + exact[1] + "') AND LOWER(solvent_3) = LOWER('" + exact[0] + "')) OR"
                exactQuery = exactQuery + "(LOWER(solvent_2) = LOWER('" + exact[0] + "') AND LOWER(solvent_3) = LOWER('" + exact[1] + "')) OR"
                exactQuery = exactQuery + "(LOWER(solvent_2) = LOWER('" + exact[1] + "') AND LOWER(solvent_3) = LOWER('" + exact[0] + "')))"
            # adjust options based on 'has any' options
            query1 = query1 + exactQuery
            query2 = query2 + exactQuery
            query3 = query3 + exactQuery
            # make all necessary queries
            cur.execute(query1)
            response = cur.fetchall()
            response = [responseTup[0] for responseTup in response if responseTup[0] != 'nan']
            solventOptions.update(response)
            cur.execute(query2)
            response = cur.fetchall()
            response = [responseTup[0] for responseTup in response if responseTup[0] != 'nan']
            solventOptions.update(response)
            cur.execute(query3)
            response = cur.fetchall()
            response = [responseTup[0] for responseTup in response if responseTup[0] != 'nan']
            solventOptions.update(response)
            if len(exact) > 0:
                solventOptions.remove(exact[0])
            if len(exact) > 1:
                solventOptions.remove(exact[1])
            # remove anything that's not in contains list
            finalResponse = set()
            # print(filterContents['Solvent Contains'])
            if filterContents['Solvent Contains']:
                for element in list(solventOptions):
                    if element in filterContents['Solvent Contains']:
                        finalResponse.add(element)
            else:
                finalResponse = list(solventOptions)
            return list(finalResponse)

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
            # print(cleanCombo)
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

def advancedSearchRestricted(conn, searchQuery):
    cur = conn.cursor()
    # print(searchQuery)
    query = "SELECT * FROM solubility_data WHERE 1 = 1"
    # add compound names
    cnameQuery = ''
    for cname in searchQuery['Compound Name']:
        if (cname):
            cname = "'" + cname + "'"
            cnameQuery = cnameQuery + f' OR LOWER(compound_name) = LOWER({cname})'
    if cnameQuery != '':
        cnameQuery = cnameQuery[4:]
        query = query + f' AND ({cnameQuery})'
    xrpdQuery = ''
    # add xrpd
    for xrpd in searchQuery['XRPD']:
        if (xrpd):
            xrpd = "'" + xrpd + "'"
            xrpdQuery = xrpdQuery + f' OR LOWER(xrpd) = LOWER({xrpd})'
    if xrpdQuery != '':
        xrpdQuery = xrpdQuery[4:]
        query = query + f' AND ({xrpdQuery})'
    # add solvent exact
    exactQuery = ' AND ('
    for exactCombination in searchQuery['Solvent Exact']:
        for i in range(len(exactCombination)):
            if exactCombination[i] is None:
                exactCombination[i] = 'nan'
        if len(exactCombination) == 1 and exactCombination[0]:
            exactQuery = exactQuery + " LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') OR"
            exactQuery = exactQuery + " LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') OR"
            exactQuery = exactQuery + " LOWER(solvent_3) = LOWER('" + exactCombination[0] + "') OR"
        elif len(exactCombination) == 2:
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and solvent_3 = 'nan') OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and solvent_3 = 'nan') OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and solvent_3 = 'nan') OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and solvent_3 = 'nan') OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = 'nan' and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and solvent_3 = LOWER('" + exactCombination[1] + "')) OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = 'nan' and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and solvent_3 = LOWER('" + exactCombination[0] + "')) OR"
        elif len(exactCombination) == 3:
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[2] + "')) OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[1] + "')) OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[2] + "')) OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[0] + "')) OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[0] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[1] + "')) OR"
            exactQuery = exactQuery + " (LOWER(solvent_1) = LOWER('" + exactCombination[2] + "') and LOWER(solvent_2) = LOWER('" + exactCombination[1] + "') and LOWER(solvent_3) = LOWER('" + exactCombination[0] + "')) OR"
    if exactQuery != ' AND (':
        exactQuery = exactQuery[:-2] + ")"
        query = query + exactQuery
    # add solvent any
    anyQuery = ' AND ('
    for anySolv in searchQuery['Solvent Contains']:
        if anySolv is None:
            anySolv = 'nan'
        anyQuery = anyQuery + " LOWER(solvent_1) = LOWER('" + anySolv + "') OR"
        anyQuery = anyQuery + " LOWER(solvent_2) = LOWER('" + anySolv + "') OR"
        anyQuery = anyQuery + " LOWER(solvent_3) = LOWER('" + anySolv + "') OR"
    if anyQuery != ' AND (':
        anyQuery = anyQuery[:-2] + ')'
        query = query + anyQuery
    # print(query)
    try:
        # print(query)
        response = []
        if query != "SELECT * FROM solubility_data WHERE 1 = 1":
            cur.execute(query)
            response = cur.fetchall()
        # print(response)
        unique_rows = set(response)
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
    except Exception as e:
        return { 'fatal error: searchHelper advancedSearchRestricted:', e }

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
            # print(options)
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
            # print(options)

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
    if (item['xrpd'] == ''):
        item['xrpd'] = 'nan'
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