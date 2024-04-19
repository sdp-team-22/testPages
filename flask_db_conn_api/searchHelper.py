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

def basicSearch2(conn, searchQuery):
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM solubility_data
        WHERE LOWER(compound_name) LIKE LOWER(%s)
    """, ('%' + searchQuery + '%',))
    # Fetch and return the results
    return cur.fetchall()


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