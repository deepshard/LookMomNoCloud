from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from utils import get_db_path


engine = create_async_engine(get_db_path(), echo=False)
get_db_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
