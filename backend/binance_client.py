import requests
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class BinanceClient:
    def __init__(self):
        self.base_url = "https://api.binance.com"
        
    def get_klines(self, symbol: str, interval: str = "1h", limit: int = 100) -> Optional[List[Dict]]:
        """
        جلب بيانات الشموع من Binance
        """
        try:
            endpoint = f"{self.base_url}/api/v3/klines"
            params = {
                "symbol": symbol.upper(),
                "interval": interval,
                "limit": limit
            }
            
            response = requests.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # تحويل البيانات لتنسيق مفهوم
            processed_data = []
            for kline in data:
                processed_data.append({
                    "timestamp": int(kline[0]),
                    "open": float(kline[1]),
                    "high": float(kline[2]),
                    "low": float(kline[3]),
                    "close": float(kline[4]),
                    "volume": float(kline[5]),
                    "close_time": int(kline[6])
                })
            
            return processed_data
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from Binance: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None
    
    def get_symbol_price(self, symbol: str) -> Optional[float]:
        """
        جلب السعر الحالي لعملة
        """
        try:
            endpoint = f"{self.base_url}/api/v3/ticker/price"
            params = {"symbol": symbol.upper()}
            
            response = requests.get(endpoint, params=params, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            return float(data["price"])
            
        except Exception as e:
            print(f"Error fetching price: {e}")
            return None
    
    def get_available_symbols(self) -> List[str]:
        """
        جلب قائمة العملات المتاحة (USDT pairs فقط)
        """
        try:
            endpoint = f"{self.base_url}/api/v3/exchangeInfo"
            response = requests.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            usdt_symbols = []
            
            for symbol_info in data["symbols"]:
                symbol = symbol_info["symbol"]
                if symbol.endswith("USDT") and symbol_info["status"] == "TRADING":
                    usdt_symbols.append(symbol)
            
            # إرجاع أشهر 20 عملة
            popular_symbols = [
                "BTCUSDT", "ETHUSDT", "SOLUSDT", "ADAUSDT", "DOTUSDT",
                "LINKUSDT", "LTCUSDT", "BCHUSDT", "XLMUSDT", "XRPUSDT",
                "BNBUSDT", "AVAXUSDT", "MATICUSDT", "ATOMUSDT", "ALGOUSDT",
                "VETUSDT", "FILUSDT", "TRXUSDT", "EOSUSDT", "THETAUSDT"
            ]
            
            return [s for s in popular_symbols if s in usdt_symbols]
            
        except Exception as e:
            print(f"Error fetching symbols: {e}")
            return ["BTCUSDT", "ETHUSDT", "SOLUSDT"]  # fallback

def extract_close_prices(klines_data: List[Dict]) -> List[float]:
    """
    استخراج أسعار الإغلاق من بيانات Binance
    """
    return [item["close"] for item in klines_data]
