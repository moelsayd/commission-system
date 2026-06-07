import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_PATH = "database.db"

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
