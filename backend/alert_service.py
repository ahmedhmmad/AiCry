from database_models import Alert, PriceHistory, UserWatchlist, Base
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from typing import List, Dict, Any
import datetime

class AlertService:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def create_alert(self, symbol: str, alert_type: str, message: str, 
                    price: float, indicator_value: float = None, severity: str = "MEDIUM"):
        """إنشاء تنبيه جديد"""
        db = self.SessionLocal()
        try:
            alert = Alert(
                symbol=symbol,
                alert_type=alert_type,
                message=message,
                price=price,
                indicator_value=indicator_value,
                severity=severity
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        finally:
            db.close()
    
    def get_alerts(self, symbol: str = None, unread_only: bool = False, limit: int = 50) -> List[Alert]:
        """جلب التنبيهات"""
        db = self.SessionLocal()
        try:
            query = db.query(Alert)
            
            if symbol:
                query = query.filter(Alert.symbol == symbol.upper())
            
            if unread_only:
                query = query.filter(Alert.is_read == False)
            
            alerts = query.order_by(desc(Alert.created_at)).limit(limit).all()
            return alerts
        finally:
            db.close()
    
    def mark_alert_as_read(self, alert_id: int):
        """تمييز التنبيه كمقروء"""
        db = self.SessionLocal()
        try:
            alert = db.query(Alert).filter(Alert.id == alert_id).first()
            if alert:
                alert.is_read = True
                db.commit()
            return alert
        finally:
            db.close()
    
    def save_price_data(self, symbol: str, price: float, macd: float = None, rsi: float = None):
        """حفظ بيانات السعر والمؤشرات"""
        db = self.SessionLocal()
        try:
            price_record = PriceHistory(
                symbol=symbol,
                price=price,
                macd=macd,
                rsi=rsi
            )
            db.add(price_record)
            db.commit()
            return price_record
        finally:
            db.close()
    
    def get_latest_price_data(self, symbol: str) -> PriceHistory:
        """جلب آخر بيانات سعر محفوظة"""
        db = self.SessionLocal()
        try:
            latest = db.query(PriceHistory).filter(
                PriceHistory.symbol == symbol.upper()
            ).order_by(desc(PriceHistory.timestamp)).first()
            return latest
        finally:
            db.close()
    
    def check_and_create_alerts(self, symbol: str, current_data: Dict[str, Any]) -> List[Alert]:
        """فحص الشروط وإنشاء تنبيهات جديدة"""
        alerts_created = []
        
        try:
            # جلب آخر بيانات محفوظة
            latest_data = self.get_latest_price_data(symbol)
            
            current_price = current_data.get("current_price", 0)
            analysis = current_data.get("comprehensive_analysis", {})
            
            if not analysis:
                return alerts_created
            
            # فحص RSI
            rsi_data = analysis.get("rsi", {})
            current_rsi = rsi_data.get("rsi", 0)
            
            if current_rsi >= 80:
                alert = self.create_alert(
                    symbol=symbol,
                    alert_type="RSI_EXTREME_OVERBOUGHT",
                    message=f"{symbol}: RSI وصل لمستوى متطرف {current_rsi:.1f} - احتمالية تصحيح عالية",
                    price=current_price,
                    indicator_value=current_rsi,
                    severity="HIGH"
                )
                alerts_created.append(alert)
            
            elif current_rsi >= 70:
                alert = self.create_alert(
                    symbol=symbol,
                    alert_type="RSI_OVERBOUGHT",
                    message=f"{symbol}: دخل منطقة التشبع الشرائي RSI {current_rsi:.1f}",
                    price=current_price,
                    indicator_value=current_rsi,
                    severity="MEDIUM"
                )
                alerts_created.append(alert)
            
            elif current_rsi <= 20:
                alert = self.create_alert(
                    symbol=symbol,
                    alert_type="RSI_EXTREME_OVERSOLD",
                    message=f"{symbol}: RSI وصل لمستوى متطرف {current_rsi:.1f} - فرصة شراء محتملة",
                    price=current_price,
                    indicator_value=current_rsi,
                    severity="HIGH"
                )
                alerts_created.append(alert)
            
            elif current_rsi <= 30:
                alert = self.create_alert(
                    symbol=symbol,
                    alert_type="RSI_OVERSOLD",
                    message=f"{symbol}: دخل منطقة التشبع البيعي RSI {current_rsi:.1f}",
                    price=current_price,
                    indicator_value=current_rsi,
                    severity="MEDIUM"
                )
                alerts_created.append(alert)
            
            # فحص MACD
            macd_data = analysis.get("macd", {})
            if macd_data.get("recommendation") in ["BUY", "SELL"]:
                severity = "HIGH" if macd_data.get("strength") == "STRONG" else "MEDIUM"
                alert = self.create_alert(
                    symbol=symbol,
                    alert_type=f"MACD_{macd_data.get('recommendation')}",
                    message=f"{symbol}: {macd_data.get('interpretation')}",
                    price=current_price,
                    indicator_value=macd_data.get("macd"),
                    severity=severity
                )
                alerts_created.append(alert)
            
            # فحص التوصية الإجمالية
            overall_rec = analysis.get("overall_recommendation")
            confidence = analysis.get("confidence", 0)
            
            if overall_rec in ["BUY", "SELL"] and confidence >= 80:
                alert = self.create_alert(
                    symbol=symbol,
                    alert_type=f"STRONG_{overall_rec}_SIGNAL",
                    message=f"{symbol}: إشارة {overall_rec} قوية بثقة {confidence}%",
                    price=current_price,
                    indicator_value=confidence,
                    severity="CRITICAL"
                )
                alerts_created.append(alert)
            
            # فحص تغير السعر الكبير
            if latest_data:
                price_change_pct = ((current_price - latest_data.price) / latest_data.price) * 100
                
                if abs(price_change_pct) >= 5:  # تغير 5% أو أكثر
                    direction = "ارتفع" if price_change_pct > 0 else "انخفض"
                    alert = self.create_alert(
                        symbol=symbol,
                        alert_type="LARGE_PRICE_MOVE",
                        message=f"{symbol}: {direction} بنسبة {abs(price_change_pct):.1f}% في فترة قصيرة",
                        price=current_price,
                        indicator_value=price_change_pct,
                        severity="HIGH"
                    )
                    alerts_created.append(alert)
            
            # حفظ البيانات الحالية
            self.save_price_data(
                symbol=symbol,
                price=current_price,
                macd=macd_data.get("macd"),
                rsi=current_rsi
            )
            
        except Exception as e:
            print(f"Error in alert checking: {e}")
        
        return alerts_created
