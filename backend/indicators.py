import pandas as pd
import numpy as np
from typing import List, Dict, Any

def calculate_ema(data: pd.Series, period: int) -> pd.Series:
    """حساب المتوسط المتحرك الأسي"""
    return data.ewm(span=period, adjust=False).mean()

def calculate_sma(data: pd.Series, period: int) -> pd.Series:
    """حساب المتوسط المتحرك البسيط"""
    return data.rolling(window=period).mean()

def calculate_rsi(prices: List[float], period: int = 14) -> Dict[str, Any]:
    """
    حساب مؤشر RSI (Relative Strength Index)
    """
    if len(prices) < period + 1:
        return {"error": "Not enough data points for RSI"}
    
    close_prices = pd.Series(prices)
    
    # حساب التغيرات
    delta = close_prices.diff()
    
    # فصل المكاسب والخسائر
    gains = delta.where(delta > 0, 0)
    losses = -delta.where(delta < 0, 0)
    
    # حساب المتوسط للمكاسب والخسائر
    avg_gains = gains.rolling(window=period).mean()
    avg_losses = losses.rolling(window=period).mean()
    
    # حساب RS و RSI
    rs = avg_gains / avg_losses
    rsi = 100 - (100 / (1 + rs))
    
    current_rsi = round(rsi.iloc[-1], 2)
    
    # تحديد الإشارة
    if current_rsi >= 70:
        signal = "OVERBOUGHT"
        interpretation = "منطقة تشبع شرائي - احتمالية هبوط"
        strength = "STRONG"
    elif current_rsi <= 30:
        signal = "OVERSOLD"
        interpretation = "منطقة تشبع بيعي - احتمالية صعود"
        strength = "STRONG"
    elif current_rsi >= 60:
        signal = "BULLISH"
        interpretation = "اتجاه صاعد قوي"
        strength = "MEDIUM"
    elif current_rsi <= 40:
        signal = "BEARISH"
        interpretation = "اتجاه هابط قوي"
        strength = "MEDIUM"
    else:
        signal = "NEUTRAL"
        interpretation = "منطقة محايدة"
        strength = "WEAK"
    
    return {
        "rsi": current_rsi,
        "signal": signal,
        "strength": strength,
        "interpretation": interpretation,
        "overbought_level": 70,
        "oversold_level": 30
    }

def calculate_moving_averages(prices: List[float]) -> Dict[str, Any]:
    """
    حساب المتوسطات المتحركة المختلفة
    """
    close_prices = pd.Series(prices)
    
    result = {}
    
    # المتوسطات قصيرة المدى
    if len(prices) >= 20:
        ma20 = calculate_sma(close_prices, 20)
        result["ma20"] = round(ma20.iloc[-1], 2)
    
    # المتوسطات متوسطة المدى
    if len(prices) >= 50:
        ma50 = calculate_sma(close_prices, 50)
        result["ma50"] = round(ma50.iloc[-1], 2)
        
        # تحديد الاتجاه بناءً على MA50
        current_price = prices[-1]
        if current_price > result["ma50"]:
            result["ma50_signal"] = "ABOVE"
            result["ma50_interpretation"] = "السعر أعلى من المتوسط - اتجاه صاعد"
        else:
            result["ma50_signal"] = "BELOW"
            result["ma50_interpretation"] = "السعر أسفل المتوسط - اتجاه هابط"
    
    # المتوسطات طويلة المدى
    if len(prices) >= 200:
        ma200 = calculate_sma(close_prices, 200)
        result["ma200"] = round(ma200.iloc[-1], 2)
        
        current_price = prices[-1]
        if current_price > result["ma200"]:
            result["ma200_signal"] = "ABOVE"
            result["ma200_interpretation"] = "اتجاه صاعد طويل المدى"
        else:
            result["ma200_signal"] = "BELOW"
            result["ma200_interpretation"] = "اتجاه هابط طويل المدى"
        
        # Golden Cross / Death Cross
        if "ma50" in result:
            if result["ma50"] > result["ma200"]:
                result["cross_signal"] = "GOLDEN_CROSS"
                result["cross_interpretation"] = "إشارة صاعدة قوية (Golden Cross)"
            else:
                result["cross_signal"] = "DEATH_CROSS"
                result["cross_interpretation"] = "إشارة هابطة قوية (Death Cross)"
    
    return result

def calculate_macd(prices: List[float], fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> Dict[str, Any]:
    """
    حساب مؤشر MACD (محسن)
    """
    if len(prices) < slow_period:
        return {"error": "Not enough data points"}
    
    close_prices = pd.Series(prices)
    
    # حساب المتوسطات المتحركة الأسية
    ema_fast = calculate_ema(close_prices, fast_period)
    ema_slow = calculate_ema(close_prices, slow_period)
    
    # حساب MACD line
    macd_line = ema_fast - ema_slow
    
    # حساب Signal line
    signal_line = calculate_ema(macd_line, signal_period)
    
    # حساب Histogram
    histogram = macd_line - signal_line
    
    # الحصول على آخر القيم
    current_macd = round(macd_line.iloc[-1], 6)
    current_signal = round(signal_line.iloc[-1], 6)
    current_histogram = round(histogram.iloc[-1], 6)
    
    # تحديد الإشارة
    signal = "HOLD"
    signal_strength = "WEAK"
    
    # فحص التقاطع
    if len(macd_line) > 1:
        prev_macd = macd_line.iloc[-2]
        prev_signal = signal_line.iloc[-2]
        
        # تقاطع صاعد (إشارة شراء)
        if current_macd > current_signal and prev_macd <= prev_signal:
            signal = "BUY"
            signal_strength = "STRONG"
        # تقاطع هابط (إشارة بيع)
        elif current_macd < current_signal and prev_macd >= prev_signal:
            signal = "SELL"
            signal_strength = "STRONG"
        # اتجاه بدون تقاطع
        elif current_macd > current_signal:
            signal = "BULLISH"
            signal_strength = "MEDIUM" if abs(current_histogram) > 0.5 else "WEAK"
        elif current_macd < current_signal:
            signal = "BEARISH"
            signal_strength = "MEDIUM" if abs(current_histogram) > 0.5 else "WEAK"
    
    # تحليل إضافي
    trend_direction = "UP" if current_macd > current_signal else "DOWN"
    momentum = "INCREASING" if current_histogram > 0 else "DECREASING"
    
    return {
        "macd": current_macd,
        "signal": current_signal,
        "histogram": current_histogram,
        "recommendation": signal,
        "strength": signal_strength,
        "analysis": {
            "trend_direction": trend_direction,
            "momentum": momentum,
            "crossover": signal in ["BUY", "SELL"],
            "histogram_value": current_histogram,
            "distance_from_zero": abs(current_macd)
        },
        "interpretation": get_macd_interpretation(signal, current_histogram, trend_direction)
    }

def comprehensive_analysis(prices: List[float]) -> Dict[str, Any]:
    """
    تحليل شامل يجمع كل المؤشرات
    """
    if len(prices) < 50:
        return {"error": "Need at least 50 data points for comprehensive analysis"}
    
    # حساب كل المؤشرات
    macd_result = calculate_macd(prices)
    rsi_result = calculate_rsi(prices)
    ma_result = calculate_moving_averages(prices)
    
    # تجميع الإشارات
    signals = []
    
    # إشارات MACD
    if macd_result.get("recommendation") in ["BUY", "BULLISH"]:
        signals.append("BULLISH")
    elif macd_result.get("recommendation") in ["SELL", "BEARISH"]:
        signals.append("BEARISH")
    
    # إشارات RSI
    if rsi_result.get("signal") == "OVERSOLD":
        signals.append("BULLISH")
    elif rsi_result.get("signal") == "OVERBOUGHT":
        signals.append("BEARISH")
    
    # إشارات المتوسطات المتحركة
    if ma_result.get("ma50_signal") == "ABOVE":
        signals.append("BULLISH")
    elif ma_result.get("ma50_signal") == "BELOW":
        signals.append("BEARISH")
    
    # حساب التوصية الإجمالية
    bullish_count = signals.count("BULLISH")
    bearish_count = signals.count("BEARISH")
    
    if bullish_count > bearish_count:
        overall_signal = "BUY"
        confidence = round((bullish_count / len(signals)) * 100, 1)
    elif bearish_count > bullish_count:
        overall_signal = "SELL"
        confidence = round((bearish_count / len(signals)) * 100, 1)
    else:
        overall_signal = "HOLD"
        confidence = 50.0
    
    return {
        "overall_recommendation": overall_signal,
        "confidence": confidence,
        "analysis_summary": {
            "bullish_signals": bullish_count,
            "bearish_signals": bearish_count,
            "total_indicators": len(signals)
        },
        "macd": macd_result,
        "rsi": rsi_result,
        "moving_averages": ma_result,
        "interpretation": get_comprehensive_interpretation(overall_signal, confidence)
    }

def get_macd_interpretation(signal: str, histogram: float, trend: str) -> str:
    """تفسير نتائج MACD بالعربية"""
    if signal == "BUY":
        return "إشارة شراء قوية - MACD تقاطع صاعد مع خط الإشارة"
    elif signal == "SELL":
        return "إشارة بيع قوية - MACD تقاطع هابط مع خط الإشارة"
    elif signal == "BULLISH":
        strength = "قوي" if abs(histogram) > 0.5 else "ضعيف"
        return f"اتجاه صاعد {strength} - MACD أعلى من خط الإشارة"
    elif signal == "BEARISH":
        strength = "قوي" if abs(histogram) > 0.5 else "ضعيف"
        return f"اتجاه هابط {strength} - MACD أسفل خط الإشارة"
    else:
        return "لا توجد إشارة واضحة - انتظار تأكيد الاتجاه"

def get_comprehensive_interpretation(signal: str, confidence: float) -> str:
    """تفسير التحليل الشامل"""
    if signal == "BUY":
        if confidence >= 80:
            return f"إشارة شراء قوية جداً - ثقة {confidence}%"
        elif confidence >= 60:
            return f"إشارة شراء جيدة - ثقة {confidence}%"
        else:
            return f"إشارة شراء ضعيفة - ثقة {confidence}%"
    elif signal == "SELL":
        if confidence >= 80:
            return f"إشارة بيع قوية جداً - ثقة {confidence}%"
        elif confidence >= 60:
            return f"إشارة بيع جيدة - ثقة {confidence}%"
        else:
            return f"إشارة بيع ضعيفة - ثقة {confidence}%"
    else:
        return "إشارات متضاربة - من الأفضل الانتظار"

def generate_sample_data(days: int = 50) -> List[float]:
    """
    توليد بيانات واقعية للاختبار
    """
    np.random.seed(42)
    base_price = 188.50
    prices = [base_price]
    
    for i in range(days - 1):
        trend = 0.001 if i < days//2 else -0.002
        volatility = np.random.normal(0, 0.025)
        
        change = trend + volatility
        new_price = prices[-1] * (1 + change)
        prices.append(round(max(new_price, 50), 2))
    
    return prices
