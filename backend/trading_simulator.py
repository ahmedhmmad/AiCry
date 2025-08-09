import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
from sqlalchemy import create_engine, Column, String, Float, DateTime, Boolean, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from binance_client import BinanceClient, extract_close_prices
from advanced_ai import advanced_ai
from simple_ai import simple_ai
from indicators import comprehensive_analysis

Base = declarative_base()

class TradeType(Enum):
    BUY = "BUY"
    SELL = "SELL"

class Portfolio(Base):
    __tablename__ = 'portfolios'
    
    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    initial_balance = Column(Float, nullable=False)
    current_balance = Column(Float, nullable=False)
    current_position = Column(Float, default=0.0)  # كمية العملة المملوكة
    current_position_value = Column(Float, default=0.0)  # قيمة العملة المملوكة
    total_trades = Column(Integer, default=0)
    successful_trades = Column(Integer, default=0)
    total_profit_loss = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    trading_strategy = Column(String, default="AI_HYBRID")  # TECHNICAL, SIMPLE_AI, ADVANCED_AI, AI_HYBRID
    risk_level = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH
    
class Trade(Base):
    __tablename__ = 'trades'
    
    id = Column(String, primary_key=True)
    portfolio_id = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    trade_type = Column(String, nullable=False)  # BUY/SELL
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    commission = Column(Float, default=0.0)
    profit_loss = Column(Float, default=0.0)
    balance_before = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    signal_source = Column(String, nullable=False)  # TECHNICAL, SIMPLE_AI, ADVANCED_AI, MANUAL
    signal_confidence = Column(Float, default=0.0)
    market_price = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

class TradingSimulator:
    def __init__(self, database_url: str):
        self.engine = create_engine(database_url)
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        self.binance_client = BinanceClient()
        
        # إعدادات التداول
        self.commission_rate = 0.001  # 0.1% عمولة
        self.min_trade_amount = 10.0  # أقل مبلغ تداول
        self.max_position_percentage = 0.95  # أقصى نسبة من الرصيد للاستثمار
        
    def create_portfolio(self, user_id: str, symbol: str, initial_balance: float, 
                        strategy: str = "AI_HYBRID", risk_level: str = "MEDIUM") -> Dict[str, Any]:
        """
        إنشاء محفظة استثمارية جديدة
        """
        try:
            portfolio_id = str(uuid.uuid4())
            
            # التحقق من صحة العملة
            current_price = self.binance_client.get_symbol_price(symbol)
            if not current_price:
                return {"error": f"العملة {symbol} غير متاحة"}
            
            portfolio = Portfolio(
                id=portfolio_id,
                user_id=user_id,
                symbol=symbol,
                initial_balance=initial_balance,
                current_balance=initial_balance,
                trading_strategy=strategy,
                risk_level=risk_level
            )
            
            self.session.add(portfolio)
            self.session.commit()
            
            return {
                "portfolio_id": portfolio_id,
                "symbol": symbol,
                "initial_balance": initial_balance,
                "current_price": current_price,
                "strategy": strategy,
                "risk_level": risk_level,
                "status": "created",
                "message": f"تم إنشاء محفظة بمبلغ ${initial_balance:,.2f} للتداول في {symbol}"
            }
            
        except Exception as e:
            self.session.rollback()
            return {"error": f"فشل في إنشاء المحفظة: {str(e)}"}
    
    def get_trading_signal(self, symbol: str, strategy: str = "AI_HYBRID") -> Dict[str, Any]:
        """
        الحصول على إشارة تداول من الذكاء الصناعي
        """
        try:
            # جلب البيانات
            klines_data = self.binance_client.get_klines(symbol, "1h", 200)
            if not klines_data:
                return {"error": "فشل في جلب البيانات"}
            
            close_prices = extract_close_prices(klines_data)
            volumes = [item['volume'] for item in klines_data]
            current_price = klines_data[-1]['close']
            
            signals = {}
            
            # التحليل الفني
            if strategy in ["TECHNICAL", "AI_HYBRID"]:
                tech_analysis = comprehensive_analysis(close_prices)
                signals['technical'] = {
                    'recommendation': tech_analysis.get('overall_recommendation', 'HOLD'),
                    'confidence': tech_analysis.get('confidence', 50),
                    'source': 'TECHNICAL'
                }
            
            # AI البسيط
            if strategy in ["SIMPLE_AI", "AI_HYBRID"]:
                if simple_ai.is_trained or simple_ai.load_model():
                    simple_result = simple_ai.predict(close_prices)
                    if 'error' not in simple_result:
                        signals['simple_ai'] = {
                            'recommendation': simple_result.get('recommendation', 'HOLD'),
                            'confidence': simple_result.get('confidence', 50),
                            'source': 'SIMPLE_AI'
                        }
            
            # AI المتقدم
            if strategy in ["ADVANCED_AI", "AI_HYBRID"]:
                if advanced_ai.is_trained or advanced_ai.load_ensemble():
                    advanced_result = advanced_ai.predict_ensemble(close_prices, volumes)
                    if 'error' not in advanced_result and 'ensemble_prediction' in advanced_result:
                        ensemble = advanced_result['ensemble_prediction']
                        signals['advanced_ai'] = {
                            'recommendation': ensemble.get('recommendation', 'HOLD'),
                            'confidence': ensemble.get('confidence', 50),
                            'source': 'ADVANCED_AI'
                        }
            
            # دمج الإشارات
            final_signal = self.combine_trading_signals(signals, strategy)
            final_signal['current_price'] = current_price
            final_signal['timestamp'] = datetime.now().isoformat()
            
            return final_signal
            
        except Exception as e:
            return {"error": f"فشل في الحصول على الإشارة: {str(e)}"}
    
    def combine_trading_signals(self, signals: Dict, strategy: str) -> Dict[str, Any]:
        """
        دمج إشارات التداول المختلفة
        """
        if not signals:
            return {
                'action': 'HOLD',
                'confidence': 50,
                'source': 'NONE',
                'reasoning': 'لا توجد إشارات متاحة'
            }
        
        # إذا كان هناك إشارة واحدة فقط
        if len(signals) == 1:
            signal = list(signals.values())[0]
            return {
                'action': signal['recommendation'],
                'confidence': signal['confidence'],
                'source': signal['source'],
                'reasoning': f"إشارة من {signal['source']}"
            }
        
        # دمج متعدد الإشارات
        buy_votes = 0
        sell_votes = 0
        hold_votes = 0
        total_confidence = 0
        sources = []
        
        for signal in signals.values():
            rec = signal['recommendation']
            conf = signal['confidence']
            sources.append(signal['source'])
            
            if rec in ['BUY', 'STRONG_BUY']:
                buy_votes += conf
            elif rec in ['SELL', 'STRONG_SELL']:
                sell_votes += conf
            else:
                hold_votes += conf
            
            total_confidence += conf
        
        # تحديد القرار النهائي
        if buy_votes > sell_votes and buy_votes > hold_votes:
            action = 'BUY'
            confidence = min(buy_votes / len(signals), 95)
        elif sell_votes > buy_votes and sell_votes > hold_votes:
            action = 'SELL'
            confidence = min(sell_votes / len(signals), 95)
        else:
            action = 'HOLD'
            confidence = max(hold_votes / len(signals), 50)
        
        return {
            'action': action,
            'confidence': confidence,
            'source': '+'.join(sources),
            'reasoning': f"دمج إشارات من {len(signals)} مصادر",
            'signal_breakdown': {
                'buy_strength': buy_votes,
                'sell_strength': sell_votes,
                'hold_strength': hold_votes
            }
        }
    
    def execute_trade(self, portfolio_id: str, signal: Dict[str, Any]) -> Dict[str, Any]:
        """
        تنفيذ صفقة تداول
        """
        try:
            portfolio = self.session.query(Portfolio).filter_by(id=portfolio_id).first()
            if not portfolio:
                return {"error": "المحفظة غير موجودة"}
            
            if not portfolio.is_active:
                return {"error": "المحفظة غير نشطة"}
            
            action = signal['action']
            current_price = signal['current_price']
            confidence = signal['confidence']
            
            # تحديد حجم التداول بناءً على الثقة ومستوى المخاطر
            trade_size_percentage = self.calculate_trade_size(confidence, portfolio.risk_level)
            
            if action == 'BUY':
                return self.execute_buy_order(portfolio, current_price, trade_size_percentage, signal)
            elif action == 'SELL':
                return self.execute_sell_order(portfolio, current_price, signal)
            else:
                return {
                    "action": "HOLD",
                    "message": "لا توجد صفقة - الانتظار",
                    "reason": signal.get('reasoning', 'إشارة انتظار')
                }
                
        except Exception as e:
            self.session.rollback()
            return {"error": f"فشل في تنفيذ الصفقة: {str(e)}"}
    
    def execute_buy_order(self, portfolio: Portfolio, price: float, size_percentage: float, signal: Dict) -> Dict[str, Any]:
        """
        تنفيذ أمر شراء
        """
        # حساب المبلغ المتاح للشراء
        available_balance = portfolio.current_balance
        trade_amount = available_balance * size_percentage
        
        if trade_amount < self.min_trade_amount:
            return {"error": f"المبلغ أقل من الحد الأدنى (${self.min_trade_amount})"}
        
        # حساب العمولة
        commission = trade_amount * self.commission_rate
        net_amount = trade_amount - commission
        quantity = net_amount / price
        
        # تحديث المحفظة
        portfolio.current_balance -= trade_amount
        portfolio.current_position += quantity
        portfolio.current_position_value = portfolio.current_position * price
        portfolio.total_trades += 1
        portfolio.updated_at = datetime.utcnow()
        
        # إنشاء سجل الصفقة
        trade = Trade(
            id=str(uuid.uuid4()),
            portfolio_id=portfolio.id,
            symbol=portfolio.symbol,
            trade_type="BUY",
            quantity=quantity,
            price=price,
            total_value=trade_amount,
            commission=commission,
            balance_before=portfolio.current_balance + trade_amount,
            balance_after=portfolio.current_balance,
            signal_source=signal.get('source', 'UNKNOWN'),
            signal_confidence=signal.get('confidence', 0),
            market_price=price,
            notes=signal.get('reasoning', '')
        )
        
        self.session.add(trade)
        self.session.commit()
        
        return {
            "action": "BUY",
            "quantity": quantity,
            "price": price,
            "total_cost": trade_amount,
            "commission": commission,
            "new_balance": portfolio.current_balance,
            "position_size": portfolio.current_position,
            "position_value": portfolio.current_position_value,
            "message": f"تم شراء {quantity:.6f} {portfolio.symbol} بسعر ${price:,.2f}"
        }
    
    def execute_sell_order(self, portfolio: Portfolio, price: float, signal: Dict) -> Dict[str, Any]:
        """
        تنفيذ أمر بيع
        """
        if portfolio.current_position <= 0:
            return {"error": "لا توجد عملة للبيع"}
        
        # بيع كامل المركز
        quantity = portfolio.current_position
        total_value = quantity * price
        commission = total_value * self.commission_rate
        net_proceeds = total_value - commission
        
        # حساب الربح/الخسارة
        # نحتاج لحساب متوسط سعر الشراء
        avg_buy_price = self.get_average_buy_price(portfolio.id)
        if avg_buy_price:
            profit_loss = (price - avg_buy_price) * quantity - commission
        else:
            profit_loss = 0
        
        # تحديث المحفظة
        portfolio.current_balance += net_proceeds
        portfolio.current_position = 0
        portfolio.current_position_value = 0
        portfolio.total_trades += 1
        portfolio.total_profit_loss += profit_loss
        if profit_loss > 0:
            portfolio.successful_trades += 1
        portfolio.updated_at = datetime.utcnow()
        
        # إنشاء سجل الصفقة
        trade = Trade(
            id=str(uuid.uuid4()),
            portfolio_id=portfolio.id,
            symbol=portfolio.symbol,
            trade_type="SELL",
            quantity=quantity,
            price=price,
            total_value=total_value,
            commission=commission,
            profit_loss=profit_loss,
            balance_before=portfolio.current_balance - net_proceeds,
            balance_after=portfolio.current_balance,
            signal_source=signal.get('source', 'UNKNOWN'),
            signal_confidence=signal.get('confidence', 0),
            market_price=price,
            notes=signal.get('reasoning', '')
        )
        
        self.session.add(trade)
        self.session.commit()
        
        return {
            "action": "SELL",
            "quantity": quantity,
            "price": price,
            "total_proceeds": total_value,
            "commission": commission,
            "net_proceeds": net_proceeds,
            "profit_loss": profit_loss,
            "new_balance": portfolio.current_balance,
            "message": f"تم بيع {quantity:.6f} {portfolio.symbol} بسعر ${price:,.2f}",
            "profit_status": "ربح" if profit_loss > 0 else "خسارة" if profit_loss < 0 else "تعادل"
        }
    
    def calculate_trade_size(self, confidence: float, risk_level: str) -> float:
        """
        حساب حجم التداول بناءً على الثقة ومستوى المخاطر
        """
        base_sizes = {
            "LOW": 0.1,    # 10% من الرصيد
            "MEDIUM": 0.2, # 20% من الرصيد
            "HIGH": 0.3    # 30% من الرصيد
        }
        
        base_size = base_sizes.get(risk_level, 0.2)
        
        # تعديل الحجم بناءً على الثقة
        confidence_multiplier = confidence / 100
        adjusted_size = base_size * confidence_multiplier
        
        # حدود الأمان
        return min(max(adjusted_size, 0.05), self.max_position_percentage)
    
    def get_average_buy_price(self, portfolio_id: str) -> Optional[float]:
        """
        حساب متوسط سعر الشراء
        """
        buy_trades = self.session.query(Trade).filter_by(
            portfolio_id=portfolio_id,
            trade_type="BUY"
        ).all()
        
        if not buy_trades:
            return None
        
        total_value = sum(trade.total_value for trade in buy_trades)
        total_quantity = sum(trade.quantity for trade in buy_trades)
        
        return total_value / total_quantity if total_quantity > 0 else None
    
    def get_portfolio_performance(self, portfolio_id: str) -> Dict[str, Any]:
        """
        حساب أداء المحفظة
        """
        try:
            portfolio = self.session.query(Portfolio).filter_by(id=portfolio_id).first()
            if not portfolio:
                return {"error": "المحفظة غير موجودة"}
            
            # الحصول على السعر الحالي
            current_price = self.binance_client.get_symbol_price(portfolio.symbol)
            if not current_price:
                return {"error": "فشل في جلب السعر الحالي"}
            
            # حساب القيمة الحالية للمحفظة
            current_position_value = portfolio.current_position * current_price
            total_portfolio_value = portfolio.current_balance + current_position_value
            
            # حساب الأداء
            total_return = total_portfolio_value - portfolio.initial_balance
            return_percentage = (total_return / portfolio.initial_balance) * 100
            
            # إحصائيات التداول
            success_rate = (portfolio.successful_trades / portfolio.total_trades * 100) if portfolio.total_trades > 0 else 0
            
            # تحديث القيمة الحالية للمركز
            portfolio.current_position_value = current_position_value
            portfolio.updated_at = datetime.utcnow()
            self.session.commit()
            
            return {
                "portfolio_id": portfolio_id,
                "symbol": portfolio.symbol,
                "initial_balance": portfolio.initial_balance,
                "current_balance": portfolio.current_balance,
                "current_position": portfolio.current_position,
                "current_position_value": current_position_value,
                "total_portfolio_value": total_portfolio_value,
                "total_return": total_return,
                "return_percentage": return_percentage,
                "total_trades": portfolio.total_trades,
                "successful_trades": portfolio.successful_trades,
                "success_rate": success_rate,
                "total_profit_loss": portfolio.total_profit_loss,
                "current_price": current_price,
                "last_updated": portfolio.updated_at.isoformat(),
                "status": "ربح" if total_return > 0 else "خسارة" if total_return < 0 else "تعادل"
            }
            
        except Exception as e:
            return {"error": f"فشل في حساب الأداء: {str(e)}"}
    
    def get_portfolio_history(self, portfolio_id: str, limit: int = 50) -> Dict[str, Any]:
        """
        جلب تاريخ تداولات المحفظة
        """
        try:
            trades = self.session.query(Trade).filter_by(
                portfolio_id=portfolio_id
            ).order_by(Trade.timestamp.desc()).limit(limit).all()
            
            trade_history = []
            for trade in trades:
                trade_history.append({
                    "id": trade.id,
                    "type": trade.trade_type,
                    "quantity": trade.quantity,
                    "price": trade.price,
                    "total_value": trade.total_value,
                    "commission": trade.commission,
                    "profit_loss": trade.profit_loss,
                    "signal_source": trade.signal_source,
                    "signal_confidence": trade.signal_confidence,
                    "timestamp": trade.timestamp.isoformat(),
                    "notes": trade.notes
                })
            
            return {
                "portfolio_id": portfolio_id,
                "trade_history": trade_history,
                "total_trades": len(trade_history)
            }
            
        except Exception as e:
            return {"error": f"فشل في جلب التاريخ: {str(e)}"}
    
    def auto_trade_cycle(self, portfolio_id: str) -> Dict[str, Any]:
        """
        دورة تداول تلقائية
        """
        try:
            portfolio = self.session.query(Portfolio).filter_by(id=portfolio_id).first()
            if not portfolio or not portfolio.is_active:
                return {"error": "المحفظة غير متاحة للتداول التلقائي"}
            
            # الحصول على إشارة تداول
            signal = self.get_trading_signal(portfolio.symbol, portfolio.trading_strategy)
            if 'error' in signal:
                return signal
            
            # تنفيذ التداول
            result = self.execute_trade(portfolio_id, signal)
            
            # إضافة معلومات الأداء
            performance = self.get_portfolio_performance(portfolio_id)
            
            return {
                "cycle_result": result,
                "signal_info": signal,
                "performance": performance,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {"error": f"فشل في دورة التداول: {str(e)}"}
    
    def suggest_coins_for_investment(self, risk_level: str = "MEDIUM", count: int = 5) -> Dict[str, Any]:
        """
        اقتراح عملات للاستثمار بناءً على تحليل الذكاء الصناعي
        """
        try:
            popular_coins = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT", 
                           "XRPUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT"]
            
            suggestions = []
            
            for symbol in popular_coins[:count * 2]:  # تحليل ضعف العدد المطلوب للاختيار
                try:
                    signal = self.get_trading_signal(symbol, "AI_HYBRID")
                    if 'error' not in signal:
                        suggestions.append({
                            "symbol": symbol,
                            "recommendation": signal['action'],
                            "confidence": signal['confidence'],
                            "current_price": signal['current_price'],
                            "analysis_source": signal['source'],
                            "reasoning": signal['reasoning'],
                            "score": self.calculate_investment_score(signal, risk_level)
                        })
                except Exception as e:
                    continue
            
            # ترتيب حسب النتيجة
            suggestions.sort(key=lambda x: x['score'], reverse=True)
            
            return {
                "suggestions": suggestions[:count],
                "risk_level": risk_level,
                "analysis_timestamp": datetime.now().isoformat(),
                "note": "التوصيات مبنية على تحليل الذكاء الصناعي الحالي"
            }
            
        except Exception as e:
            return {"error": f"فشل في اقتراح العملات: {str(e)}"}
    
    def calculate_investment_score(self, signal: Dict, risk_level: str) -> float:
        """
        حساب نتيجة الاستثمار للعملة
        """
        base_score = signal['confidence']
        
        # تعديل النتيجة بناءً على نوع التوصية
        if signal['action'] == 'BUY':
            base_score *= 1.2
        elif signal['action'] == 'SELL':
            base_score *= 0.3
        else:  # HOLD
            base_score *= 0.7
        
        # تعديل بناءً على مستوى المخاطر
        if risk_level == "HIGH" and signal['action'] == 'BUY':
            base_score *= 1.1
        elif risk_level == "LOW" and signal['action'] != 'BUY':
            base_score *= 1.1
        
        return min(base_score, 100)
    
    def get_all_portfolios(self, user_id: str) -> Dict[str, Any]:
        """
        جلب جميع محافظ المستخدم
        """
        try:
            portfolios = self.session.query(Portfolio).filter_by(user_id=user_id).all()
            
            portfolio_list = []
            for portfolio in portfolios:
                performance = self.get_portfolio_performance(portfolio.id)
                if 'error' not in performance:
                    portfolio_list.append({
                        "id": portfolio.id,
                        "symbol": portfolio.symbol,
                        "strategy": portfolio.trading_strategy,
                        "risk_level": portfolio.risk_level,
                        "is_active": portfolio.is_active,
                        "created_at": portfolio.created_at.isoformat(),
                        "performance": performance
                    })
            
            return {
                "user_id": user_id,
                "portfolios": portfolio_list,
                "total_portfolios": len(portfolio_list)
            }
            
        except Exception as e:
            return {"error": f"فشل في جلب المحافظ: {str(e)}"}

# إنشاء instance عام
trading_simulator = None

def initialize_trading_simulator(database_url: str):
    global trading_simulator
    trading_simulator = TradingSimulator(database_url)
    return trading_simulator
