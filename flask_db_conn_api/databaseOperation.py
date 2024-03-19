import psycopg2
import logging




def database_search(data):
    #clean up user_data
    res = "WHERE"
    for key in data.keys():
        tempList = data.get(key,[])
        if len(res) > 5:
            res += " AND"

        if tempList[0] == "Project Number" and len(tempList) == 2:
            res += f" project_name = {tempList[1]}"
        
        elif tempList[0] == "Molecular Weight" and len(tempList) == 3:
            res += f" molecular_weight {tempList[1]} {tempList[2]}"

        elif tempList[0] == "Solid Form" and len(tempList) == 2:
            res += f" solid_form = {tempList[1]}"

        elif tempList[0] == "Melting Temperature" and len(tempList) == 3:
            res += f" tmelt {tempList[1]} {tempList[2]}"
        
        elif tempList[0] == "Fusion Enthalpy" and len(tempList) == 3:
            res += f" hfus {tempList[1]} {tempList[2]}"

        elif tempList[0] == "Solvent":
            solvent_size = len(tempList) - 1
            for i in range(1,solvent_size):
                if len(tempList[i+1]) == 0:
                    continue

                if len(res) > 5:
                    res += " AND"
                res += f" solvent{i} = {tempList[i+1].strip()}"
    print(res)


    """
    conn = psycopg2.connect(
        database="postgres",
        user="sdp-dev",
        password="sdp123",
        host="24.62.166.59",
        port="5432"
    )
    cur = conn.cursor()
    """
