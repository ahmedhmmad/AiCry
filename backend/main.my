from fastapi import FastAPI, HTTPException, Query
from sqlalchemy import create_engine, text
import redis
import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from datetime import datetime
from indicators import calculate_macd, generate_sample_data, comprehensive_analysis, calculate_rsi
from binance_client import BinanceClient, extract_close_prices
from alert_service import AlertService
from simple_ai import simple_ai
from advanced_ai import advanced_ai
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

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

def clean_response_data(data):
    """تنظيف البيانات من numpy types قبل إرسالها"""
    if isinstance(data, dict):
        return {k: clean_response_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_response_data(item) for item in data]
    elif isinstance(data, (np.integer, np.int64, np.int32)):
        return int(data)
    elif isinstance(data, (np.floating, np.float64, np.float32)):
        return float(data)
    elif isinstance(data, np.ndarray):
        return data.tolist()
    elif pd.isna(data):
        return None
    return data

@app.get("/")
async def root():
    return {
        "message": "Trading AI Platform API", 
        "status": "running",
        "features": [
            "Real-time data from Binance",
            "MACD Technical Analysis",
            "Multiple cryptocurrency support",
            "AI-powered predictions"
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

@app.get("/ai/ultimate-analysis/{symbol}")
async def get_ultimate_analysis(
    symbol: str,
    interval: str = Query(default="1h", description="Analysis timeframe")
):
    """
    التحليل الشامل النهائي مع جميع طبقات الذكاء الصناعي
    """
    try:
        klines_data = binance_client.get_klines(symbol, interval, 200)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")
        
        close_prices = extract_close_prices(klines_data)
        volumes = [item['volume'] for item in klines_data]
        latest_candle = klines_data[-1]
        
        # التحليل الفني التقليدي
        technical_analysis = comprehensive_analysis(close_prices)
        
        # AI البسيط
        simple_ai_result = {"error": "Model not trained"}
        try:
            if simple_ai.is_trained or simple_ai.load_model():
                simple_ai_result = simple_ai.predict(close_prices)
        except Exception as e:
            simple_ai_result = {"error": f"خطأ في AI البسيط: {str(e)}"}
        
        # AI المتقدم
        advanced_ai_result = {"error": "Model not trained"}
        try:
            if advanced_ai.is_trained or advanced_ai.load_ensemble():
                advanced_ai_result = advanced_ai.predict_ensemble(close_prices, volumes)
        except Exception as e:
            advanced_ai_result = {"error": f"خطأ في AI المتقدم: {str(e)}"}
        
        # القرار النهائي المدمج
        ultimate_decision = combine_recommendations(
            technical_analysis, simple_ai_result, advanced_ai_result
        )
        
        # بناء النتيجة النهائية
        result = {
            "symbol": symbol.upper(),
            "current_price": float(latest_candle["close"]),
            "timestamp": pd.Timestamp.fromtimestamp(latest_candle["timestamp"]/1000).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "analysis_layers": {
                "1_technical_analysis": technical_analysis,
                "2_simple_ai": simple_ai_result,
                "3_advanced_ai": advanced_ai_result
            },
            "ultimate_decision": ultimate_decision,
            "analysis_summary": {
                "total_analysis_methods": 3,
                "confidence_score": float(ultimate_decision.get("final_confidence", 0)),
                "risk_assessment": ultimate_decision.get("risk_level", "UNKNOWN"),
                "recommendation_strength": ultimate_decision.get("strength", "WEAK")
            }
        }
        
        # تنظيف البيانات من numpy types قبل الإرسال
        cleaned_result = clean_response_data(result)
        return cleaned_result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في التحليل الشامل: {str(e)}")

def combine_recommendations(technical: Dict, simple_ai: Dict, advanced_ai: Dict) -> Dict[str, Any]:
    """
    دمج التوصيات من جميع طبقات التحليل
    """
    try:
        # استخراج التوصيات والثقة من كل طبقة
        tech_rec = technical.get("overall_recommendation", "HOLD")
        tech_conf = float(technical.get("confidence", 50))
        
        simple_rec = "HOLD"
        simple_conf = 50.0
        if "recommendation" in simple_ai and "error" not in simple_ai:
            simple_rec = simple_ai["recommendation"]
            simple_conf = float(simple_ai.get("confidence", 50))
        
        advanced_rec = "HOLD"
        advanced_conf = 50.0
        if "ensemble_prediction" in advanced_ai and "error" not in advanced_ai:
            adv_pred = advanced_ai["ensemble_prediction"]
            advanced_rec = adv_pred.get("recommendation", "HOLD")
            advanced_conf = float(adv_pred.get("confidence", 50))
        
        # حساب الأوزان بناءً على الثقة
        total_weight = 0
        weighted_buy_score = 0
        weighted_sell_score = 0
        contributing_signals = 0
        
        # وزن التحليل الفني
        tech_weight = tech_conf / 100
        if tech_rec in ['BUY', 'STRONG_BUY']:
            weighted_buy_score += tech_weight
        elif tech_rec in ['SELL', 'STRONG_SELL']:
            weighted_sell_score += tech_weight
        total_weight += tech_weight
        if tech_rec != 'HOLD':
            contributing_signals += 1
        
        # وزن AI البسيط
        simple_weight = simple_conf / 100 * 1.2  # وزن أعلى للـ AI
        if simple_rec in ['BUY', 'STRONG_BUY']:
            weighted_buy_score += simple_weight
        elif simple_rec in ['SELL', 'STRONG_SELL']:
            weighted_sell_score += simple_weight
        total_weight += simple_weight
        if simple_rec != 'HOLD':
            contributing_signals += 1
        
        # وزن AI المتقدم
        advanced_weight = advanced_conf / 100 * 1.5  # أعلى وزن للـ AI المتقدم
        if advanced_rec in ['BUY', 'STRONG_BUY']:
            weighted_buy_score += advanced_weight
        elif advanced_rec in ['SELL', 'STRONG_SELL']:
            weighted_sell_score += advanced_weight
        total_weight += advanced_weight
        if advanced_rec != 'HOLD':
            contributing_signals += 1
        
        # حساب التوصية النهائية
        if total_weight == 0:
            final_recommendation = "HOLD"
            final_confidence = 50.0
            agreement_level = "NO_SIGNALS"
        else:
            buy_ratio = weighted_buy_score / total_weight
            sell_ratio = weighted_sell_score / total_weight
            
            if buy_ratio > sell_ratio and buy_ratio > 0.4:
                final_recommendation = "STRONG_BUY" if buy_ratio > 0.7 else "BUY"
                final_confidence = min(buy_ratio * 100 * 1.2, 95.0)
            elif sell_ratio > buy_ratio and sell_ratio > 0.4:
                final_recommendation = "STRONG_SELL" if sell_ratio > 0.7 else "SELL"
                final_confidence = min(sell_ratio * 100 * 1.2, 95.0)
            else:
                final_recommendation = "HOLD"
                final_confidence = 60.0
            
            # مستوى الاتفاق
            if contributing_signals >= 2:
                agreement_level = "STRONG_CONSENSUS"
            elif contributing_signals == 1:
                agreement_level = "SINGLE_SIGNAL"
            else:
                agreement_level = "MIXED_SIGNALS"
        
        # تحديد قوة التوصية
        if final_confidence > 80:
            strength = "VERY_STRONG"
        elif final_confidence > 65:
            strength = "STRONG"
        elif final_confidence > 50:
            strength = "MODERATE"
        else:
            strength = "WEAK"
        
        # تحديد مستوى المخاطر
        if final_confidence > 75 and contributing_signals >= 2:
            risk_level = "LOW"
        elif final_confidence > 60:
            risk_level = "MODERATE"
        else:
            risk_level = "HIGH"
        
        # إنشاء التفسير
        if contributing_signals == 0:
            reasoning = "لا توجد إشارات واضحة - من الأفضل الانتظار"
        elif contributing_signals == 1:
            reasoning = f"إشارة واحدة تشير إلى {final_recommendation}"
        else:
            consensus_type = "قوي" if agreement_level == "STRONG_CONSENSUS" else "جزئي"
            reasoning = f"إجماع {consensus_type} من {contributing_signals} تحليل على {final_recommendation}"
        
        return {
            "final_recommendation": final_recommendation,
            "final_confidence": round(final_confidence, 1),
            "reasoning": reasoning,
            "agreement_level": agreement_level,
            "risk_level": risk_level,
            "strength": strength,
            "contributing_signals": contributing_signals,
            "weight_distribution": {
                "technical": round(tech_weight / max(total_weight, 1), 1) if total_weight > 0 else 0,
                "simple_ai": round(simple_weight / max(total_weight, 1), 1) if total_weight > 0 else 0,
                "advanced_ai": round(advanced_weight / max(total_weight, 1), 1) if total_weight > 0 else 0
            }
        }
        
    except Exception as e:
        return {
            "final_recommendation": "HOLD",
            "final_confidence": 50.0,
            "reasoning": f"خطأ في دمج التوصيات: {str(e)}",
            "agreement_level": "ERROR",
            "risk_level": "HIGH",
            "strength": "WEAK",
            "contributing_signals": 0,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
