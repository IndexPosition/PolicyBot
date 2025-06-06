from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    allow_origins: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()