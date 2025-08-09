from fastapi import FastAPI, HTTPException, Query
from sqlalchemy import create_engine, text
import redis
import os
import pandas as pd
from dotenv import load_dotenv
from indicators import calculate_macd, generate_sample_data, comprehensive_analysis, calculate_rsi
from binance_client import BinanceClient, extract_close_prices
from alert_service import AlertService
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from simple_ai import simple_ai
from advanced_ai import advanced_ai
from backtesting import backtesting_engine
from model_optimizer import model_optimizer


load_dotenv()

app = FastAPI(title="Trading AI Platform", version="1.0.0")

# Database connection
DATABASE_URL = "postgresql://trading_user:trading_pass_2024@postgres:5432/trading_db"
engine = create_engine(DATABASE_URL)

# Redis connection  
redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

# Binance client
binance_client = BinanceClient()

# Alert service
alert_service = AlertService(DATABASE_URL)

class PriceData(BaseModel):
    prices: List[float]
    fast_period: Optional[int] = 12
    slow_period: Optional[int] = 26
    signal_period: Optional[int] = 9

@app.get("/")
async def root():
    return {
        "message": "Trading AI Platform API", 
        "status": "running",
        "features": [
            "Real-time data from Binance",
            "MACD Technical Analysis",
            "Multiple cryptocurrency support"
        ]
    }

@app.get("/health")
async def health_check():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    try:
        redis_client.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"
    
    try:
        price = binance_client.get_symbol_price("BTCUSDT")
        binance_status = "connected" if price else "error"
    except Exception as e:
        binance_status = f"error: {str(e)}"
    
    return {
        "database": db_status,
        "redis": redis_status,
        "binance_api": binance_status,
        "api": "healthy"
    }

@app.get("/symbols")
async def get_available_symbols():
    try:
        symbols = binance_client.get_available_symbols()
        return {
            "symbols": symbols,
            "count": len(symbols),
            "note": "Popular USDT trading pairs"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis/{symbol}")
async def get_comprehensive_analysis(
    symbol: str,
    interval: str = Query(default="1h", description="Timeframe: 1m, 5m, 15m, 1h, 4h, 1d"),
    limit: int = Query(default=200, ge=100, le=500, description="Number of data points")
):
    try:
        klines_data = binance_client.get_klines(symbol, interval, limit)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        analysis_result = comprehensive_analysis(close_prices)
        
        latest_candle = klines_data[-1]
        
        return {
            "symbol": symbol.upper(),
            "interval": interval,
            "data_points": len(close_prices),
            "current_price": latest_candle["close"],
            "volume": latest_candle["volume"],
            "last_update": pd.Timestamp.fromtimestamp(latest_candle["timestamp"]/1000).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "comprehensive_analysis": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/alerts")
async def get_alerts(
    symbol: str = Query(None, description="Filter by symbol"),
    unread_only: bool = Query(False, description="Show only unread alerts"),
    limit: int = Query(50, ge=1, le=100, description="Number of alerts to return")
):
    try:
        alerts = alert_service.get_alerts(symbol, unread_only, limit)
        
        alerts_data = []
        for alert in alerts:
            alerts_data.append({
                "id": alert.id,
                "symbol": alert.symbol,
                "type": alert.alert_type,
                "message": alert.message,
                "price": alert.price,
                "indicator_value": alert.indicator_value,
                "severity": alert.severity,
                "is_read": alert.is_read,
                "created_at": alert.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
            })
        
        return {
            "alerts": alerts_data,
            "count": len(alerts_data),
            "unread_count": len([a for a in alerts_data if not a["is_read"]])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/monitor/{symbol}")
async def monitor_symbol_with_alerts(
    symbol: str,
    interval: str = Query(default="1h", description="Timeframe"),
    create_alerts: bool = Query(True, description="Create alerts if conditions met")
):
    try:
        klines_data = binance_client.get_klines(symbol, interval, 200)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        analysis_result = comprehensive_analysis(close_prices)
        
        latest_candle = klines_data[-1]
        
        current_data = {
            "current_price": latest_candle["close"],
            "comprehensive_analysis": analysis_result
        }
        
        new_alerts = []
        if create_alerts:
            new_alerts = alert_service.check_and_create_alerts(symbol, current_data)
        
        return {
            "symbol": symbol.upper(),
            "interval": interval,
            "current_price": latest_candle["close"],
            "analysis": analysis_result,
            "new_alerts_created": len(new_alerts),
            "alerts_details": [
                {
                    "type": alert.alert_type,
                    "message": alert.message,
                    "severity": alert.severity
                } for alert in new_alerts
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/train-simple/{symbol}")
async def train_simple_ai(
    symbol: str,
    interval: str = Query(default="1h", description="Training timeframe"),
    limit: int = Query(default=300, ge=100, le=500, description="Training data points")
):
    """
    تدريب نموذج الذكاء الصناعي البسيط
    """
    try:
        klines_data = binance_client.get_klines(symbol, interval, limit)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch training data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        training_result = simple_ai.train(close_prices)
        
        return {
            "symbol": symbol.upper(),
            "training_data": {
                "interval": interval,
                "data_points": len(close_prices)
            },
            "training_result": training_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/predict-simple/{symbol}")
async def predict_simple_ai(
    symbol: str,
    interval: str = Query(default="1h", description="Prediction timeframe")
):
    """
    التنبؤ بالاتجاه باستخدام الذكاء الصناعي البسيط
    """
    try:
        if not simple_ai.is_trained:
            simple_ai.load_model()
        
        if not simple_ai.is_trained:
            return {
                "error": "النموذج غير مدرب",
                "suggestion": f"ادرب النموذج أولاً باستخدام: POST /ai/train-simple/{symbol}"
            }
        
        klines_data = binance_client.get_klines(symbol, interval, 100)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        prediction_result = simple_ai.predict(close_prices)
        
        latest_candle = klines_data[-1]
        
        return {
            "symbol": symbol.upper(),
            "current_price": latest_candle["close"],
            "timestamp": pd.Timestamp.fromtimestamp(latest_candle["timestamp"]/1000).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "ai_prediction": prediction_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/train-advanced/{symbol}")
async def train_advanced_ai(
    symbol: str,
    interval: str = Query(default="1h", description="Training timeframe"),
    limit: int = Query(default=500, ge=200, le=1000, description="Training data points")
):
    """
    تدريب نظام الذكاء الصناعي المتقدم
    """
    try:
        klines_data = binance_client.get_klines(symbol, interval, limit)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch training data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        volumes = [item['volume'] for item in klines_data]
        
        training_result = advanced_ai.train_ensemble(close_prices, volumes)
        
        return {
            "symbol": symbol.upper(),
            "training_data": {
                "interval": interval,
                "data_points": len(close_prices)
            },
            "advanced_training_result": training_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/predict-advanced/{symbol}")
async def predict_advanced_ai(
    symbol: str,
    interval: str = Query(default="1h", description="Prediction timeframe")
):
    """
    التنبؤ المتقدم باستخدام مجموعة نماذج الذكاء الصناعي
    """
    try:
        if not advanced_ai.is_trained:
            advanced_ai.load_ensemble()
        
        if not advanced_ai.is_trained:
            return {
                "error": "النماذج المتقدمة غير مدربة",
                "suggestion": f"ادرب النماذج أولاً باستخدام: POST /ai/train-advanced/{symbol}"
            }
        
        klines_data = binance_client.get_klines(symbol, interval, 150)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        volumes = [item['volume'] for item in klines_data]
        
        prediction_result = advanced_ai.predict_ensemble(close_prices, volumes)
        
        latest_candle = klines_data[-1]
        
        return {
            "symbol": symbol.upper(),
            "current_price": latest_candle["close"],
            "timestamp": pd.Timestamp.fromtimestamp(latest_candle["timestamp"]/1000).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "advanced_ai_prediction": prediction_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/ultimate-analysis/{symbol}")
async def get_ultimate_analysis(
    symbol: str,
    interval: str = Query(default="1h", description="Analysis timeframe")
):
    """
    التحليل النهائي الشامل: فني + AI بسيط + AI متقدم
    """
    try:
        # جلب البيانات
        klines_data = binance_client.get_klines(symbol, interval, 200)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        volumes = [item['volume'] for item in klines_data]
        latest_candle = klines_data[-1]
        
        # 1. التحليل الفني التقليدي
        technical_analysis = comprehensive_analysis(close_prices)
        
        # 2. AI البسيط
        simple_ai_result = {"error": "Model not trained"}
        if simple_ai.is_trained or simple_ai.load_model():
            simple_ai_result = simple_ai.predict(close_prices)
        
        # 3. AI المتقدم
        advanced_ai_result = {"error": "Model not trained"}
        if advanced_ai.is_trained or advanced_ai.load_ensemble():
            advanced_ai_result = advanced_ai.predict_ensemble(close_prices, volumes)
# AI المتقدم
	
        # 4. القرار النهائي المدمج
        ultimate_decision = create_ultimate_decision(
            technical_analysis, simple_ai_result, advanced_ai_result
        )

        return {
            "symbol": symbol.upper(),
            "current_price": latest_candle["close"],
            "timestamp": pd.Timestamp.fromtimestamp(latest_candle["timestamp"]/1000).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "analysis_layers": {
                "1_technical_analysis": technical_analysis,
                "2_simple_ai": simple_ai_result,
                "3_advanced_ai": advanced_ai_result
            },
            "ultimate_decision": ultimate_decision,
            "analysis_summary": {
                "total_analysis_methods": 3,
                "confidence_score": ultimate_decision.get("final_confidence", 0),
                "risk_assessment": ultimate_decision.get("risk_level", "UNKNOWN"),
                "recommendation_strength": ultimate_decision.get("strength", "WEAK")
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def create_ultimate_decision(technical: Dict, simple_ai: Dict, advanced_ai: Dict) -> Dict[str, Any]:
    """
    إنشاء القرار النهائي من جميع طبقات التحليل
    """
    # استخراج التوصيات
    tech_rec = technical.get("overall_recommendation", "HOLD")
    tech_conf = technical.get("confidence", 50)
    
    simple_rec = "HOLD"
    simple_conf = 50
    if "recommendation" in simple_ai:
        simple_rec = simple_ai["recommendation"]
        simple_conf = simple_ai.get("confidence", 50)
    
    advanced_rec = "HOLD"
    advanced_conf = 50
    if "ensemble_prediction" in advanced_ai:
        adv_pred = advanced_ai["ensemble_prediction"]
        advanced_rec = adv_pred.get("recommendation", "HOLD")
        advanced_conf = adv_pred.get("confidence", 50)
    
    # تحويل لنظام موحد
    recommendations = []
    confidences = []
    weights = []
    
    # إضافة التحليل الفني
    if tech_rec in ["BUY", "SELL"]:
        recommendations.append(tech_rec)
        confidences.append(tech_conf)
        weights.append(0.3)  # وزن 30%
    
    # إضافة AI البسيط
    if simple_rec in ["BUY", "SELL"]:
        recommendations.append(simple_rec)
        confidences.append(simple_conf)
        weights.append(0.3)  # وزن 30%
    
    # إضافة AI المتقدم
    if advanced_rec in ["BUY", "SELL", "STRONG_BUY", "STRONG_SELL"]:
        # تحويل القوة لوزن أعلى
        if "STRONG" in advanced_rec:
            weight = 0.5  # وزن 50% للإشارات القوية
            rec = advanced_rec.replace("STRONG_", "")
        else:
            weight = 0.4  # وزن 40% للإشارات العادية
            rec = advanced_rec
        
        recommendations.append(rec)
        confidences.append(advanced_conf)
        weights.append(weight)
    
    # تحليل التضارب والاتفاق
    if not recommendations:
        return {
            "final_recommendation": "HOLD",
            "final_confidence": 25.0,
            "reasoning": "جميع التحليلات محايدة أو غير متاحة",
            "agreement_level": "NO_SIGNALS",
            "risk_level": "LOW",
            "strength": "WEAK"
        }
    
    # حساب التوصية المرجحة
    buy_weight = sum(w for r, w in zip(recommendations, weights) if r == "BUY")
    sell_weight = sum(w for r, w in zip(recommendations, weights) if r == "SELL")
    
    # حساب الثقة المرجحة
    if buy_weight > sell_weight:
        final_rec = "BUY"
        relevant_confidences = [c for r, c in zip(recommendations, confidences) if r == "BUY"]
        relevant_weights = [w for r, w in zip(recommendations, weights) if r == "BUY"]
    elif sell_weight > buy_weight:
        final_rec = "SELL"
        relevant_confidences = [c for r, c in zip(recommendations, confidences) if r == "SELL"]
        relevant_weights = [w for r, w in zip(recommendations, weights) if r == "SELL"]
    else:
        final_rec = "HOLD"
        relevant_confidences = confidences
        relevant_weights = weights
    
    # حساب الثقة النهائية
    if relevant_confidences and relevant_weights:
        weighted_confidence = sum(c * w for c, w in zip(relevant_confidences, relevant_weights)) / sum(relevant_weights)
    else:
        weighted_confidence = 50.0
    
    # تحليل مستوى الاتفاق
    unique_recs = set(recommendations)
    if len(unique_recs) == 1:
        agreement = "STRONG_CONSENSUS"
        confidence_boost = 1.2
    elif len(unique_recs) == 2:
        agreement = "PARTIAL_AGREEMENT"
        confidence_boost = 1.0
    else:
        agreement = "HIGH_DISAGREEMENT"
        confidence_boost = 0.8
    
    final_confidence = min(weighted_confidence * confidence_boost, 95.0)
    
    # تقييم المخاطر
    if agreement == "HIGH_DISAGREEMENT":
        risk_level = "HIGH"
    elif final_confidence < 60:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"
    
    # قوة التوصية
    if final_confidence > 80 and agreement == "STRONG_CONSENSUS":
        strength = "VERY_STRONG"
    elif final_confidence > 70:
        strength = "STRONG"
    elif final_confidence > 60:
        strength = "MODERATE"
    else:
        strength = "WEAK"
    
    return {
        "final_recommendation": final_rec,
        "final_confidence": round(final_confidence, 1),
        "reasoning": create_reasoning_text(recommendations, agreement, final_rec),
        "agreement_level": agreement,
        "risk_level": risk_level,
        "strength": strength,
        "contributing_signals": len(recommendations),
        "weight_distribution": {
            "technical": 0.3 if tech_rec in recommendations else 0,
            "simple_ai": 0.3 if simple_rec in recommendations else 0,
            "advanced_ai": max(weights) if advanced_rec.replace("STRONG_", "") in recommendations else 0
        }
    }

def create_reasoning_text(recommendations: List[str], agreement: str, final_rec: str) -> str:
    """إنشاء نص التفسير"""
    signal_count = len(recommendations)
    buy_count = recommendations.count("BUY")
    sell_count = recommendations.count("SELL")
    
    if agreement == "STRONG_CONSENSUS":
        return f"إجماع قوي من {signal_count} تحليل على {final_rec}"
    elif agreement == "PARTIAL_AGREEMENT":
        if final_rec == "BUY":
            return f"أغلبية تدعم الشراء ({buy_count} مقابل {sell_count})"
        else:
            return f"أغلبية تدعم البيع ({sell_count} مقابل {buy_count})"
    else:
        return f"تضارب في الإشارات - اتخاذ قرار حذر بـ {final_rec}"

@app.post("/backtest/single/{symbol}")
async def run_single_backtest(
    symbol: str,
    days: int = Query(default=30, ge=7, le=90, description="عدد أيام الاختبار"),
    interval: str = Query(default="1h", description="الفترة الزمنية")
):
    """
    تشغيل اختبار أداء لعملة واحدة
    """
    try:
        result = backtesting_engine.run_backtest(symbol, days, interval)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/backtest/compare")
async def run_comparison_backtest(
    symbols: List[str] = Query(default=["BTCUSDT", "ETHUSDT", "SOLUSDT"], description="قائمة العملات للمقارنة"),
    days: int = Query(default=30, ge=7, le=90, description="عدد أيام الاختبار")
):
    """
    مقارنة أداء النماذج على عملات متعددة
    """
    try:
        result = backtesting_engine.compare_models(symbols, days)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/backtest/results")
async def get_backtest_results():
    """
    جلب نتائج اختبارات الأداء المحفوظة
    """
    try:
        return {
            "saved_results": backtesting_engine.results,
            "total_tests": len(backtesting_engine.results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/optimize/models/{symbol}")
async def optimize_models(
    symbol: str,
    days: int = Query(default=30, description="أيام البيانات للتحسين")
):
    """
    تحسين النماذج وقياس الأداء المحسن
    """
    try:
        # تشغيل backtest عادي أولاً
        original_result = backtesting_engine.run_backtest(symbol, days)
        
        # تحسين النماذج
        # (هنا يمكن إضافة لوجيك تحسين متقدم)
        
        # اقتراحات التحسين
        current_accuracy = original_result.get('metrics', {}).get('technical', {}).get('accuracy_percentage', 0)
        data_size = original_result.get('total_data_points', 0)
        
        improvements = model_optimizer.suggest_data_improvements(current_accuracy, data_size)
        
        return {
            "original_performance": original_result,
            "improvement_suggestions": improvements,
            "optimization_status": "completed"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
