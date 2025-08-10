# enhanced_trading_signals.py
# نظام الإشارات المحسن - ملف منفصل

import pandas as pd
import numpy as np
import ta
from typing import Dict, List, Any, Optional
from datetime import datetime

class EnhancedTradingSignals:
    """
    محرك إشارات التداول المحسن مع مؤشرات متقدمة وتحليل ذكي
    """
    
    def __init__(self, binance_client):
        self.binance_client = binance_client
        self.signal_history = []
        
    def get_enhanced_trading_signals(
        self, 
        symbol: str, 
        timeframe: str = "1h", 
        signal_strength: str = "all"
    ) -> Dict[str, Any]:
        """
        الحصول على إشارات التداول المحسنة
        
        Args:
            symbol: رمز العملة (مثل BTCUSDT)
            timeframe: الإطار الزمني (1m, 5m, 15m, 1h, 4h, 1d)
            signal_strength: قوة الإشارة (strong, medium, weak, all)
        
        Returns:
            قاموس يحتوي على الإشارات المحسنة
        """
        try:
            # جلب البيانات التاريخية
            limit = 200 if timeframe in ["1m", "5m", "15m"] else 500
            klines_data = self.binance_client.get_klines(symbol, timeframe, limit)
            
            if not klines_data:
                return {"error": f"Could not fetch data for {symbol}"}
            
            # تحويل البيانات إلى DataFrame
            df = self._prepare_dataframe(klines_data)
            
            # توليد الإشارات المحسنة
            signals = self._generate_enhanced_signals(df, symbol, timeframe)
            
            # تصفية الإشارات حسب القوة
            filtered_signals = self._filter_signals_by_strength(signals, signal_strength)
            
            # إضافة السياق السوقي
            market_context = self._get_market_context(df)
            
            # إضافة التقييم العام
            overall_assessment = self._calculate_overall_assessment(filtered_signals, market_context)
            
            return {
                "symbol": symbol.upper(),
                "timeframe": timeframe,
                "current_price": float(df['close'].iloc[-1]),
                "signals": filtered_signals,
                "market_context": market_context,
                "overall_assessment": overall_assessment,
                "signal_count": len(filtered_signals),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Error generating signals: {str(e)}"}
    
    def _prepare_dataframe(self, klines_data: List[Dict]) -> pd.DataFrame:
        """تحضير البيانات للتحليل"""
        df = pd.DataFrame(klines_data)
        
        # تحويل إلى float
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df
    
    def _calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """حساب المؤشرات الفنية"""
        # RSI
        df['rsi'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
        
        # MACD
        macd = ta.trend.MACD(df['close'])
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_histogram'] = macd.macd_diff()
        
        # Bollinger Bands
        bb = ta.volatility.BollingerBands(df['close'])
        df['bb_upper'] = bb.bollinger_hband()
        df['bb_lower'] = bb.bollinger_lband()
        df['bb_middle'] = bb.bollinger_mavg()
        
        # Moving Averages
        df['ema_20'] = ta.trend.EMAIndicator(df['close'], window=20).ema_indicator()
        df['ema_50'] = ta.trend.EMAIndicator(df['close'], window=50).ema_indicator()
        df['sma_20'] = ta.trend.SMAIndicator(df['close'], window=20).sma_indicator()
        
        # Volume indicators
        df['volume_sma'] = df['volume'].rolling(window=20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_sma']
        
        # Price change
        df['price_change'] = df['close'].pct_change()
        
        return df
    
    def _generate_enhanced_signals(self, df: pd.DataFrame, symbol: str, timeframe: str) -> List[Dict]:
        """توليد الإشارات المحسنة"""
        signals = []
        
        # حساب المؤشرات الأساسية
        df = self._calculate_technical_indicators(df)
        
        current_price = float(df['close'].iloc[-1])
        
        # 1. إشارات RSI المحسنة
        rsi_signals = self._generate_rsi_signals(df, current_price)
        signals.extend(rsi_signals)
        
        # 2. إشارات MACD المحسنة
        macd_signals = self._generate_macd_signals(df, current_price)
        signals.extend(macd_signals)
        
        # 3. إشارات Bollinger Bands
        bb_signals = self._generate_bollinger_signals(df, current_price)
        signals.extend(bb_signals)
        
        # 4. إشارات Moving Averages
        ma_signals = self._generate_moving_average_signals(df, current_price)
        signals.extend(ma_signals)
        
        # 5. إشارات Volume Analysis
        volume_signals = self._generate_volume_signals(df, current_price)
        signals.extend(volume_signals)
        
        # 6. إشارات AI (إذا كانت متوفرة)
        ai_signals = self._generate_ai_signals(df, current_price)
        signals.extend(ai_signals)
        
        # إضافة معلومات إضافية لكل إشارة
        for signal in signals:
            signal.update({
                "symbol": symbol,
                "timeframe": timeframe,
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return signals
    
    def _generate_rsi_signals(self, df: pd.DataFrame, current_price: float) -> List[Dict]:
        """توليد إشارات RSI المحسنة"""
        signals = []
        
        current_rsi = float(df['rsi'].iloc[-1])
        volume_ratio = float(df['volume_ratio'].iloc[-1])
        
        # إشارة ذروة البيع مع تأكيد الحجم
        if current_rsi < 30 and volume_ratio > 1.2:
            signals.append({
                "type": "BUY",
                "indicator": "RSI_OVERSOLD_VOLUME",
                "confidence": min(85, 75 + (30 - current_rsi) * 2),
                "entry_price": current_price,
                "target_price": current_price * 1.05,
                "stop_loss": current_price * 0.97,
                "reason": f"RSI oversold at {current_rsi:.1f} with high volume confirmation",
                "strength": "STRONG" if current_rsi < 25 else "MEDIUM"
            })
        
        # إشارة ذروة البيع عادية
        elif current_rsi < 35 and volume_ratio > 1.0:
            signals.append({
                "type": "BUY",
                "indicator": "RSI_OVERSOLD",
                "confidence": 60 + (35 - current_rsi) * 1.5,
                "entry_price": current_price,
                "target_price": current_price * 1.03,
                "stop_loss": current_price * 0.98,
                "reason": f"RSI approaching oversold at {current_rsi:.1f}",
                "strength": "MEDIUM"
            })
        
        # إشارة ذروة الشراء مع تأكيد الحجم
        elif current_rsi > 70 and volume_ratio > 1.2:
            signals.append({
                "type": "SELL",
                "indicator": "RSI_OVERBOUGHT_VOLUME",
                "confidence": min(85, 75 + (current_rsi - 70) * 2),
                "entry_price": current_price,
                "target_price": current_price * 0.95,
                "stop_loss": current_price * 1.03,
                "reason": f"RSI overbought at {current_rsi:.1f} with high volume confirmation",
                "strength": "STRONG" if current_rsi > 75 else "MEDIUM"
            })
        
        # إشارة ذروة الشراء عادية
        elif current_rsi > 65 and volume_ratio > 1.0:
            signals.append({
                "type": "SELL",
                "indicator": "RSI_OVERBOUGHT",
                "confidence": 60 + (current_rsi - 65) * 1.5,
                "entry_price": current_price,
                "target_price": current_price * 0.97,
                "stop_loss": current_price * 1.02,
                "reason": f"RSI approaching overbought at {current_rsi:.1f}",
                "strength": "MEDIUM"
            })
        
        return signals
    
    def _generate_macd_signals(self, df: pd.DataFrame, current_price: float) -> List[Dict]:
        """توليد إشارات MACD المحسنة"""
        signals = []
        
        if len(df) < 2:
            return signals
        
        current_macd = float(df['macd'].iloc[-1])
        current_signal = float(df['macd_signal'].iloc[-1])
        prev_macd = float(df['macd'].iloc[-2])
        prev_signal = float(df['macd_signal'].iloc[-2])
        current_histogram = float(df['macd_histogram'].iloc[-1])
        
        # تقاطع صاعد
        if current_macd > current_signal and prev_macd <= prev_signal:
            confidence = 70
            # زيادة الثقة إذا كان التقاطع من تحت الصفر
            if current_macd < 0:
                confidence += 10
            
            signals.append({
                "type": "BUY",
                "indicator": "MACD_BULLISH_CROSSOVER",
                "confidence": confidence,
                "entry_price": current_price,
                "target_price": current_price * 1.04,
                "stop_loss": current_price * 0.98,
                "reason": "MACD bullish crossover detected",
                "strength": "STRONG" if current_macd < 0 else "MEDIUM"
            })
        
        # تقاطع هابط
        elif current_macd < current_signal and prev_macd >= prev_signal:
            confidence = 70
            # زيادة الثقة إذا كان التقاطع من فوق الصفر
            if current_macd > 0:
                confidence += 10
            
            signals.append({
                "type": "SELL",
                "indicator": "MACD_BEARISH_CROSSOVER",
                "confidence": confidence,
                "entry_price": current_price,
                "target_price": current_price * 0.96,
                "stop_loss": current_price * 1.02,
                "reason": "MACD bearish crossover detected",
                "strength": "STRONG" if current_macd > 0 else "MEDIUM"
            })
        
        return signals
    
    def _generate_bollinger_signals(self, df: pd.DataFrame, current_price: float) -> List[Dict]:
        """توليد إشارات Bollinger Bands"""
        signals = []
        
        bb_upper = float(df['bb_upper'].iloc[-1])
        bb_lower = float(df['bb_lower'].iloc[-1])
        bb_middle = float(df['bb_middle'].iloc[-1])
        current_rsi = float(df['rsi'].iloc[-1])
        
        # السعر عند الحد السفلي مع تأكيد RSI
        if current_price <= bb_lower * 1.01 and current_rsi < 40:
            signals.append({
                "type": "BUY",
                "indicator": "BB_LOWER_BOUNCE",
                "confidence": 65,
                "entry_price": current_price,
                "target_price": bb_middle,
                "stop_loss": bb_lower * 0.99,
                "reason": "Price at Bollinger lower band with RSI confirmation",
                "strength": "MEDIUM"
            })
        
        # السعر عند الحد العلوي مع تأكيد RSI
        elif current_price >= bb_upper * 0.99 and current_rsi > 60:
            signals.append({
                "type": "SELL",
                "indicator": "BB_UPPER_REJECTION",
                "confidence": 65,
                "entry_price": current_price,
                "target_price": bb_middle,
                "stop_loss": bb_upper * 1.01,
                "reason": "Price at Bollinger upper band with RSI confirmation",
                "strength": "MEDIUM"
            })
        
        return signals
    
    def _generate_moving_average_signals(self, df: pd.DataFrame, current_price: float) -> List[Dict]:
        """توليد إشارات المتوسطات المتحركة"""
        signals = []
        
        if len(df) < 2:
            return signals
        
        ema_20 = float(df['ema_20'].iloc[-1])
        ema_50 = float(df['ema_50'].iloc[-1])
        prev_price = float(df['close'].iloc[-2])
        
        # كسر المتوسط المتحرك من الأسفل
        if current_price > ema_20 and prev_price <= float(df['ema_20'].iloc[-2]):
            signals.append({
                "type": "BUY",
                "indicator": "EMA20_BREAKOUT",
                "confidence": 60,
                "entry_price": current_price,
                "target_price": current_price * 1.03,
                "stop_loss": ema_20 * 0.995,
                "reason": "Price breaking above EMA 20",
                "strength": "MEDIUM"
            })
        
        # تقاطع المتوسطات (Golden Cross / Death Cross)
        if len(df) >= 50:
            prev_ema_20 = float(df['ema_20'].iloc[-2])
            prev_ema_50 = float(df['ema_50'].iloc[-2])
            
            # Golden Cross
            if ema_20 > ema_50 and prev_ema_20 <= prev_ema_50:
                signals.append({
                    "type": "BUY",
                    "indicator": "GOLDEN_CROSS",
                    "confidence": 75,
                    "entry_price": current_price,
                    "target_price": current_price * 1.06,
                    "stop_loss": current_price * 0.96,
                    "reason": "Golden Cross - EMA 20 crossing above EMA 50",
                    "strength": "STRONG"
                })
            
            # Death Cross
            elif ema_20 < ema_50 and prev_ema_20 >= prev_ema_50:
                signals.append({
                    "type": "SELL",
                    "indicator": "DEATH_CROSS",
                    "confidence": 75,
                    "entry_price": current_price,
                    "target_price": current_price * 0.94,
                    "stop_loss": current_price * 1.04,
                    "reason": "Death Cross - EMA 20 crossing below EMA 50",
                    "strength": "STRONG"
                })
        
        return signals
    
    def _generate_volume_signals(self, df: pd.DataFrame, current_price: float) -> List[Dict]:
        """توليد إشارات تحليل الحجم"""
        signals = []
        
        volume_ratio = float(df['volume_ratio'].iloc[-1])
        price_change = float(df['price_change'].iloc[-1])
        
        # حجم عالي مع حركة سعر إيجابية
        if volume_ratio > 2.0 and price_change > 0.02:  # 2% ارتفاع
            signals.append({
                "type": "BUY",
                "indicator": "HIGH_VOLUME_BREAKOUT",
                "confidence": 70,
                "entry_price": current_price,
                "target_price": current_price * 1.05,
                "stop_loss": current_price * 0.97,
                "reason": f"High volume ({volume_ratio:.1f}x avg) with {price_change*100:.1f}% price increase",
                "strength": "STRONG"
            })
        
        # حجم عالي مع حركة سعر سلبية
        elif volume_ratio > 2.0 and price_change < -0.02:  # 2% انخفاض
            signals.append({
                "type": "SELL",
                "indicator": "HIGH_VOLUME_BREAKDOWN",
                "confidence": 70,
                "entry_price": current_price,
                "target_price": current_price * 0.95,
                "stop_loss": current_price * 1.03,
                "reason": f"High volume ({volume_ratio:.1f}x avg) with {price_change*100:.1f}% price decrease",
                "strength": "STRONG"
            })
        
        return signals
    
    def _generate_ai_signals(self, df: pd.DataFrame, current_price: float) -> List[Dict]:
        """توليد إشارات AI"""
        signals = []
        
        try:
            close_prices = df['close'].tolist()
            
            # محاولة استيراد نماذج AI
            try:
                from simple_ai import simple_ai
                if hasattr(simple_ai, 'predict') and len(close_prices) >= 30:
                    simple_result = simple_ai.predict(close_prices)
                    if 'error' not in simple_result:
                        recommendation = simple_result.get('recommendation', 'HOLD')
                        confidence = simple_result.get('confidence', 50)
                        
                        if recommendation in ['BUY', 'SELL'] and confidence > 60:
                            signals.append({
                                "type": recommendation,
                                "indicator": "SIMPLE_AI_PREDICTION",
                                "confidence": confidence,
                                "entry_price": current_price,
                                "target_price": current_price * (1.03 if recommendation == 'BUY' else 0.97),
                                "stop_loss": current_price * (0.98 if recommendation == 'BUY' else 1.02),
                                "reason": f"Simple AI model prediction with {confidence}% confidence",
                                "strength": "STRONG" if confidence > 80 else "MEDIUM"
                            })
            except ImportError:
                pass  # Simple AI غير متوفر
            
        except Exception as e:
            print(f"AI signal generation failed: {e}")
        
        return signals
    
    def _filter_signals_by_strength(self, signals: List[Dict], signal_strength: str) -> List[Dict]:
        """تصفية الإشارات حسب القوة"""
        if signal_strength == "all":
            return signals
        
        strength_map = {
            "strong": 80,
            "medium": 60,
            "weak": 40
        }
        
        min_confidence = strength_map.get(signal_strength, 50)
        return [s for s in signals if s.get('confidence', 0) >= min_confidence]
    
    def _get_market_context(self, df: pd.DataFrame) -> Dict[str, Any]:
        """الحصول على السياق السوقي"""
        try:
            current_price = float(df['close'].iloc[-1])
            
            # حساب التغيير في 24 ساعة
            price_change_24h = 0
            if len(df) >= 25:  # assuming hourly data
                price_24h_ago = float(df['close'].iloc[-25])
                price_change_24h = ((current_price - price_24h_ago) / price_24h_ago) * 100
            
            # حساب التقلبات
            volatility = df['close'].pct_change().tail(20).std() * 100
            
            # تحليل الحجم
            volume_avg = float(df['volume'].rolling(20).mean().iloc[-1])
            volume_current = float(df['volume'].iloc[-1])
            volume_ratio = volume_current / volume_avg
            
            # تحديد الاتجاه
            if len(df) >= 50:
                ema_20 = float(df['ema_20'].iloc[-1])
                ema_50 = float(df['ema_50'].iloc[-1])
                
                if current_price > ema_20 > ema_50:
                    trend = "STRONG_UPTREND"
                elif current_price > ema_20:
                    trend = "UPTREND"
                elif current_price < ema_20 < ema_50:
                    trend = "STRONG_DOWNTREND"
                elif current_price < ema_20:
                    trend = "DOWNTREND"
                else:
                    trend = "SIDEWAYS"
            else:
                trend = "INSUFFICIENT_DATA"
            
            return {
                "current_price": current_price,
                "price_change_24h": round(price_change_24h, 2),
                "volatility": round(volatility, 2),
                "volume_ratio": round(volume_ratio, 2),
                "trend": trend,
                "market_sentiment": self._determine_sentiment(price_change_24h, volatility),
                "risk_level": self._determine_risk_level(volatility, volume_ratio)
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def _determine_sentiment(self, price_change: float, volatility: float) -> str:
        """تحديد المعنويات السوقية"""
        if price_change > 5:
            return "VERY_BULLISH"
        elif price_change > 2:
            return "BULLISH"
        elif price_change > -2:
            return "NEUTRAL"
        elif price_change > -5:
            return "BEARISH"
        else:
            return "VERY_BEARISH"
    
    def _determine_risk_level(self, volatility: float, volume_ratio: float) -> str:
        """تحديد مستوى المخاطرة"""
        if volatility > 8 or volume_ratio > 3:
            return "HIGH"
        elif volatility > 4 or volume_ratio > 1.5:
            return "MEDIUM"
        else:
            return "LOW"
    
    def _calculate_overall_assessment(self, signals: List[Dict], market_context: Dict) -> Dict[str, Any]:
        """حساب التقييم العام"""
        if not signals:
            return {
                "overall_signal": "HOLD",
                "confidence": 50,
                "recommendation": "No clear signals - wait for better opportunities"
            }
        
        # تجميع الإشارات
        buy_signals = [s for s in signals if s['type'] == 'BUY']
        sell_signals = [s for s in signals if s['type'] == 'SELL']
        
        # حساب الثقة المرجحة
        total_buy_confidence = sum(s['confidence'] * self._get_signal_weight(s) for s in buy_signals)
        total_sell_confidence = sum(s['confidence'] * self._get_signal_weight(s) for s in sell_signals)
        
        total_buy_weight = sum(self._get_signal_weight(s) for s in buy_signals)
        total_sell_weight = sum(self._get_signal_weight(s) for s in sell_signals)
        
        # تحديد الإشارة العامة
        if total_buy_confidence > total_sell_confidence * 1.2:
            overall_signal = "BUY"
            confidence = min(90, total_buy_confidence / max(total_buy_weight, 1))
        elif total_sell_confidence > total_buy_confidence * 1.2:
            overall_signal = "SELL"
            confidence = min(90, total_sell_confidence / max(total_sell_weight, 1))
        else:
            overall_signal = "HOLD"
            confidence = 50
        
        # تعديل بناءً على السياق السوقي
        risk_level = market_context.get('risk_level', 'MEDIUM')
        if risk_level == 'HIGH':
            confidence *= 0.8  # تقليل الثقة في البيئة عالية المخاطر
        
        return {
            "overall_signal": overall_signal,
            "confidence": round(confidence, 1),
            "buy_signals_count": len(buy_signals),
            "sell_signals_count": len(sell_signals),
            "strongest_signal": self._get_strongest_signal(signals),
            "recommendation": self._generate_recommendation(overall_signal, confidence, market_context)
        }
    
    def _get_signal_weight(self, signal: Dict) -> float:
        """حساب وزن الإشارة"""
        weights = {
            "STRONG": 1.0,
            "MEDIUM": 0.7,
            "WEAK": 0.4
        }
        return weights.get(signal.get('strength', 'MEDIUM'), 0.7)
    
    def _get_strongest_signal(self, signals: List[Dict]) -> Optional[Dict]:
        """الحصول على أقوى إشارة"""
        if not signals:
            return None
        
        return max(signals, key=lambda s: s.get('confidence', 0))
    
    def _generate_recommendation(self, signal: str, confidence: float, market_context: Dict) -> str:
        """توليد التوصية النهائية"""
        risk_level = market_context.get('risk_level', 'MEDIUM')
        trend = market_context.get('trend', 'SIDEWAYS')
        
        if signal == "BUY":
            if confidence > 80 and risk_level != 'HIGH':
                return f"Strong BUY signal with {confidence:.1f}% confidence. Consider entering position."
            elif confidence > 60:
                return f"Moderate BUY signal with {confidence:.1f}% confidence. Enter with caution."
            else:
                return f"Weak BUY signal. Wait for stronger confirmation."
        
        elif signal == "SELL":
            if confidence > 80 and risk_level != 'HIGH':
                return f"Strong SELL signal with {confidence:.1f}% confidence. Consider exiting position."
            elif confidence > 60:
                return f"Moderate SELL signal with {confidence:.1f}% confidence. Exit with caution."
            else:
                return f"Weak SELL signal. Monitor closely for confirmation."
        
        else:
            return f"No clear direction. Market is {trend.lower()}. Wait for better opportunities."


def analyze_timeframe_consensus(results: Dict) -> Dict:
    """تحليل التوافق بين الأطر الزمنية"""
    valid_results = {k: v for k, v in results.items() if "error" not in v}
    
    if not valid_results:
        return {"consensus": "NO_DATA", "confidence": 0}
    
    # جمع الإشارات العامة
    overall_signals = []
    confidences = []
    
    for timeframe, data in valid_results.items():
        overall_assessment = data.get("overall_assessment", {})
        signal = overall_assessment.get("overall_signal", "HOLD")
        confidence = overall_assessment.get("confidence", 50)
        
        overall_signals.append(signal)
        confidences.append(confidence)
    
    # حساب التوافق
    buy_count = overall_signals.count("BUY")
    sell_count = overall_signals.count("SELL")
    hold_count = overall_signals.count("HOLD")
    
    total_signals = len(overall_signals)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 50
    
    # تحديد التوافق
    if buy_count > sell_count and buy_count > hold_count:
        consensus = "BUY"
        consensus_strength = (buy_count / total_signals) * 100
    elif sell_count > buy_count and sell_count > hold_count:
        consensus = "SELL"
        consensus_strength = (sell_count / total_signals) * 100
    else:
        consensus = "HOLD"
        consensus_strength = max(buy_count, sell_count, hold_count) / total_signals * 100
    
    return {
        "consensus": consensus,
        "consensus_strength": round(consensus_strength, 1),
        "average_confidence": round(avg_confidence, 1),
        "timeframes_analyzed": len(valid_results),
        "signal_distribution": {
            "buy": buy_count,
            "sell": sell_count,
            "hold": hold_count
        },
        "reliability": "HIGH" if consensus_strength > 80 and avg_confidence > 70 else 
                      "MEDIUM" if consensus_strength > 60 and avg_confidence > 60 else "LOW"
    }
