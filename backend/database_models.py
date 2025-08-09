from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import datetime

Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    alert_type = Column(String(50), nullable=False)  # RSI_OVERBOUGHT, MACD_CROSSOVER, etc.
    message = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    indicator_value = Column(Float, nullable=True)
    severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False, index=True)
    price = Column(Float, nullable=False)
    macd = Column(Float, nullable=True)
    rsi = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class UserWatchlist(Base):
    __tablename__ = "user_watchlist"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(20), nullable=False)
    alert_rsi_high = Column(Float, default=70.0)
    alert_rsi_low = Column(Float, default=30.0)
    alert_price_change = Column(Float, default=5.0)  # percentage
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
