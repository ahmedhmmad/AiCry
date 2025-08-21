# ملف: backend/auto_train_enhanced.py
import asyncio
from enhanced_advanced_ai import enhanced_advanced_ai
from binance_client import BinanceClient, extract_close_prices
import schedule
import time

async def train_all_symbols():
    """تدريب النماذج لجميع العملات المهمة"""
    binance_client = BinanceClient()
    
    # العملات الرئيسية
    symbols = [
        "BTCUSDT", "ETHUSDT", "BNBUSDT", 
        "ADAUSDT", "XRPUSDT", "SOLUSDT",
        "DOTUSDT", "AVAXUSDT", "MATICUSDT"
    ]
    
    for symbol in symbols:
        print(f"\n{'='*50}")
        print(f"🎯 تدريب {symbol}")
        print(f"{'='*50}")
        
        try:
            # جلب البيانات
            klines = binance_client.get_klines(symbol, "1h", 2000)
            prices = extract_close_prices(klines)
            volumes = [float(k[5]) for k in klines]
            
            # التدريب
            result = enhanced_advanced_ai.train_enhanced_ensemble(
                prices, 
                volumes,
                optimize_hyperparameters=(symbol == "BTCUSDT")  # تحسين BTC فقط
            )
            
            if "error" not in result:
                print(f"✅ {symbol}: Accuracy={result['average_accuracy']:.1%}")
            else:
                print(f"❌ {symbol}: {result['error']}")
                
        except Exception as e:
            print(f"❌ خطأ في {symbol}: {e}")
        
        # انتظار قليل بين العملات
        await asyncio.sleep(5)
    
    print("\n✅ اكتمل التدريب لجميع العملات!")

# تشغيل التدريب
if __name__ == "__main__":
    asyncio.run(train_all_symbols())
