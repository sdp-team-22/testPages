import pandas as pd
import math

def file_excel_to_json(file):
    DATASET_JSON = dict()
    
    excel_df = pd.read_excel(file)

    DATASET_JSON['File Name'] = file.filename
    #DATASET_JSON['File Name'] = 'D1.xlsx' # !!!
    DATASET_JSON['Project Name'] = excel_df.iloc[8]['Unnamed: 1']
    DATASET_JSON['Scientist Name'] = excel_df.iloc[9]['Unnamed: 1']
    DATASET_JSON['Compound Name'] = excel_df.iloc[15]['Unnamed: 1']
    DATASET_JSON['Molecular Weight'] = excel_df.iloc[16]['Unnamed: 1']
    DATASET_JSON['Solid Form'] = excel_df.iloc[17]['Unnamed: 1']
    DATASET_JSON['Tmelt'] = excel_df.iloc[18]['Unnamed: 1']
    DATASET_JSON['Hfus'] = excel_df.iloc[19]['Unnamed: 1']
    
    SOLUBILITY_DF = excel_df.iloc[26:, :17].copy()
    del excel_df    
    SOLUBILITY_DF.reset_index(drop=True, inplace=True)
    SOLUBILITY_DF.rename(
        columns={
            'Solublity Data Template': SOLUBILITY_DF.iloc[0,0],
            'Unnamed: 1': SOLUBILITY_DF.iloc[0,1],
            'Unnamed: 2': SOLUBILITY_DF.iloc[0,2],
            'Unnamed: 3': str(SOLUBILITY_DF.iloc[0,3]+'_'+SOLUBILITY_DF.iloc[1,3]).replace(" ", ""),
            'Unnamed: 4': str(SOLUBILITY_DF.iloc[0,4]+'_'+SOLUBILITY_DF.iloc[1,4]).replace(" ", ""),
            'Unnamed: 5': str(SOLUBILITY_DF.iloc[0,5]+'_'+SOLUBILITY_DF.iloc[1,5]).replace(" ", ""),
            'Unnamed: 6': SOLUBILITY_DF.iloc[1,6], # T or C?
            'Unnamed: 7': SOLUBILITY_DF.iloc[0,7],
            'Unnamed: 8': SOLUBILITY_DF.iloc[1,8],
            'Unnamed: 9': SOLUBILITY_DF.iloc[1,9],
            'Unnamed: 10': SOLUBILITY_DF.iloc[1,10],
            'Unnamed: 11': SOLUBILITY_DF.iloc[1,11],
            'Unnamed: 12': SOLUBILITY_DF.iloc[0,12],
            'Unnamed: 13': SOLUBILITY_DF.iloc[0,13],
            'Unnamed: 14': SOLUBILITY_DF.iloc[0,14],
            'Unnamed: 15': SOLUBILITY_DF.iloc[0,15],
            'Unnamed: 16': SOLUBILITY_DF.iloc[0,16],
            }, inplace=True)        
    SOLUBILITY_DF.drop(
        index= [0, 1],
        inplace=True
    )
    # display(HTML(SOLUBILITY_DF.head(20).to_html()))
    
    COLUMN_NAME = list(SOLUBILITY_DF.columns) # as they can change per file
        
    SOLUBILITY_DATA = list()
    for row in SOLUBILITY_DF.iterrows(): 
        row = row[1]
        
        data_input_status = str(row[COLUMN_NAME[16]])

        solvent_1 = str(row[COLUMN_NAME[0]])
        solvent_2 = str(row[COLUMN_NAME[1]])
        solvent_3 = str(row[COLUMN_NAME[2]])
        """
        perhaps best to redesign this outside loop 
        so not to do condition check each time ran
        """
        # wt-frac or vol-frac
        if 'volfrac' in [frac_col[23:] for frac_col in COLUMN_NAME[3:6]]:
            vol_frac_1 = {'name': 'SolvFrac1_volfrac', 'data': convertToFloat(row[COLUMN_NAME[3]])}
            vol_frac_2 = {'name': 'SolvFrac2_volfrac', 'data': convertToFloat(row[COLUMN_NAME[4]])}
            vol_frac_3 = {'name': 'SolvFrac3_volfrac', 'data': convertToFloat(row[COLUMN_NAME[5]])}
        elif 'wtfrac' in [frac_col[23:] for frac_col in COLUMN_NAME[3:6]]: # !!!
            vol_frac_1 = {'name': 'SolvFrac1_wtfrac', 'data': convertToFloat(row[COLUMN_NAME[3]])}
            vol_frac_2 = {'name': 'SolvFrac2_wtfrac', 'data': convertToFloat(row[COLUMN_NAME[4]])}
            vol_frac_3 = {'name': 'SolvFrac3_wtfrac', 'data': convertToFloat(row[COLUMN_NAME[5]])}
        else:
            raise Exception("Neither \'volfrac\' or \'wtfrac\' are in column names!")
        
        temp_t = convertToFloat(row[COLUMN_NAME[6]])
        xrpd = str(row[COLUMN_NAME[7]])
        solubility_1 = {'name': str(COLUMN_NAME[8]), 'data': convertToFloat(row[COLUMN_NAME[8]])}
        solubility_2 = {'name': str(COLUMN_NAME[9]), 'data': convertToFloat(row[COLUMN_NAME[9]])}
        solubility_3 = {'name': str(COLUMN_NAME[10]), 'data': convertToFloat(row[COLUMN_NAME[10]])}
        solubility_4 = {'name': str(COLUMN_NAME[11]), 'data': convertToFloat(row[COLUMN_NAME[11]])}
        
        # for convention sake
        solute_lot_num = convertToFloat(row[COLUMN_NAME[12]])
        eln_sample_num_measure = convertToFloat(row[COLUMN_NAME[13]])
        measure_method = str(row[COLUMN_NAME[14]])
        comments = str(row[COLUMN_NAME[15]])

        if solvent_1 == 'nan' and solvent_2 == 'nan' and solvent_3 == 'nan':
            continue

        else:

            row_data = {
                'Solvent 1': solvent_1,
                'Solvent 2': solvent_2,
                'Solvent 3': solvent_3,
                vol_frac_1['name']: vol_frac_1['data'],
                vol_frac_2['name']: vol_frac_2['data'],
                vol_frac_3['name']: vol_frac_3['data'],
                'Temp': temp_t,
                'XRPD': xrpd,
                solubility_1['name']: solubility_1['data'],
                solubility_2['name']: solubility_2['data'],
                solubility_3['name']: solubility_3['data'],
                solubility_4['name']: solubility_4['data'],
                'Solute Lot Number': solute_lot_num,
                'ELN/Sample Number of Measurements': eln_sample_num_measure,
                'Measurement Method': measure_method,
                'Comments': comments,
                'Status' : data_input_status
            }
            # print(json.dumps(row_data, indent=2))
            SOLUBILITY_DATA.append(row_data)
    
    DATASET_JSON['Row Data'] = SOLUBILITY_DATA
    # print(SOLUBILITY_DATA)
    # display(HTML(SOLUBILITY_DF.head(20).to_html()))
    return DATASET_JSON

def convertToFloat(input):
    try:
        fInput = round(float(input), 3)

        if math.isnan(fInput):
            return 'nan'
        return fInput
    except:
        # print(f'could not convert {input} to float')
        return input

def find_duplicates(input_json, conn):
    row_duplicates = []
    compound_name = input_json['Compound Name']
    
    with conn.cursor() as cur:
        for i, row in enumerate(input_json['Row Data']):    
            solvent_1 = row['Solvent 1']
            solvent_2 = row['Solvent 2']
            solvent_3 = row['Solvent 3']
            
            volfrac1 = volfrac2 = volfrac3 = 0.0
            if 'SolvFrac1_volfrac' in row:
                volfrac1 = row['SolvFrac1_volfrac']
                volfrac2 = row['SolvFrac2_volfrac']
                volfrac3 = row['SolvFrac3_volfrac']

            wtfrac1 = wtfrac2 = wtfrac3 = 0.0
            if 'SolvFrac1_wtfrac' in row:
                wtfrac1 = row['SolvFrac1_wtfrac']
                wtfrac2 = row['SolvFrac2_wtfrac']
                wtfrac3 = row['SolvFrac3_wtfrac']
            
            temp = row['Temp']
            xrpd = row['XRPD']
            
            # if i == 5 or i == 6:
            #     print(
            #         f"""
            #         SELECT * FROM solubility_data
            #         WHERE compound_name = {compound_name}
            #         AND solvent_1 = {solvent_1} AND solvent_2 = {solvent_2} AND solvent_3 = {solvent_3}
            #         AND ((volfrac1 = {volfrac1} AND volfrac2 = {volfrac2} AND volfrac3 = {volfrac3}) 
            #         OR (wtfrac1 = {wtfrac1} AND wtfrac2 = {wtfrac2} AND wtfrac3 = {wtfrac3}))
            #         AND temp = {temp} AND xrpd = {xrpd}
            #         """
            #     )
            
            try:
                cur.execute(
                """
                SELECT * FROM solubility_data
                WHERE compound_name = %s
                AND solvent_1 = %s AND solvent_2 = %s AND solvent_3 = %s
                AND ((volfrac1 = %s AND volfrac2 = %s AND volfrac3 = %s) 
                OR (wtfrac1 = %s AND wtfrac2 = %s AND wtfrac3 = %s))
                AND temp = %s AND xrpd = %s
                """, (compound_name, solvent_1, solvent_2, solvent_3, volfrac1, volfrac2, volfrac3, wtfrac1, wtfrac2, wtfrac3, temp, xrpd))
                
                duplicate = cur.fetchone()
                
                if duplicate is not None:
                    row_duplicates.append(i)
            except Exception as e:
                pass
    
    return row_duplicates