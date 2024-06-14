from sqlalchemy import (
    BigInteger,
    create_engine,
    Column,
    Integer,
    String,
    ForeignKey,
    delete,
)
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sqlalchemy import select
from db import get_db_session

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

    @staticmethod
    async def get_all():
        async with get_db_session() as session:
            result = await session.scalars(select(RunningModel))
            return result.all()

    @staticmethod
    async def get_by_id(id):
        async with get_db_session() as session:
            result = await session.scalars(
                select(RunningModel).where(RunningModel.id == id)
            )
            return result.first()

    @staticmethod
    async def delete_all():
        async with get_db_session() as session:
            await session.execute(delete(RunningModel))
            await session.commit()
