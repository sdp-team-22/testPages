import pandas
import json


def clean_data(filename):
    excel_data_df = pandas.read_excel(filename, sheet_name='Indata')

    #only care about the first 17 column of the data
    subset_df = excel_data_df.iloc[:, :17]
    #row by row display 
    thisIsjson = subset_df.to_json(orient='split')
    jsonDict = json.loads(thisIsjson)

    return jsonDict

