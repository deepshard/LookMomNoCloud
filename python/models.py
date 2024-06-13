from sqlalchemy import BigInteger, create_engine, Column, Integer, String, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base

Base = declarative_base()


class RunningModel(Base):
    __tablename__ = "running_models"
    db_id = Column(String, primary_key=True, default="cuid()")
    id = Column(String)
    instance = Column(Integer)
    name = Column(String)
    size = Column(BigInteger)
    pid = Column(Integer)
    port = Column(Integer)
    quantization = Column(String)
