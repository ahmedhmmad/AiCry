"""
Enhanced Trading Signals Module
نظام إشارات التداول المحسن مع تحليل متقدم ومؤشرات ذكية
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import ta
from dataclasses import dataclass

@dataclass
class TradingSignal:
    """فئة لتمثيل إشارة التداول"""
    type: str
    strength: str
    confidence: float
    direction: str
    indicator: str
    price_level: float
    description: str
    timestamp: str
    volume_confirmation: bool = False

class EnhancedTradingSignals:
    """
    فئة لتوليد إشارات التداول المحسنة
    """
    
    def __init__(self, binance_client):
        self.binance_client = binance_client
        self.min_confidence = 60
        
    def get_enhanced_trading_signals(
        self, 
        symbol: str, 
        timeframe: str = "1h", 
        signal_strength: str = "all"
    ) -> Dict[str, Any]:
        """
        الحصول على إشارات التداول المحسنة
        """
        try:
            # جلب البيانات من Binance
            klines_data = self.binance_client.get_klines(symbol, timeframe, 200)
            
            if not klines_data:
                return {"error": f"Could not fetch data for {symbol}"}
            
            # تحويل البيانات إلى DataFrame
            df = self._prepare_dataframe(klines_data)
            
            # حساب المؤشرات المحسنة
            df = self._calculate_enhanced_indicators(df)
            
            # توليد الإشارات
            signals = self._generate_trading_signals(df, signal_strength)
            
            # تحليل السياق العام للسوق
            market_context = self._analyze_market_context(df)
            
            # تقييم شامل
            overall_assessment = self._assess_overall_signals(signals, market_context)
            
            # إنشاء النتيجة النهائية
            result = {
                "symbol": symbol.upper(),
                "timeframe": timeframe,
                "current_price": float(df['close'].iloc[-1]),
                "timestamp": datetime.utcnow().isoformat(),
                "signals": [self._signal_to_dict(signal) for signal in signals],
                "signal_count": len(signals),
                "market_context": market_context,
                "overall_assessment": overall_assessment,
                "data_quality": {
                    "data_points": len(df),
                    "missing_values": df.isnull().sum().sum(),
                    "timeframe": timeframe
                }
            }
            
            return result
            
        except Exception as e:
            return {"error": f"Failed to generate enhanced signals: {str(e)}"}
    
    def _prepare_dataframe(self, klines_data: List[Dict]) -> pd.DataFrame:
        """تحضير DataFrame من بيانات Binance"""
        df = pd.DataFrame([
            {
                'open': float(candle['open']),
                'high': float(candle['high']),
                'low': float(candle['low']),
                'close': float(candle['close']),
                'volume': float(candle['volume']),
                'timestamp': candle['timestamp']
            }
            for candle in klines_data
        ])
        
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        
        return df
    
    def _calculate_enhanced_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """حساب المؤشرات الفنية المحسنة"""
        
        # === المتوسطات المتحركة ===
        df['ema_20'] = ta.trend.EMAIndicator(df['close'], window=20).ema_indicator()
        df['ema_50'] = ta.trend.EMAIndicator(df['close'], window=50).ema_indicator()
        df['sma_20'] = ta.trend.SMAIndicator(df['close'], window=20).sma_indicator()
        df['sma_50'] = ta.trend.SMAIndicator(df['close'], window=50).sma_indicator()
        
        # === RSI مع تحسينات ===
        df['rsi'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
        df['rsi_ma'] = df['rsi'].rolling(window=5).mean()  # متوسط متحرك للـ RSI
        
        # === MACD محسن ===
        macd = ta.trend.MACD(df['close'])
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_histogram'] = macd.macd_diff()
        
        # === Bollinger Bands ===
        bb = ta.volatility.BollingerBands(df['close'], window=20, window_dev=2)
        df['bb_upper'] = bb.bollinger_hband()
        df['bb_middle'] = bb.bollinger_mavg()
        df['bb_lower'] = bb.bollinger_lband()
        df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['bb_middle']
        
        # === Volume Analysis ===
        df['volume_ma'] = df['volume'].rolling(window=20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma']
        
        # === Stochastic ===
        stoch = ta.momentum.StochasticOscillator(df['high'], df['low'], df['close'])
        df['stoch_k'] = stoch.stoch()
        df['stoch_d'] = stoch.stoch_signal()
        
        # === Williams %R ===
        df['williams_r'] = ta.momentum.WilliamsRIndicator(
            df['high'], df['low'], df['close'], window=14
        ).willr()
        
        # === Average True Range ===
        df['atr'] = ta.volatility.AverageTrueRange(
            df['high'], df['low'], df['close'], window=14
        ).average_true_range()
        
        # === Price Action Features ===
        df['price_change'] = df['close'].pct_change()
        df['high_low_ratio'] = (df['high'] - df['low']) / df['close']
        df['close_position'] = (df['close'] - df['low']) / (df['high'] - df['low'])
        
        return df
    
    def _generate_trading_signals(self, df: pd.DataFrame, signal_strength: str) -> List[TradingSignal]:
        """توليد إشارات التداول المحسنة"""
        signals = []
        current_idx = len(df) - 1
        
        if current_idx < 50:  # نحتاج بيانات كافية
            return signals
        
        current_price = df['close'].iloc[current_idx]
        current_volume = df['volume'].iloc[current_idx]
        volume_ratio = df['volume_ratio'].iloc[current_idx] if 'volume_ratio' in df.columns else 1
        
        # === RSI Signals ===
        signals.extend(self._check_rsi_signals(df, current_idx, current_price, volume_ratio))
        
        # === MACD Signals ===
        signals.extend(self._check_macd_signals(df, current_idx, current_price))
        
        # === Bollinger Bands Signals ===
        signals.extend(self._check_bb_signals(df, current_idx, current_price, volume_ratio))
        
        # === Moving Average Signals ===
        signals.extend(self._check_ma_signals(df, current_idx, current_price))
        
        # === Volume Breakout Signals ===
        signals.extend(self._check_volume_signals(df, current_idx, current_price, volume_ratio))
        
        # === Momentum Signals ===
        signals.extend(self._check_momentum_signals(df, current_idx, current_price))
        
        # تصفية الإشارات حسب القوة المطلوبة
        filtered_signals = self._filter_signals_by_strength(signals, signal_strength)
        
        return filtered_signals
    
    def _check_rsi_signals(self, df: pd.DataFrame, idx: int, price: float, volume_ratio: float) -> List[TradingSignal]:
        """فحص إشارات RSI مع تأكيد الحجم"""
        signals = []
        
        if idx < 5:
            return signals
        
        rsi_current = df['rsi'].iloc[idx]
        rsi_prev = df['rsi'].iloc[idx-1]
        
        # RSI Oversold with Volume Confirmation
        if rsi_current <= 30 and rsi_prev > rsi_current and volume_ratio > 1.2:
            confidence = min(95, 70 + (30 - rsi_current) * 2 + (volume_ratio - 1) * 10)
            signals.append(TradingSignal(
                type="RSI_OVERSOLD",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=confidence,
                direction="BUY",
                indicator="RSI",
                price_level=price,
                description=f"RSI oversold at {rsi_current:.1f} with high volume",
                timestamp=str(df.index[idx]),
                volume_confirmation=True
            ))
        
        # RSI Overbought with Volume Confirmation
        elif rsi_current >= 70 and rsi_prev < rsi_current and volume_ratio > 1.2:
            confidence = min(95, 70 + (rsi_current - 70) * 2 + (volume_ratio - 1) * 10)
            signals.append(TradingSignal(
                type="RSI_OVERBOUGHT",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=confidence,
                direction="SELL",
                indicator="RSI",
                price_level=price,
                description=f"RSI overbought at {rsi_current:.1f} with high volume",
                timestamp=str(df.index[idx]),
                volume_confirmation=True
            ))
        
        # RSI Divergence (simplified)
        elif 35 <= rsi_current <= 65:
            price_trend = (df['close'].iloc[idx] - df['close'].iloc[idx-5]) / df['close'].iloc[idx-5]
            rsi_trend = (rsi_current - df['rsi'].iloc[idx-5]) / df['rsi'].iloc[idx-5]
            
            if price_trend > 0.02 and rsi_trend < -0.1:  # Bearish divergence
                signals.append(TradingSignal(
                    type="RSI_BEARISH_DIVERGENCE",
                    strength="MEDIUM",
                    confidence=65,
                    direction="SELL",
                    indicator="RSI",
                    price_level=price,
                    description="Bearish divergence detected between price and RSI",
                    timestamp=str(df.index[idx])
                ))
            elif price_trend < -0.02 and rsi_trend > 0.1:  # Bullish divergence
                signals.append(TradingSignal(
                    type="RSI_BULLISH_DIVERGENCE",
                    strength="MEDIUM",
                    confidence=65,
                    direction="BUY",
                    indicator="RSI",
                    price_level=price,
                    description="Bullish divergence detected between price and RSI",
                    timestamp=str(df.index[idx])
                ))
        
        return signals
    
    def _check_macd_signals(self, df: pd.DataFrame, idx: int, price: float) -> List[TradingSignal]:
        """فحص إشارات MACD المحسنة"""
        signals = []
        
        if idx < 2:
            return signals
        
        macd_current = df['macd'].iloc[idx]
        macd_signal_current = df['macd_signal'].iloc[idx]
        macd_prev = df['macd'].iloc[idx-1]
        macd_signal_prev = df['macd_signal'].iloc[idx-1]
        histogram_current = df['macd_histogram'].iloc[idx]
        histogram_prev = df['macd_histogram'].iloc[idx-1]
        
        # MACD Bullish Crossover
        if (macd_current > macd_signal_current and 
            macd_prev <= macd_signal_prev and 
            histogram_current > 0):
            
            confidence = 75 + min(20, abs(histogram_current) * 100)
            signals.append(TradingSignal(
                type="MACD_BULLISH_CROSSOVER",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=confidence,
                direction="BUY",
                indicator="MACD",
                price_level=price,
                description="MACD bullish crossover with positive histogram",
                timestamp=str(df.index[idx])
            ))
        
        # MACD Bearish Crossover
        elif (macd_current < macd_signal_current and 
              macd_prev >= macd_signal_prev and 
              histogram_current < 0):
            
            confidence = 75 + min(20, abs(histogram_current) * 100)
            signals.append(TradingSignal(
                type="MACD_BEARISH_CROSSOVER",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=confidence,
                direction="SELL",
                indicator="MACD",
                price_level=price,
                description="MACD bearish crossover with negative histogram",
                timestamp=str(df.index[idx])
            ))
        
        # MACD Histogram Momentum
        elif abs(histogram_current) > abs(histogram_prev) * 1.5:
            direction = "BUY" if histogram_current > 0 else "SELL"
            momentum_type = "increasing" if histogram_current > 0 else "decreasing"
            
            signals.append(TradingSignal(
                type="MACD_HISTOGRAM_MOMENTUM",
                strength="MEDIUM",
                confidence=70,
                direction=direction,
                indicator="MACD",
                price_level=price,
                description=f"MACD histogram momentum {momentum_type}",
                timestamp=str(df.index[idx])
            ))
        
        return signals
    
    def _check_bb_signals(self, df: pd.DataFrame, idx: int, price: float, volume_ratio: float) -> List[TradingSignal]:
        """فحص إشارات Bollinger Bands"""
        signals = []
        
        if idx < 5:
            return signals
        
        bb_upper = df['bb_upper'].iloc[idx]
        bb_lower = df['bb_lower'].iloc[idx]
        bb_middle = df['bb_middle'].iloc[idx]
        bb_width = df['bb_width'].iloc[idx]
        bb_width_avg = df['bb_width'].iloc[idx-20:idx].mean() if idx >= 20 else bb_width
        
        # Bollinger Bands Squeeze (قبل الاختراق)
        if bb_width < bb_width_avg * 0.8 and volume_ratio > 1.3:
            signals.append(TradingSignal(
                type="BB_SQUEEZE_BREAKOUT_SETUP",
                strength="MEDIUM",
                confidence=70,
                direction="WATCH",
                indicator="Bollinger Bands",
                price_level=price,
                description="Bollinger Bands squeeze - potential breakout setup",
                timestamp=str(df.index[idx]),
                volume_confirmation=True
            ))
        
        # Lower Band Bounce
        elif price <= bb_lower * 1.005 and volume_ratio > 1.2:  # السعر قريب من الحد السفلي
            confidence = 75 + (volume_ratio - 1) * 10
            signals.append(TradingSignal(
                type="BB_LOWER_BOUNCE",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=min(95, confidence),
                direction="BUY",
                indicator="Bollinger Bands",
                price_level=price,
                description="Price touching lower Bollinger Band with volume",
                timestamp=str(df.index[idx]),
                volume_confirmation=True
            ))
        
        # Upper Band Rejection
        elif price >= bb_upper * 0.995 and volume_ratio > 1.2:  # السعر قريب من الحد العلوي
            confidence = 75 + (volume_ratio - 1) * 10
            signals.append(TradingSignal(
                type="BB_UPPER_REJECTION",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=min(95, confidence),
                direction="SELL",
                indicator="Bollinger Bands",
                price_level=price,
                description="Price touching upper Bollinger Band with volume",
                timestamp=str(df.index[idx]),
                volume_confirmation=True
            ))
        
        return signals
    
    def _check_ma_signals(self, df: pd.DataFrame, idx: int, price: float) -> List[TradingSignal]:
        """فحص إشارات المتوسطات المتحركة"""
        signals = []
        
        if idx < 2:
            return signals
        
        ema_20_current = df['ema_20'].iloc[idx]
        ema_50_current = df['ema_50'].iloc[idx]
        ema_20_prev = df['ema_20'].iloc[idx-1]
        ema_50_prev = df['ema_50'].iloc[idx-1]
        
        # Golden Cross
        if (ema_20_current > ema_50_current and 
            ema_20_prev <= ema_50_prev):
            
            signals.append(TradingSignal(
                type="GOLDEN_CROSS",
                strength="STRONG",
                confidence=85,
                direction="BUY",
                indicator="Moving Averages",
                price_level=price,
                description="Golden Cross: EMA 20 crosses above EMA 50",
                timestamp=str(df.index[idx])
            ))
        
        # Death Cross
        elif (ema_20_current < ema_50_current and 
              ema_20_prev >= ema_50_prev):
            
            signals.append(TradingSignal(
                type="DEATH_CROSS",
                strength="STRONG",
                confidence=85,
                direction="SELL",
                indicator="Moving Averages",
                price_level=price,
                description="Death Cross: EMA 20 crosses below EMA 50",
                timestamp=str(df.index[idx])
            ))
        
        # EMA 20 Breakout
        elif price > ema_20_current * 1.002 and df['close'].iloc[idx-1] <= ema_20_prev:
            signals.append(TradingSignal(
                type="EMA20_BREAKOUT",
                strength="MEDIUM",
                confidence=70,
                direction="BUY",
                indicator="EMA 20",
                price_level=price,
                description="Price breaks above EMA 20",
                timestamp=str(df.index[idx])
            ))
        
        # EMA 20 Breakdown
        elif price < ema_20_current * 0.998 and df['close'].iloc[idx-1] >= ema_20_prev:
            signals.append(TradingSignal(
                type="EMA20_BREAKDOWN",
                strength="MEDIUM",
                confidence=70,
                direction="SELL",
                indicator="EMA 20",
                price_level=price,
                description="Price breaks below EMA 20",
                timestamp=str(df.index[idx])
            ))
        
        return signals
    
    def _check_volume_signals(self, df: pd.DataFrame, idx: int, price: float, volume_ratio: float) -> List[TradingSignal]:
        """فحص إشارات الحجم"""
        signals = []
        
        if idx < 5:
            return signals
        
        price_change = (price - df['close'].iloc[idx-1]) / df['close'].iloc[idx-1]
        
        # High Volume Breakout
        if volume_ratio > 2.0 and price_change > 0.02:
            confidence = min(90, 60 + volume_ratio * 10 + price_change * 500)
            signals.append(TradingSignal(
                type="HIGH_VOLUME_BREAKOUT",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=confidence,
                direction="BUY",
                indicator="Volume",
                price_level=price,
                description=f"High volume breakout: {volume_ratio:.1f}x average volume",
                timestamp=str(df.index[idx]),
                volume_confirmation=True
            ))
        
        # High Volume Breakdown
        elif volume_ratio > 2.0 and price_change < -0.02:
            confidence = min(90, 60 + volume_ratio * 10 + abs(price_change) * 500)
            signals.append(TradingSignal(
                type="HIGH_VOLUME_BREAKDOWN",
                strength="STRONG" if confidence > 80 else "MEDIUM",
                confidence=confidence,
                direction="SELL",
                indicator="Volume",
                price_level=price,
                description=f"High volume breakdown: {volume_ratio:.1f}x average volume",
                timestamp=str(df.index[idx]),
                volume_confirmation=True
            ))
        
        return signals
    
    def _check_momentum_signals(self, df: pd.DataFrame, idx: int, price: float) -> List[TradingSignal]:
        """فحص إشارات الزخم"""
        signals = []
        
        if idx < 5:
            return signals
        
        # Stochastic Signals
        if 'stoch_k' in df.columns and 'stoch_d' in df.columns:
            stoch_k = df['stoch_k'].iloc[idx]
            stoch_d = df['stoch_d'].iloc[idx]
            stoch_k_prev = df['stoch_k'].iloc[idx-1]
            stoch_d_prev = df['stoch_d'].iloc[idx-1]
            
            # Stochastic Oversold Bullish Crossover
            if (stoch_k < 20 and stoch_k > stoch_d and 
                stoch_k_prev <= stoch_d_prev):
                
                signals.append(TradingSignal(
                    type="STOCH_OVERSOLD_BULLISH",
                    strength="MEDIUM",
                    confidence=75,
                    direction="BUY",
                    indicator="Stochastic",
                    price_level=price,
                    description="Stochastic oversold bullish crossover",
                    timestamp=str(df.index[idx])
                ))
            
            # Stochastic Overbought Bearish Crossover
            elif (stoch_k > 80 and stoch_k < stoch_d and 
                  stoch_k_prev >= stoch_d_prev):
                
                signals.append(TradingSignal(
                    type="STOCH_OVERBOUGHT_BEARISH",
                    strength="MEDIUM",
                    confidence=75,
                    direction="SELL",
                    indicator="Stochastic",
                    price_level=price,
                    description="Stochastic overbought bearish crossover",
                    timestamp=str(df.index[idx])
                ))
        
        # Williams %R Signals
        if 'williams_r' in df.columns:
            williams_r = df['williams_r'].iloc[idx]
            
            if williams_r <= -80:  # Oversold
                signals.append(TradingSignal(
                    type="WILLIAMS_R_OVERSOLD",
                    strength="MEDIUM",
                    confidence=70,
                    direction="BUY",
                    indicator="Williams %R",
                    price_level=price,
                    description=f"Williams %R oversold at {williams_r:.1f}",
                    timestamp=str(df.index[idx])
                ))
            elif williams_r >= -20:  # Overbought
                signals.append(TradingSignal(
                    type="WILLIAMS_R_OVERBOUGHT",
                    strength="MEDIUM",
                    confidence=70,
                    direction="SELL",
                    indicator="Williams %R",
                    price_level=price,
                    description=f"Williams %R overbought at {williams_r:.1f}",
                    timestamp=str(df.index[idx])
                ))
        
        return signals
    
    def _filter_signals_by_strength(self, signals: List[TradingSignal], signal_strength: str) -> List[TradingSignal]:
        """تصفية الإشارات حسب القوة المطلوبة"""
        if signal_strength == "all":
            return signals
        elif signal_strength == "strong":
            return [s for s in signals if s.strength == "STRONG"]
        elif signal_strength == "medium":
            return [s for s in signals if s.strength in ["STRONG", "MEDIUM"]]
        elif signal_strength == "weak":
            return signals  # include all
        else:
            return signals
    
    def _analyze_market_context(self, df: pd.DataFrame) -> Dict[str, Any]:
        """تحليل السياق العام للسوق"""
        current_price = df['close'].iloc[-1]
        ema_20 = df['ema_20'].iloc[-1] if 'ema_20' in df.columns else current_price
        ema_50 = df['ema_50'].iloc[-1] if 'ema_50' in df.columns else current_price
        
        # تحديد الاتجاه
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
        
        # حساب التقلب
        returns = df['close'].pct_change().dropna()
        volatility = returns.std() * 100
        
        # تحليل الحجم
        volume_ratio = df['volume_ratio'].iloc[-1] if 'volume_ratio' in df.columns else 1
        volume_trend = "HIGH" if volume_ratio > 1.5 else "NORMAL" if volume_ratio > 0.8 else "LOW"
        
        # حساب التغيير في 24 ساعة (تقريبي)
        if len(df) >= 24:
            price_24h_ago = df['close'].iloc[-24]
            price_change_24h = ((current_price - price_24h_ago) / price_24h_ago) * 100
        else:
            price_change_24h = 0
        
        # تقييم المخاطر
        if volatility > 8 or volume_ratio > 3:
            risk_level = "HIGH"
        elif volatility > 4 or volume_ratio > 1.5:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
        
        return {
            "trend": trend,
            "volatility": round(volatility, 2),
            "volume_trend": volume_trend,
            "volume_ratio": round(volume_ratio, 2),
            "price_change_24h": round(price_change_24h, 2),
            "risk_level": risk_level,
            "support_level": round(df['low'].tail(20).min(), 6),
            "resistance_level": round(df['high'].tail(20).max(), 6),
            "price_position": "UPPER" if current_price > (ema_20 + ema_50) / 2 else "LOWER"
        }
    
    def _assess_overall_signals(self, signals: List[TradingSignal], market_context: Dict) -> Dict[str, Any]:
        """تقييم شامل للإشارات"""
        if not signals:
            return {
                "overall_signal": "HOLD",
                "confidence": 50,
                "recommendation": "No clear signals detected",
                "signal_consensus": "NONE",
                "strongest_signal": {}
            }
        
        # تجميع الإشارات حسب الاتجاه
        buy_signals = [s for s in signals if s.direction == "BUY"]
        sell_signals = [s for s in signals if s.direction == "SELL"]
        
        # حساب الثقة المرجحة
        buy_confidence = sum(s.confidence for s in buy_signals) / len(buy_signals) if buy_signals else 0
        sell_confidence = sum(s.confidence for s in sell_signals) / len(sell_signals) if sell_signals else 0
        
        # تحديد الإشارة الإجمالية
        if len(buy_signals) > len(sell_signals) and buy_confidence > 70:
            overall_signal = "BUY"
            confidence = buy_confidence
        elif len(sell_signals) > len(buy_signals) and sell_confidence > 70:
            overall_signal = "SELL"
            confidence = sell_confidence
        else:
            overall_signal = "HOLD"
            confidence = 50
        
        # العثور على أقوى إشارة
        strongest_signal = max(signals, key=lambda x: x.confidence) if signals else None
        
        # تحديد مستوى الإجماع
        total_signals = len(signals)
        majority_direction_count = max(len(buy_signals), len(sell_signals))
        
        if majority_direction_count / total_signals > 0.8:
            consensus = "STRONG"
        elif majority_direction_count / total_signals > 0.6:
            consensus = "MODERATE"
        else:
            consensus = "MIXED"
        
        # إنشاء التوصية
        if overall_signal == "BUY":
            recommendation = f"Strong buy consensus with {len(buy_signals)} bullish signals"
        elif overall_signal == "SELL":
            recommendation = f"Strong sell consensus with {len(sell_signals)} bearish signals"
        else:
            recommendation = f"Mixed signals: {len(buy_signals)} buy, {len(sell_signals)} sell"
        
        return {
            "overall_signal": overall_signal,
            "confidence": round(confidence, 1),
            "recommendation": recommendation,
            "signal_consensus": consensus,
            "buy_signals_count": len(buy_signals),
            "sell_signals_count": len(sell_signals),
            "strongest_signal": {
                "type": strongest_signal.type if strongest_signal else "NONE",
                "confidence": strongest_signal.confidence if strongest_signal else 0,
                "indicator": strongest_signal.indicator if strongest_signal else "NONE"
            },
            "risk_assessment": market_context.get("risk_level", "MEDIUM"),
            "market_trend_alignment": self._check_trend_alignment(overall_signal, market_context)
        }
    
    def _check_trend_alignment(self, signal: str, market_context: Dict) -> str:
        """فحص توافق الإشارة مع اتجاه السوق"""
        trend = market_context.get("trend", "SIDEWAYS")
        
        if signal == "BUY" and trend in ["UPTREND", "STRONG_UPTREND"]:
            return "ALIGNED"
        elif signal == "SELL" and trend in ["DOWNTREND", "STRONG_DOWNTREND"]:
            return "ALIGNED"
        elif signal == "HOLD":
            return "NEUTRAL"
        else:
            return "COUNTER_TREND"
    
    def _signal_to_dict(self, signal: TradingSignal) -> Dict[str, Any]:
        """تحويل كائن الإشارة إلى قاموس"""
        return {
            "type": signal.type,
            "strength": signal.strength,
            "confidence": round(signal.confidence, 1),
            "direction": signal.direction,
            "indicator": signal.indicator,
            "price_level": round(signal.price_level, 6),
            "description": signal.description,
            "timestamp": signal.timestamp,
            "volume_confirmation": signal.volume_confirmation
        }

def analyze_timeframe_consensus(comparison_results: Dict[str, Any]) -> Dict[str, Any]:
    """
    تحليل الإجماع عبر الأطر الزمنية المتعددة
    """
    try:
        valid_results = {tf: result for tf, result in comparison_results.items() 
                        if "error" not in result and "overall_assessment" in result}
        
        if not valid_results:
            return {
                "consensus_signal": "NO_DATA",
                "consensus_confidence": 0,
                "timeframe_agreement": "NONE",
                "details": "No valid data from any timeframe"
            }
        
        # جمع الإشارات من كل إطار زمني
        signals = []
        confidences = []
        
        for tf, result in valid_results.items():
            overall = result.get("overall_assessment", {})
            signal = overall.get("overall_signal", "HOLD")
            confidence = overall.get("confidence", 50)
            
            signals.append(signal)
            confidences.append(confidence)
        
        # حساب الإجماع
        buy_count = signals.count("BUY")
        sell_count = signals.count("SELL")
        hold_count = signals.count("HOLD")
        
        total_timeframes = len(signals)
        
        # تحديد الإشارة الموحدة
        if buy_count > sell_count and buy_count > hold_count:
            consensus_signal = "BUY"
            signal_ratio = buy_count / total_timeframes
        elif sell_count > buy_count and sell_count > hold_count:
            consensus_signal = "SELL"
            signal_ratio = sell_count / total_timeframes
        else:
            consensus_signal = "HOLD"
            signal_ratio = hold_count / total_timeframes
        
        # حساب الثقة الموحدة
        avg_confidence = sum(confidences) / len(confidences)
        consensus_confidence = avg_confidence * signal_ratio
        
        # تحديد مستوى الاتفاق
        if signal_ratio >= 0.8:
            agreement_level = "STRONG_CONSENSUS"
        elif signal_ratio >= 0.6:
            agreement_level = "MODERATE_CONSENSUS"
        else:
            agreement_level = "MIXED_SIGNALS"
        
        # تحليل تفصيلي
        timeframe_details = {}
        for tf, result in valid_results.items():
            overall = result.get("overall_assessment", {})
            timeframe_details[tf] = {
                "signal": overall.get("overall_signal", "HOLD"),
                "confidence": overall.get("confidence", 50),
                "signals_count": result.get("signal_count", 0)
            }
        
        return {
            "consensus_signal": consensus_signal,
            "consensus_confidence": round(consensus_confidence, 1),
            "timeframe_agreement": agreement_level,
            "signal_distribution": {
                "buy": buy_count,
                "sell": sell_count,
                "hold": hold_count
            },
            "agreement_ratio": round(signal_ratio * 100, 1),
            "average_confidence": round(avg_confidence, 1),
            "timeframe_details": timeframe_details,
            "recommendation": generate_consensus_recommendation(
                consensus_signal, consensus_confidence, agreement_level
            )
        }
    
    except Exception as e:
        return {
            "consensus_signal": "ERROR",
            "consensus_confidence": 0,
            "timeframe_agreement": "ERROR",
            "error": str(e),
            "details": "Failed to analyze timeframe consensus"
        }

def generate_consensus_recommendation(signal: str, confidence: float, agreement: str) -> str:
    """إنشاء توصية بناءً على الإجماع"""
    if agreement == "STRONG_CONSENSUS" and confidence > 75:
        return f"Strong {signal.lower()} recommendation with high consensus across timeframes"
    elif agreement == "MODERATE_CONSENSUS" and confidence > 65:
        return f"Moderate {signal.lower()} recommendation with reasonable consensus"
    elif agreement == "MIXED_SIGNALS":
        return "Mixed signals across timeframes - proceed with caution"
    else:
        return "Weak signals - consider waiting for clearer market direction"
