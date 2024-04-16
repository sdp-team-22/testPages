from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.orm import declarative_base

# from filestore import Base as FileBase
# Base = declarative_base()


from sqlalchemy.orm import declarative_base
Base = declarative_base()

class Solubility_Data(Base):
    __tablename__ = 'solubility_data'
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Define the foreign key relationship to the Filestore table
    # file_name = Column(String, ForeignKey('filestore.file_id'))
    file_name = Column(String)
    
    project_name= Column(String)
    scientist_name= Column(String)
    compound_name= Column(String)
    molecular_weight = Column(Float)
    
    solid_form= Column(String)
    tmelt= Column(Float)
    hfus= Column(Float)
    solvent_1= Column(String)
    solvent_2= Column(String)
    solvent_3= Column(String)
    
    volfrac1= Column(Float)
    volfrac2= Column(Float)
    volfrac3= Column(Float)
    wtfrac1= Column(Float)
    wtfrac2= Column(Float)
    wtfrac3= Column(Float)
    
    temp= Column(Float)
    xrpd= Column(String)
    
    solubility_mg_g_solvn= Column(String)
    solubility_mg_g_solv= Column(String)
    solubility_wt= Column(String)
    solubility_mg_mL_solv= Column(String)
    
    solute_lot_num= Column(Float)
    eln_sample_num_measure= Column(Float)
    measure_method= Column(String)
    comments= Column(String)
