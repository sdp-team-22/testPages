import pandas as pd 
import json
import re
import math

"""
def process_files(files):
    file_contents = {}

    for f in files:
        file_content = pd.read_excel(f, sheet_name='Indata').iloc[:, :17].to_json(orient='split')
        file_contents[f.filename] = json.loads(file_content)
        #file_contents.append(json.loads(file_content))
    return file_contents
"""



def file_excel_to_json1(file):
    DATASET_JSON = dict()
    
    excel_df = pd.read_excel(file)

    DATASET_JSON['File Name'] = file.filename
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
        # the Solubility* columns seem to carry there name's over quite well
        # solubility_1 = mg/g solvn. , mg/g solv.  , mg/mL solv.
        # solubility_2 = mg/g solv.  , mg/g soln.  , mg/g solv.
        # solubility_3 = wt %        , wt %        , mg/g soln.
        # solubility_4 = mg/mL solv. , mg/mL solv. , wt%
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
            SOLUBILITY_DATA.append(row_data)
    
    DATASET_JSON['Row Data'] = SOLUBILITY_DATA
    # print(SOLUBILITY_DATA)
    # display(HTML(SOLUBILITY_DF.head(20).to_html()))
    return DATASET_JSON

def file_excel_to_json(data):
    for table in data:
        for row in table['rowData']:
            del row['Status']
    

def convertToFloat(input):
    try:
        fInput = round(float(input), 3)

        if math.isnan(fInput):
            return 'nan'
        return fInput
    except:
        print(f'could not convert {input} to float')
        return input

# ---
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import extract
from datetime import datetime
from uuid import uuid4
from random import randint
from datetime import timedelta
from solubility import Base as SolubilityBase
from solubility import Solubility_Data

def get_engine(username, password, hostname, dbname):
    """
    Get a database engine.
 
    Returns:
    Session: A database engine.
    """
    engine = create_engine(f'postgresql://{username}:{password}@{hostname}/{dbname}')
    return engine

def get_db_session(engine):
    """"""
    Session = sessionmaker(bind=engine)    
    return Session()

def load_schema(engine):
    """
    Load the defined schema by creating tables in the database.

    This function creates tables if they do not exist already.
    """
    UserBase.metadata.create_all(engine)
    Filestore.metadata.create_all(engine)
    LoginActivity.metadata.create_all(engine)
    
    SolubilityBase.metadata.create_all(engine)

def create_new_solubility_data_entry(session, data):
    """
    Upload solubility_data to db
    
    Parameters:
    session
    data: output of file_excel_to_json()
    
    Return:
    None
    """
    for row_data in data['rowData']:
        if 'SolvFrac1_volfrac' in row_data.keys():
            solubility_entry = Solubility_Data(
                file_name= data['projectInfo']['fileName'],
                project_name= data['projectInfo']['projectName'],
                scientist_name= data['projectInfo']['scientistName'],
                compound_name= data['projectInfo']['compoundName'],
                molecular_weight= data['projectInfo']['molecularWeight'],
                
                solid_form= data['projectInfo']['solidForm'],
                tmelt= data['projectInfo']['Tmelt'],
                hfus= data['projectInfo']['Hfus'],
                
                solvent_1= row_data['Solvent 1'],
                solvent_2= row_data['Solvent 2'],
                solvent_3= row_data['Solvent 3'],
                
                volfrac1= row_data['SolvFrac1_volfrac'],
                volfrac2= row_data['SolvFrac2_volfrac'],
                volfrac3= row_data['SolvFrac3_volfrac'],
                wtfrac1= None,
                wtfrac2= None,
                wtfrac3= None,
                
                temp= row_data['Temp'],
                xrpd= row_data['XRPD'],
                
                solubility_mg_g_solvn= row_data['mg/g soln.'],
                solubility_mg_g_solv= row_data['mg/g solv.'],
                solubility_wt= row_data['wt %'],
                solubility_mg_mL_solv= row_data['mg/mL solv.'],
                
                solute_lot_num= row_data['Solute Lot Number'],
                eln_sample_num_measure= row_data['ELN/Sample Number of Measurements'],
                measure_method= row_data['Measurement Method'],
                comments= row_data['Comments'],
            )
            session.add(solubility_entry)

        elif 'SolvFrac1_wtfrac' in row_data.keys():
            solubility_entry = Solubility_Data(
                file_name= data['projectInfo']['fileName'],
                project_name= data['projectInfo']['projectName'],
                scientist_name= data['projectInfo']['scientistName'],
                compound_name= data['projectInfo']['compoundName'],
                molecular_weight= data['projectInfo']['molecularWeight'],
                
                solid_form= data['projectInfo']['solidForm'],
                tmelt= data['projectInfo']['Tmelt'],
                hfus= data['projectInfo']['Hfus'],
                
                solvent_1= row_data['Solvent 1'],
                solvent_2= row_data['Solvent 2'],
                solvent_3= row_data['Solvent 3'],
                
                volfrac1= None,
                volfrac2= None,
                volfrac3= None,
                wtfrac1= row_data['SolvFrac1_wtfrac'],
                wtfrac2= row_data['SolvFrac2_wtfrac'],
                wtfrac3= row_data['SolvFrac3_wtfrac'],
                
                temp= row_data['Temp'],
                xrpd= row_data['XRPD'],
                
                solubility_mg_g_solvn= row_data['mg/g soln.'],
                solubility_mg_g_solv= row_data['mg/g solv.'],
                solubility_wt= row_data['wt %'],
                solubility_mg_mL_solv= row_data['mg/mL solv.'],
                
                solute_lot_num= row_data['Solute Lot Number'],
                eln_sample_num_measure= row_data['ELN/Sample Number of Measurements'],
                measure_method= row_data['Measurement Method'],
                comments= row_data['Comments'],
            )
            session.add(solubility_entry)
    session.commit()
    return None