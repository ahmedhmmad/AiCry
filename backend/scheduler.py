import asyncio
import schedule
import time
from datetime import datetime
from trading_simulator import trading_simulator
import threading

class TradingScheduler:
    def __init__(self):
        self.is_running = False
        
    def start_scheduler(self):
        """بدء المجدول"""
        self.is_running = True
        
        # جدولة التداول كل ساعة
        schedule.every().hour.do(self.run_auto_trading_cycle)
        
        # جدولة التداول كل 4 ساعات (للاستراتيجيات المحافظة)
        schedule.every(4).hours.do(self.run_conservative_trading)
        
        # جدولة يومية لحساب الأداء
        schedule.every().day.at("00:00").do(self.daily_performance_update)
        
        # تشغيل المجدول في thread منفصل
        def run_scheduler():
            while self.is_running:
                schedule.run_pending()
                time.sleep(60)  # فحص كل دقيقة
        
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        
        print("✅ تم بدء مجدول التداول التلقائي")
    
    def run_auto_trading_cycle(self):
        """تشغيل دورة التداول التلقائي لجميع المحافظ النشطة"""
        try:
            if not trading_simulator:
                return
            
            # جلب جميع المحافظ النشطة
            active_portfolios = trading_simulator.session.query(
                trading_simulator.Portfolio
            ).filter_by(is_active=True).all()
            
            print(f"🔄 بدء دورة التداول التلقائي لـ {len(active_portfolios)} محفظة")
            
            for portfolio in active_portfolios:
                try:
                    result = trading_simulator.auto_trade_cycle(portfolio.id)
                    if 'error' not in result:
                        cycle_result = result.get('cycle_result', {})
                        if cycle_result.get('action') in ['BUY', 'SELL']:
                            print(f"✅ {portfolio.symbol}: {cycle_result['action']} - {cycle_result.get('message', '')}")
                        else:
                            print(f"⏸️ {portfolio.symbol}: HOLD")
                    else:
                        print(f"❌ خطأ في {portfolio.symbol}: {result['error']}")
                except Exception as e:
                    print(f"❌ خطأ في معالجة محفظة {portfolio.symbol}: {str(e)}")
                    
        except Exception as e:
            print(f"❌ خطأ في دورة التداول التلقائي: {str(e)}")
    
    def run_conservative_trading(self):
        """تشغيل تداول محافظ للمحافظ منخفضة المخاطر"""
        try:
            if not trading_simulator:
                return
                
            conservative_portfolios = trading_simulator.session.query(
                trading_simulator.Portfolio
            ).filter_by(is_active=True, risk_level="LOW").all()
            
            print(f"🛡️ دورة تداول محافظة لـ {len(conservative_portfolios)} محفظة")
            
            for portfolio in conservative_portfolios:
                # نفس المنطق مع استراتيجية أكثر تحفظاً
                self.run_auto_trading_cycle()
                
        except Exception as e:
            print(f"❌ خطأ في التداول المحافظ: {str(e)}")
    
    def daily_performance_update(self):
        """تحديث يومي لحساب الأداء"""
        try:
            print("📊 تحديث الأداء اليومي...")
            # يمكن إضافة منطق لحفظ الأداء اليومي، إرسال تقارير، إلخ
        except Exception as e:
            print(f"❌ خطأ في التحديث اليومي: {str(e)}")
    
    def stop_scheduler(self):
        """إيقاف المجدول"""
        self.is_running = False
        schedule.clear()
        print("⏹️ تم إيقاف مجدول التداول")

# إنشاء instance عام
trading_scheduler = TradingScheduler()
