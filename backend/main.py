from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text
import redis
import json
import traceback
import gc
import asyncio
import os
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import traceback

# Load environment variables first
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Trading AI Platform", version="1.0.0")

# Enhanced CORS middleware - This fixes your CORS issues
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://152.67.153.191:3000",
        "https://152.67.153.191:3000",
        "*"  # Allow all origins for development - remove in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
)
# Add OPTIONS handler for all routes to fix preflight requests
@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    """Handle CORS preflight requests"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )

# Database connection with error handling
try:
    DATABASE_URL = "postgresql://trading_user:trading_pass_2024@postgres:5432/trading_db"
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database connection successful")
except Exception as e:
    print(f"⚠️ Database connection failed: {e}")
    engine = None

# Redis connection with error handling
try:
    redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
    redis_client.ping()
    print("✅ Redis connection successful")
except Exception as e:
    print(f"⚠️ Redis connection failed: {e}")
    redis_client = None


# Safe imports with error handling
def safe_import(module_name, class_name=None):
    """Safely import modules with error handling"""
    try:
        module = __import__(module_name)
        if class_name:
            return getattr(module, class_name)
        return module
    except ImportError as e:
        print(f"⚠️ Failed to import {module_name}: {e}")
        return None
    except Exception as e:
        print(f"❌ Error importing {module_name}: {e}")
        return None


# Import modules with safe error handling
print("🔄 Loading modules...")

# Import basic modules
try:
    from indicators import calculate_macd, generate_sample_data, comprehensive_analysis, calculate_rsi

    print("✅ Indicators module loaded")
except Exception as e:
    print(f"❌ Failed to load indicators: {e}")


    def calculate_macd(*args):
        return ([], [], [])


    def generate_sample_data(*args):
        return []


    def comprehensive_analysis(*args):
        return {"error": "indicators module not available"}


    def calculate_rsi(*args):
        return []

try:
    from binance_client import BinanceClient, extract_close_prices

    binance_client = BinanceClient()
    print("✅ Binance client loaded")
except Exception as e:
    print(f"❌ Failed to load Binance client: {e}")
    binance_client = None


    def extract_close_prices(data):
        return [item['close'] for item in data] if data else []

try:
    from alert_service import AlertService

    alert_service = AlertService(DATABASE_URL) if DATABASE_URL else None
    print("✅ Alert service loaded")
except Exception as e:
    print(f"❌ Failed to load alert service: {e}")
    alert_service = None

try:
    from simple_ai import simple_ai

    print("✅ Simple AI loaded")
except Exception as e:
    print(f"❌ Failed to load simple AI: {e}")
    simple_ai = None

try:
    from advanced_ai import advanced_ai

    print("✅ Advanced AI loaded")
except Exception as e:
    print(f"❌ Failed to load advanced AI: {e}")
    advanced_ai = None

# Try to import enhanced AI
ENHANCED_AI_AVAILABLE = False
enhanced_advanced_ai = None
try:
    from enhanced_advanced_ai import enhanced_advanced_ai

    ENHANCED_AI_AVAILABLE = True
    print("✅ Enhanced AI loaded successfully")
except ImportError as e:
    print(f"⚠️ Enhanced AI not available: {e}")
    ENHANCED_AI_AVAILABLE = False
except Exception as e:
    print(f"❌ Enhanced AI failed to load: {e}")
    ENHANCED_AI_AVAILABLE = False

# Try to import sentiment analyzer
SENTIMENT_AVAILABLE = False
sentiment_analyzer = None
try:
    from sentiment_analysis import sentiment_analyzer

    SENTIMENT_AVAILABLE = True
    print("✅ Sentiment analysis loaded")
except ImportError:
    print("⚠️ Sentiment analysis not available - install vaderSentiment")
    SENTIMENT_AVAILABLE = False
except Exception as e:
    print(f"❌ Sentiment analysis failed: {e}")
    SENTIMENT_AVAILABLE = False


# ============ Redis Cache Configuration ============
class AICache:
    """نظام التخزين المؤقت للتنبؤات مع معالجة الأخطاء"""

    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_ttl = 300  # 5 دقائق
        self.enabled = redis_client is not None

    def get_prediction(self, symbol: str) -> Dict:
        """جلب تنبؤ من التخزين المؤقت"""
        if not self.enabled:
            return None
        key = f"prediction:enhanced:{symbol}"
        try:
            cached = self.redis.get(key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Cache get error: {e}")
        return None

    def set_prediction(self, symbol: str, prediction: Dict, ttl: int = None):
        """حفظ تنبؤ في التخزين المؤقت"""
        if not self.enabled:
            return
        key = f"prediction:enhanced:{symbol}"
        ttl = ttl or self.default_ttl
        try:
            self.redis.setex(key, ttl, json.dumps(prediction))
        except Exception as e:
            print(f"Cache set error: {e}")

    def get_training_result(self, symbol: str) -> Dict:
        """جلب نتيجة تدريب"""
        if not self.enabled:
            return None
        key = f"training:enhanced:{symbol}"
        try:
            cached = self.redis.get(key)
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Cache get error: {e}")
        return None

    def set_training_result(self, symbol: str, result: Dict):
        """حفظ نتيجة تدريب"""
        if not self.enabled:
            return
        key = f"training:enhanced:{symbol}"
        try:
            self.redis.setex(key, 86400, json.dumps(result))
        except Exception as e:
            print(f"Cache set error: {e}")

    def clear_symbol_cache(self, symbol: str):
        """مسح كل التخزين المؤقت لعملة معينة"""
        if not self.enabled:
            return
        keys = [f"prediction:enhanced:{symbol}", f"training:enhanced:{symbol}"]
        for key in keys:
            try:
                self.redis.delete(key)
            except:
                pass


# إنشاء instance من التخزين المؤقت
ai_cache = AICache(redis_client)


# ============ Helper Functions ============
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


def safe_binance_call(func, *args, **kwargs):
    """تنفيذ آمن لاستدعاءات Binance API"""
    if not binance_client:
        raise HTTPException(status_code=503, detail="Binance client not available")
    try:
        return func(*args, **kwargs)
    except Exception as e:
        print(f"Binance API error: {e}")
        raise HTTPException(status_code=500, detail=f"Binance API error: {str(e)}")


def map_sentiment_to_recommendation(sentiment_trend: str) -> str:
    """تحويل اتجاه المشاعر إلى توصية تداول"""
    mapping = {
        "bullish": "BUY", "bearish": "SELL", "neutral": "HOLD",
        "positive": "BUY", "negative": "SELL"
    }
    return mapping.get(sentiment_trend.lower(), "HOLD")


def combine_recommendations_with_sentiment(technical, simple_ai_result, advanced_ai_result, sentiment_result):
    """دمج التوصيات مع تحليل المشاعر"""
    recommendations = []
    weights = []

    # التحليل الفني
    if technical and isinstance(technical, dict) and "overall_recommendation" in technical and "error" not in technical:
        recommendations.append(technical["overall_recommendation"])
        weights.append(0.3)

    # AI البسيط
    if simple_ai_result and isinstance(simple_ai_result,
                                       dict) and "recommendation" in simple_ai_result and "error" not in simple_ai_result:
        recommendations.append(simple_ai_result["recommendation"])
        weights.append(0.25)

    # AI المتقدم
    if advanced_ai_result and isinstance(advanced_ai_result,
                                         dict) and "recommendation" in advanced_ai_result and "error" not in advanced_ai_result:
        recommendations.append(advanced_ai_result["recommendation"])
        weights.append(0.3)

    # تحليل المشاعر
    if SENTIMENT_AVAILABLE and sentiment_result and isinstance(sentiment_result,
                                                               dict) and "trend" in sentiment_result and "error" not in sentiment_result:
        sentiment_recommendation = map_sentiment_to_recommendation(sentiment_result["trend"])
        recommendations.append(sentiment_recommendation)
        weights.append(0.15)

    if not recommendations:
        return {
            "final_recommendation": "HOLD",
            "final_confidence": 50.0,
            "reasoning": "لا توجد إشارات متاحة للتحليل",
            "contributing_signals": 0
        }

    # حساب التوصية النهائية
    final_rec = max(set(recommendations), key=recommendations.count)
    agreement_ratio = recommendations.count(final_rec) / len(recommendations)
    weighted_confidence = sum(w for i, w in enumerate(weights) if recommendations[i] == final_rec)
    final_confidence = min(agreement_ratio * weighted_confidence * 100, 95.0)

    return {
        "final_recommendation": final_rec,
        "final_confidence": round(final_confidence, 1),
        "reasoning": f"اتفاق {len([r for r in recommendations if r == final_rec])} من أصل {len(recommendations)} تحليل على {final_rec}",
        "contributing_signals": len(recommendations),
        "sentiment_influence": sentiment_result.get("trend",
                                                    "neutral") if sentiment_result and "error" not in sentiment_result else "unavailable"
    }


# ============ Basic Endpoints ============
@app.get("/")
async def root():
    return {
        "message": "Trading AI Platform API",
        "status": "running",
        "features": [
            "Real-time data from Binance" if binance_client else "Binance API (Not Available)",
            "MACD Technical Analysis",
            "Multiple cryptocurrency support",
            "AI-powered predictions" if simple_ai or advanced_ai else "AI predictions (Not Available)",
            "Sentiment Analysis" if SENTIMENT_AVAILABLE else "Sentiment Analysis (Not Available)",
            "Enhanced AI" if ENHANCED_AI_AVAILABLE else "Enhanced AI (Not Available)"
        ],
        "modules_status": {
            "binance": binance_client is not None,
            "simple_ai": simple_ai is not None,
            "advanced_ai": advanced_ai is not None,
            "enhanced_ai": ENHANCED_AI_AVAILABLE,
            "sentiment": SENTIMENT_AVAILABLE,
            "redis": redis_client is not None,
            "database": engine is not None
        }
    }


@app.get("/health")
async def health_check():
    status = {"timestamp": datetime.now().isoformat()}

    # Database status
    try:
        if engine:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                status["database"] = "connected"
        else:
            status["database"] = "not_configured"
    except Exception as e:
        status["database"] = f"error: {str(e)}"

    # Redis status
    try:
        if redis_client:
            redis_client.ping()
            status["redis"] = "connected"
        else:
            status["redis"] = "not_configured"
    except Exception as e:
        status["redis"] = f"error: {str(e)}"

    # Binance API status
    try:
        if binance_client:
            price = safe_binance_call(binance_client.get_symbol_price, "BTCUSDT")
            status["binance_api"] = "connected" if price else "error"
        else:
            status["binance_api"] = "not_configured"
    except Exception as e:
        status["binance_api"] = f"error: {str(e)}"

    # Sentiment analysis status
    if SENTIMENT_AVAILABLE:
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            status["sentiment_analysis"] = "available"
        except ImportError:
            status["sentiment_analysis"] = "not_installed"
    else:
        status["sentiment_analysis"] = "not_available"

    # Enhanced AI status
    status["enhanced_ai"] = "available" if ENHANCED_AI_AVAILABLE else "not_available"
    status["api"] = "healthy"

    return status


@app.get("/symbols")
async def get_available_symbols():
    """الحصول على قائمة العملات المتاحة"""
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        symbols = safe_binance_call(binance_client.get_available_symbols)
        return {
            "symbols": symbols,
            "count": len(symbols),
            "note": "Popular USDT trading pairs"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Trading Analysis Endpoints ============
@app.get("/analysis/{symbol}")
async def get_comprehensive_analysis(
        symbol: str,
        interval: str = Query(default="1h", description="Timeframe: 1m, 5m, 15m, 1h, 4h, 1d"),
        limit: int = Query(default=200, ge=100, le=500, description="Number of data points")
):
    """التحليل الفني الشامل"""
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")

        klines_data = safe_binance_call(binance_client.get_klines, symbol, interval, limit)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")

        close_prices = extract_close_prices(klines_data)

        try:
            analysis_result = comprehensive_analysis(close_prices)
        except Exception as e:
            print(f"Analysis error: {e}")
            analysis_result = {"error": f"Analysis failed: {str(e)}"}

        latest_candle = klines_data[-1]

        return clean_response_data({
            "symbol": symbol.upper(),
            "interval": interval,
            "data_points": len(close_prices),
            "current_price": latest_candle["close"],
            "volume": latest_candle["volume"],
            "last_update": pd.Timestamp.fromtimestamp(latest_candle["timestamp"] / 1000).strftime(
                "%Y-%m-%d %H:%M:%S UTC"),
            "comprehensive_analysis": analysis_result
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"Comprehensive analysis error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/ultimate-analysis/{symbol}")
async def get_ultimate_analysis(
        symbol: str,
        interval: str = Query(default="1h", description="Analysis timeframe")
):
    """التحليل الشامل النهائي مع جميع طبقات الذكاء الاصطناعي"""
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")

        klines_data = safe_binance_call(binance_client.get_klines, symbol, interval, 200)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")

        close_prices = extract_close_prices(klines_data)
        volumes = [item['volume'] for item in klines_data]
        latest_candle = klines_data[-1]

        # التحليل الفني التقليدي
        try:
            technical_analysis = comprehensive_analysis(close_prices)

            # إضافة القيم المفقودة للتوافق مع الفرونت-إند
            if "error" not in technical_analysis:
                # إصلاح MACD
                if "macd" in technical_analysis and technical_analysis["macd"]:
                    macd_data = technical_analysis["macd"]
                    # التأكد من وجود القيم المطلوبة
                    if "macd" in macd_data:
                        macd_data["macd_line"] = macd_data["macd"]
                    if "signal" in macd_data:
                        macd_data["signal_line"] = macd_data["signal"]

                # إصلاح RSI
                if "rsi" in technical_analysis and technical_analysis["rsi"]:
                    rsi_data = technical_analysis["rsi"]
                    # التأكد من وجود القيمة المطلوبة
                    if "rsi" in rsi_data:
                        rsi_data["value"] = rsi_data["rsi"]

        except Exception as e:
            print(f"Technical analysis error: {e}")
            technical_analysis = {"error": f"Technical analysis failed: {str(e)}"}

        # AI البسيط
        simple_ai_result = {"error": "Simple AI not available"}
        if simple_ai:
            try:
                if hasattr(simple_ai, 'is_trained') and (
                        simple_ai.is_trained or (hasattr(simple_ai, 'load_model') and simple_ai.load_model())):
                    simple_ai_result = simple_ai.predict(close_prices)
                else:
                    simple_ai_result = {"error": "Model not trained"}
            except Exception as e:
                simple_ai_result = {"error": f"Simple AI error: {str(e)}"}

        # AI المتقدم
        advanced_ai_result = {"error": "Advanced AI not available"}
        if advanced_ai:
            try:
                if hasattr(advanced_ai, 'is_trained') and (advanced_ai.is_trained or (
                        hasattr(advanced_ai, 'load_ensemble') and advanced_ai.load_ensemble())):
                    advanced_ai_result = advanced_ai.predict_ensemble(close_prices, volumes)
                else:
                    advanced_ai_result = {"error": "Models not trained"}
            except Exception as e:
                advanced_ai_result = {"error": f"Advanced AI error: {str(e)}"}

        # تحليل المشاعر
        sentiment_result = {}
        if SENTIMENT_AVAILABLE and sentiment_analyzer:
            try:
                sentiment_result = sentiment_analyzer.get_quick_sentiment(symbol)
            except Exception as e:
                sentiment_result = {"error": f"Sentiment analysis error: {str(e)}"}

        # القرار النهائي المدمج
        ultimate_decision = combine_recommendations_with_sentiment(
            technical_analysis, simple_ai_result, advanced_ai_result, sentiment_result
        )

        # بناء النتيجة النهائية
        result = {
            "symbol": symbol.upper(),
            "current_price": float(latest_candle["close"]),
            "timestamp": pd.Timestamp.fromtimestamp(latest_candle["timestamp"] / 1000).isoformat(),
            "interval": interval,
            "data_points": len(close_prices),
            "analysis_layers": {
                "1_technical_analysis": technical_analysis,
                "2_simple_ai": simple_ai_result,
                "3_advanced_ai": advanced_ai_result,
                "4_sentiment_analysis": sentiment_result
            },
            "ultimate_decision": ultimate_decision,
            "last_update": datetime.now().isoformat()
        }

        return clean_response_data(result)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Ultimate analysis error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
# ============ Enhanced AI Endpoints ============
@app.post("/ai/enhanced/train/{symbol}")
async def train_enhanced_ai(
        symbol: str,
        days: int = Query(90, description="عدد أيام البيانات التاريخية"),
        optimize: bool = Query(False, description="تحسين المعاملات تلقائياً"),
        use_cache: bool = Query(True, description="استخدام التخزين المؤقت")
):
    """تدريب النظام المحسن للذكاء الاصطناعي"""
    if not ENHANCED_AI_AVAILABLE:
        raise HTTPException(status_code=501,
                            detail="Enhanced AI not installed. Install: pip install xgboost lightgbm catboost")

    if not enhanced_advanced_ai:
        raise HTTPException(status_code=503, detail="Enhanced AI not properly initialized")

    try:
        # التحقق من التخزين المؤقت
        if use_cache:
            cached_result = ai_cache.get_training_result(symbol)
            if cached_result:
                cached_result["from_cache"] = True
                return cached_result

        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")

        # جلب البيانات
        klines = safe_binance_call(binance_client.get_klines, symbol, "1h", days * 24)
        if not klines:
            raise HTTPException(status_code=404, detail="No data available")

        prices = extract_close_prices(klines)
        volumes = [float(k['volume']) for k in klines]

        # التدريب مع قياس الوقت
        start_time = datetime.now()
        result = enhanced_advanced_ai.train_enhanced_ensemble(
            prices, volumes, optimize_hyperparameters=optimize
        )

        # تنظيف الذاكرة
        gc.collect()

        # إضافة معلومات إضافية
        result["symbol"] = symbol
        result["training_date"] = datetime.now().isoformat()
        result["data_points"] = len(prices)

        # حفظ في التخزين المؤقت
        if use_cache and "error" not in result:
            ai_cache.set_training_result(symbol, result)

        return clean_response_data(result)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Enhanced training error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/enhanced/predict/{symbol}")
async def predict_enhanced(
        symbol: str,
        use_cache: bool = Query(True, description="استخدام التخزين المؤقت"),
        force_refresh: bool = Query(False, description="تجديد قسري")
):
    """التنبؤ المحسن باستخدام النظام المطور"""
    if not ENHANCED_AI_AVAILABLE:
        raise HTTPException(status_code=501,
                            detail="Enhanced AI not installed. Install: pip install xgboost lightgbm catboost")

    if not enhanced_advanced_ai:
        raise HTTPException(status_code=503, detail="Enhanced AI not properly initialized")

    try:
        # التحقق من التخزين المؤقت
        if use_cache and not force_refresh:
            cached = ai_cache.get_prediction(symbol)
            if cached:
                cached["from_cache"] = True
                if redis_client:
                    try:
                        cached["cache_age_seconds"] = 300 - redis_client.ttl(f"prediction:enhanced:{symbol}")
                    except:
                        cached["cache_age_seconds"] = 0
                return cached

        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")

        # جلب البيانات الحديثة
        klines = safe_binance_call(binance_client.get_klines, symbol, "1h", 200)
        if not klines:
            raise HTTPException(status_code=404, detail="No data available")

        prices = extract_close_prices(klines)
        volumes = [float(k['volume']) for k in klines]

        # التنبؤ
        prediction = enhanced_advanced_ai.predict_enhanced_ensemble(prices, volumes)

        # إضافة معلومات السعر الحالي
        current_price = safe_binance_call(binance_client.get_symbol_price, symbol)
        prediction["current_price"] = current_price
        prediction["symbol"] = symbol

        # حفظ في التخزين المؤقت
        if use_cache and "error" not in prediction:
            ai_cache.set_prediction(symbol, prediction)

        return clean_response_data(prediction)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Enhanced prediction error: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/enhanced/info")
async def get_enhanced_ai_info():
    """الحصول على معلومات النظام المحسن"""
    if not ENHANCED_AI_AVAILABLE:
        return {
            "status": "not_available",
            "message": "Enhanced AI module not installed",
            "install_command": "pip install xgboost lightgbm catboost"
        }

    if not enhanced_advanced_ai:
        return {
            "status": "not_initialized",
            "message": "Enhanced AI not properly initialized"
        }

    try:
        return enhanced_advanced_ai.get_model_info()
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ============ Basic Market Data Endpoints ============
@app.get("/price/{symbol}")
async def get_symbol_price(symbol: str):
    """الحصول على السعر الحالي للعملة"""
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        price = safe_binance_call(binance_client.get_symbol_price, symbol.upper())
        return {
            "symbol": symbol.upper(),
            "price": price,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/market/data/{symbol}")
async def get_market_data(
        symbol: str,
        interval: str = Query(default="1h"),
        limit: int = Query(default=100)
):
    """الحصول على بيانات السوق للرسوم البيانية"""
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        klines = safe_binance_call(binance_client.get_klines, symbol.upper(), interval, limit)
        if not klines:
            raise HTTPException(status_code=404, detail="No data available")
        return {
            "symbol": symbol.upper(),
            "interval": interval,
            "data": klines,
            "count": len(klines),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Additional AI Endpoints ============
@app.get("/ai/simple/train/{symbol}")
async def train_simple_ai(symbol: str, days: int = Query(30, description="عدد أيام البيانات التاريخية")):
    """تدريب AI البسيط"""
    if not simple_ai:
        raise HTTPException(status_code=501, detail="Simple AI not available")
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        klines = safe_binance_call(binance_client.get_klines, symbol, "1h", days * 24)
        if not klines:
            raise HTTPException(status_code=404, detail="No data available")
        prices = extract_close_prices(klines)
        result = simple_ai.train(prices)
        result["symbol"] = symbol
        result["training_date"] = datetime.now().isoformat()
        return clean_response_data(result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/simple/predict/{symbol}")
async def predict_simple(symbol: str):
    """التنبؤ باستخدام AI البسيط"""
    if not simple_ai:
        raise HTTPException(status_code=501, detail="Simple AI not available")
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        klines = safe_binance_call(binance_client.get_klines, symbol, "1h", 100)
        if not klines:
            raise HTTPException(status_code=404, detail="No data available")
        prices = extract_close_prices(klines)
        prediction = simple_ai.predict(prices)
        prediction["symbol"] = symbol
        prediction["current_price"] = prices[-1]
        prediction["timestamp"] = datetime.now().isoformat()
        return clean_response_data(prediction)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/advanced/train/{symbol}")
async def train_advanced_ai(symbol: str, days: int = Query(60, description="عدد أيام البيانات التاريخية")):
    """تدريب AI المتقدم"""
    if not advanced_ai:
        raise HTTPException(status_code=501, detail="Advanced AI not available")
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        klines = safe_binance_call(binance_client.get_klines, symbol, "1h", days * 24)
        if not klines:
            raise HTTPException(status_code=404, detail="No data available")
        prices = extract_close_prices(klines)
        volumes = [float(k['volume']) for k in klines]
        result = advanced_ai.train_ensemble(prices, volumes)
        result["symbol"] = symbol
        result["training_date"] = datetime.now().isoformat()
        return clean_response_data(result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/advanced/predict/{symbol}")
async def predict_advanced(symbol: str):
    """التنبؤ باستخدام AI المتقدم"""
    if not advanced_ai:
        raise HTTPException(status_code=501, detail="Advanced AI not available")
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        klines = safe_binance_call(binance_client.get_klines, symbol, "1h", 200)
        if not klines:
            raise HTTPException(status_code=404, detail="No data available")
        prices = extract_close_prices(klines)
        volumes = [float(k['volume']) for k in klines]
        prediction = advanced_ai.predict_ensemble(prices, volumes)
        prediction["symbol"] = symbol
        prediction["current_price"] = prices[-1]
        prediction["timestamp"] = datetime.now().isoformat()
        return clean_response_data(prediction)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============ Sentiment Analysis Endpoints ============
@app.get("/api/sentiment/status")
async def get_sentiment_status():
    """حالة خدمات تحليل المشاعر"""
    if not SENTIMENT_AVAILABLE:
        return {
            "status": "not_available",
            "message": "Sentiment analysis module not installed",
            "install_command": "pip install vaderSentiment"
        }
    try:
        services_status = {
            "services": {"vader_sentiment": {"available": True, "status": "ready"}},
            "summary": {"ready_services": 1, "total_services": 1, "health_score": 100},
            "timestamp": datetime.now().isoformat()
        }
        return services_status
    except Exception as e:
        return {
            "error": str(e), "services": {},
            "summary": {"ready_services": 0, "total_services": 1, "health_score": 0},
            "timestamp": datetime.now().isoformat()
        }


@app.get("/api/sentiment/{symbol}")
async def get_api_sentiment_analysis(
        symbol: str,
        analysis_type: str = Query(default="complete", description="Type: quick, complete, enhanced")
):
    """تحليل المشاعر المحسن"""
    if not SENTIMENT_AVAILABLE:
        return {
            "symbol": symbol.upper(), "overall_score": 50, "trend": "neutral", "confidence": 30,
            "sources": {"mock": {"sentiment_score": 50, "trend": "neutral", "confidence": 30,
                                 "note": "Mock data - Sentiment analysis not available"}},
            "analysis_type": "mock", "timestamp": datetime.now().isoformat()
        }
    try:
        symbol = symbol.upper()
        if analysis_type == "quick":
            result = sentiment_analyzer.get_quick_sentiment(symbol)
        elif analysis_type == "enhanced":
            result = sentiment_analyzer.get_enhanced_analysis(symbol)
        else:
            result = sentiment_analyzer.get_complete_analysis(symbol)
        return clean_response_data(result)
    except Exception as e:
        return {
            "symbol": symbol.upper(), "overall_score": 50, "trend": "neutral", "confidence": 30,
            "sources": {"fallback": {"sentiment_score": 50, "trend": "neutral", "confidence": 30,
                                     "note": "Fallback data - API error"}},
            "analysis_type": "fallback", "timestamp": datetime.now().isoformat(), "error": str(e)
        }


# ============ Cache Management Endpoints ============
@app.delete("/cache/clear/{symbol}")
async def clear_symbol_cache(symbol: str):
    """مسح التخزين المؤقت لعملة معينة"""
    try:
        ai_cache.clear_symbol_cache(symbol.upper())
        return {"message": f"تم مسح التخزين المؤقت لـ {symbol.upper()}", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/cache/clear-all")
async def clear_all_cache():
    """مسح جميع التخزين المؤقت"""
    try:
        if redis_client:
            redis_client.flushdb()
            return {"message": "تم مسح جميع التخزين المؤقت", "timestamp": datetime.now().isoformat()}
        else:
            return {"message": "Redis غير متصل", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/cache/stats")
async def get_cache_stats():
    """إحصائيات التخزين المؤقت"""
    try:
        if redis_client:
            info = redis_client.info()
            return {
                "redis_connected": True,
                "used_memory": info.get("used_memory_human", "Unknown"),
                "total_keys": redis_client.dbsize(),
                "cache_enabled": ai_cache.enabled,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {"redis_connected": False, "cache_enabled": False, "timestamp": datetime.now().isoformat()}
    except Exception as e:
        return {"error": str(e), "redis_connected": False, "timestamp": datetime.now().isoformat()}


# ============ Model Management Endpoints ============
@app.get("/models/status")
async def get_models_status():
    """حالة جميع النماذج"""
    status = {
        "simple_ai": {
            "available": simple_ai is not None,
            "trained": getattr(simple_ai, 'is_trained', False) if simple_ai else False
        },
        "advanced_ai": {
            "available": advanced_ai is not None,
            "trained": getattr(advanced_ai, 'is_trained', False) if advanced_ai else False
        },
        "enhanced_ai": {
            "available": ENHANCED_AI_AVAILABLE,
            "instance": enhanced_advanced_ai is not None,
            "trained": getattr(enhanced_advanced_ai, 'is_trained', False) if enhanced_advanced_ai else False
        },
        "timestamp": datetime.now().isoformat()
    }
    return status


@app.post("/models/load-all")
async def load_all_models():
    """تحميل جميع النماذج المحفوظة"""
    results = {}

    # Simple AI
    if simple_ai and hasattr(simple_ai, 'load_model'):
        try:
            results["simple_ai"] = simple_ai.load_model()
        except Exception as e:
            results["simple_ai"] = {"error": str(e)}

    # Advanced AI
    if advanced_ai and hasattr(advanced_ai, 'load_ensemble'):
        try:
            results["advanced_ai"] = advanced_ai.load_ensemble()
        except Exception as e:
            results["advanced_ai"] = {"error": str(e)}

    # Enhanced AI
    if enhanced_advanced_ai and hasattr(enhanced_advanced_ai, 'load_enhanced_models'):
        try:
            results["enhanced_ai"] = enhanced_advanced_ai.load_enhanced_models()
        except Exception as e:
            results["enhanced_ai"] = {"error": str(e)}

    return {"results": results, "timestamp": datetime.now().isoformat()}


# ============ Utility Endpoints ============
@app.get("/utils/validate-symbol/{symbol}")
async def validate_symbol(symbol: str):
    """التحقق من صحة رمز العملة"""
    try:
        if not binance_client:
            raise HTTPException(status_code=503, detail="Binance client not available")
        price = safe_binance_call(binance_client.get_symbol_price, symbol.upper())
        if price:
            return {"symbol": symbol.upper(), "valid": True, "current_price": price,
                    "timestamp": datetime.now().isoformat()}
        else:
            return {"symbol": symbol.upper(), "valid": False, "message": "Symbol not found or not active",
                    "timestamp": datetime.now().isoformat()}
    except Exception as e:
        return {"symbol": symbol.upper(), "valid": False, "error": str(e), "timestamp": datetime.now().isoformat()}


@app.get("/utils/supported-intervals")
async def get_supported_intervals():
    """الفترات الزمنية المدعومة"""
    return {
        "intervals": [
            {"code": "1m", "name": "1 Minute", "description": "دقيقة واحدة"},
            {"code": "5m", "name": "5 Minutes", "description": "5 دقائق"},
            {"code": "15m", "name": "15 Minutes", "description": "15 دقيقة"},
            {"code": "1h", "name": "1 Hour", "description": "ساعة واحدة"},
            {"code": "4h", "name": "4 Hours", "description": "4 ساعات"},
            {"code": "1d", "name": "1 Day", "description": "يوم واحد"},
            {"code": "1w", "name": "1 Week", "description": "أسبوع واحد"}
        ],
        "recommended": "1h",
        "timestamp": datetime.now().isoformat()
    }


# ============ Debug and Development Endpoints ============
@app.get("/debug/modules")
async def debug_modules():
    """نقطة نهاية للتطوير - فحص حالة الوحدات"""
    return {
        "binance_client": {"available": binance_client is not None,
                           "type": str(type(binance_client)) if binance_client else None},
        "simple_ai": {"available": simple_ai is not None,
                      "trained": getattr(simple_ai, 'is_trained', False) if simple_ai else False},
        "advanced_ai": {"available": advanced_ai is not None,
                        "trained": getattr(advanced_ai, 'is_trained', False) if advanced_ai else False},
        "enhanced_ai": {"available": ENHANCED_AI_AVAILABLE, "instance": enhanced_advanced_ai is not None,
                        "trained": getattr(enhanced_advanced_ai, 'is_trained',
                                           False) if enhanced_advanced_ai else False},
        "sentiment_analyzer": {"available": SENTIMENT_AVAILABLE, "instance": sentiment_analyzer is not None},
        "redis": {"available": redis_client is not None, "cache_enabled": ai_cache.enabled},
        "database": {"available": engine is not None}
    }


@app.get("/debug/test-enhanced/{symbol}")
async def debug_test_enhanced(symbol: str):
    """اختبار Enhanced AI للتطوير"""
    if not ENHANCED_AI_AVAILABLE:
        return {"error": "Enhanced AI not available"}
    if not enhanced_advanced_ai:
        return {"error": "Enhanced AI not initialized"}
    try:
        load_result = enhanced_advanced_ai.load_enhanced_models()
        if not binance_client:
            return {"error": "Binance client not available"}
        klines = safe_binance_call(binance_client.get_klines, symbol, "1h", 50)
        if not klines:
            return {"error": "No data available"}
        prices = extract_close_prices(klines)
        features_df = enhanced_advanced_ai.engineer_advanced_features(prices)
        return {
            "load_result": load_result, "data_points": len(prices), "features_count": len(features_df.columns),
            "features_sample": list(features_df.columns)[:10], "is_trained": enhanced_advanced_ai.is_trained,
            "models_count": len(enhanced_advanced_ai.models)
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}


# ============ Error Handlers ============
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """معالج 404"""
    return {
        "error": "Not Found", "message": "المسار المطلوب غير موجود", "path": str(request.url.path),
        "timestamp": datetime.now().isoformat(),
        "suggestions": ["تحقق من المسار الصحيح", "راجع الوثائق على /docs", "تأكد من صحة رمز العملة"]
    }


# Enhanced error handler for better debugging
@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    """Enhanced 500 error handler with detailed logging"""
    error_id = f"ERR_{int(datetime.now().timestamp())}"

    # Log the full error
    print(f"=== ERROR {error_id} ===")
    print(f"Request: {request.method} {request.url}")
    print(f"Error: {str(exc)}")
    print(f"Traceback: {traceback.format_exc()}")
    print("=" * 50)

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": "حدث خطأ في الخادم",
            "error_id": error_id,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url.path),
            "method": request.method,
            "suggestions": [
                "تحقق من صحة رمز العملة",
                "تأكد من وجود اتصال بالإنترنت",
                "حاول مرة أخرى بعد قليل",
                f"أرسل رقم الخطأ {error_id} للدعم الفني"
            ]
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )


@app.exception_handler(503)
async def service_unavailable_handler(request, exc):
    """معالج 503"""
    return {
        "error": "Service Unavailable", "message": "الخدمة غير متاحة حالياً", "timestamp": datetime.now().isoformat(),
        "path": str(request.url.path),
        "suggestions": ["تحقق من اتصال Binance API", "تأكد من تشغيل Redis و PostgreSQL", "راجع حالة النظام على /health"]
    }


# ============ Startup and Shutdown Events ============
@app.on_event("startup")
async def startup_event():
    """أحداث بدء التشغيل"""
    print("=" * 50)
    print("🚀 Starting Trading AI Platform")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

    modules_status = {
        "Binance Client": binance_client is not None,
        "Simple AI": simple_ai is not None,
        "Advanced AI": advanced_ai is not None,
        "Enhanced AI": ENHANCED_AI_AVAILABLE,
        "Sentiment Analysis": SENTIMENT_AVAILABLE,
        "Redis Cache": redis_client is not None,
        "Database": engine is not None,
        "Alert Service": alert_service is not None
    }

    for module, status in modules_status.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {module}: {'Available' if status else 'Not Available'}")

    print("=" * 50)

    # محاولة تحميل النماذج المحفوظة
    if ENHANCED_AI_AVAILABLE and enhanced_advanced_ai:
        try:
            load_result = enhanced_advanced_ai.load_enhanced_models()
            if load_result.get("status") == "success":
                print(f"✅ تم تحميل {load_result.get('models_loaded', 0)} نماذج محفوظة")
            else:
                print("ℹ️ لا توجد نماذج محفوظة - سيتم التدريب عند الطلب")
        except Exception as e:
            print(f"⚠️ فشل تحميل النماذج المحفوظة: {e}")

    # تحميل النماذج الأخرى
    if simple_ai and hasattr(simple_ai, 'load_model'):
        try:
            simple_ai.load_model()
            print("✅ تم تحميل Simple AI")
        except:
            print("ℹ️ Simple AI غير مدرب")

    if advanced_ai and hasattr(advanced_ai, 'load_ensemble'):
        try:
            advanced_ai.load_ensemble()
            print("✅ تم تحميل Advanced AI")
        except:
            print("ℹ️ Advanced AI غير مدرب")


@app.on_event("shutdown")
async def shutdown_event():
    """أحداث إيقاف التشغيل"""
    print("🛑 Shutting down Trading AI Platform")

    if ENHANCED_AI_AVAILABLE and enhanced_advanced_ai:
        try:
            enhanced_advanced_ai.cleanup()
            print("✅ Enhanced AI resources cleaned up")
        except Exception as e:
            print(f"⚠️ Enhanced AI cleanup error: {e}")

    if engine:
        try:
            engine.dispose()
            print("✅ Database connection closed")
        except Exception as e:
            print(f"⚠️ Database cleanup error: {e}")

    print("👋 Goodbye!")


# Enhanced training endpoint with better error handling
@app.post("/ai/train/{symbol}")
async def train_ai_models_enhanced(
        symbol: str,
        interval: str = Query(default="1h", description="Timeframe for training data"),
        limit: int = Query(default=500, description="Number of candles to fetch"),
        force_retrain: bool = Query(default=False, description="Force retraining even if model exists")
):
    """
    تدريب نماذج الذكاء الاصطناعي مع معالجة محسنة للأخطاء ورسائل واضحة
    """
    start_time = datetime.now()
    print(f"🚀 Training request started: {symbol} at {start_time}")

    try:
        # تنظيف اسم الرمز
        symbol = symbol.upper().strip()

        # التحقق من صحة المدخلات
        if not symbol or len(symbol) < 3:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "رمز العملة غير صحيح",
                    "message": f"الرمز '{symbol}' قصير جداً. يجب أن يكون على الأقل 3 أحرف.",
                    "example": "BTCUSDT, ETHUSDT, ADAUSDT"
                }
            )

        if limit < 50 or limit > 2000:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "عدد نقاط البيانات غير صحيح",
                    "message": f"العدد {limit} خارج النطاق المسموح (50-2000).",
                    "current_value": limit,
                    "allowed_range": "50-2000"
                }
            )

        print(f"✅ Input validation passed for {symbol}")

        # التحقق من توفر الخدمات المطلوبة
        if not binance_client:
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "خدمة Binance غير متاحة",
                    "message": "لا يمكن الاتصال ببورصة Binance حالياً. حاول مرة أخرى لاحقاً.",
                    "service": "binance_api",
                    "status": "unavailable"
                }
            )

        # التحقق من صحة الرمز عبر Binance
        try:
            print(f"🔍 Validating symbol {symbol} with Binance...")
            test_price = safe_binance_call(binance_client.get_symbol_price, symbol)
            if not test_price or float(test_price) <= 0:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "العملة غير موجودة",
                        "message": f"العملة {symbol} غير موجودة أو غير نشطة في بورصة Binance.",
                        "symbol": symbol,
                        "suggestion": "تحقق من رمز العملة أو جرب عملة أخرى مثل BTCUSDT"
                    }
                )
            print(f"✅ Symbol {symbol} validated successfully, price: {test_price}")
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Symbol validation error: {e}")
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "خطأ في التحقق من العملة",
                    "message": f"فشل التحقق من العملة {symbol}: {str(e)}",
                    "symbol": symbol,
                    "binance_error": str(e)
                }
            )

        # جلب البيانات التاريخية
        try:
            print(f"📊 Fetching {limit} candles for {symbol} with interval {interval}...")
            historical_data = safe_binance_call(binance_client.get_klines, symbol, interval, limit)

            if not historical_data:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "لا توجد بيانات تاريخية",
                        "message": f"لم نتمكن من العثور على بيانات تاريخية للعملة {symbol}.",
                        "symbol": symbol,
                        "interval": interval,
                        "requested_limit": limit
                    }
                )

            if len(historical_data) < 50:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "بيانات غير كافية للتدريب",
                        "message": f"العملة {symbol} لديها {len(historical_data)} نقطة بيانات فقط، نحتاج على الأقل 50.",
                        "available_data": len(historical_data),
                        "required_minimum": 50,
                        "suggestion": "جرب فترة زمنية أطول أو عملة أكثر نشاطاً"
                    }
                )

            print(f"✅ Successfully fetched {len(historical_data)} data points")

        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Data fetching error: {e}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "خطأ في جلب البيانات",
                    "message": f"فشل في جلب البيانات التاريخية: {str(e)}",
                    "symbol": symbol,
                    "interval": interval,
                    "technical_error": str(e)
                }
            )

        # معالجة البيانات
        try:
            print("🔧 Processing price and volume data...")
            prices = extract_close_prices(historical_data)
            volumes = []

            # استخراج الأحجام بطريقة آمنة
            for candle in historical_data:
                try:
                    if isinstance(candle, dict):
                        volume = float(candle.get('volume', candle.get(5, 0)))
                    else:
                        volume = float(candle[5]) if len(candle) > 5 else 0
                    volumes.append(volume)
                except (ValueError, IndexError, TypeError):
                    volumes.append(0.0)  # قيمة افتراضية

            if len(prices) < 50:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "error": "فشل في معالجة البيانات",
                        "message": f"تم معالجة {len(prices)} نقطة سعر فقط من أصل {len(historical_data)}.",
                        "processed_prices": len(prices),
                        "original_data": len(historical_data)
                    }
                )

            print(f"✅ Processed {len(prices)} prices and {len(volumes)} volumes")

        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Data processing error: {e}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "خطأ في معالجة البيانات",
                    "message": f"فشل في معالجة البيانات: {str(e)}",
                    "technical_error": str(e)
                }
            )

        # بدء عملية التدريب
        training_results = {}
        successful_models = 0
        total_models = 0

        print("🤖 Starting AI model training...")

        # تدريب Simple AI
        if simple_ai:
            total_models += 1
            try:
                print("🔵 Training Simple AI model...")
                if not getattr(simple_ai, 'is_trained', False) or force_retrain:
                    simple_result = simple_ai.train(prices)
                    if isinstance(simple_result, dict) and 'error' not in simple_result:
                        training_results['simple_ai'] = {
                            'status': 'success',
                            'details': simple_result,
                            'model_type': 'Simple AI',
                            'training_time': (datetime.now() - start_time).total_seconds()
                        }
                        successful_models += 1
                        print("✅ Simple AI training completed successfully")
                    else:
                        training_results['simple_ai'] = {
                            'status': 'failed',
                            'details': simple_result if isinstance(simple_result, dict) else {
                                'error': str(simple_result)},
                            'model_type': 'Simple AI'
                        }
                        print(f"❌ Simple AI training failed")
                else:
                    training_results['simple_ai'] = {
                        'status': 'skipped',
                        'details': {'message': 'Model already trained'},
                        'model_type': 'Simple AI'
                    }
                    successful_models += 1
                    print("ℹ️ Simple AI already trained")

            except Exception as e:
                print(f"❌ Simple AI error: {e}")
                training_results['simple_ai'] = {
                    'status': 'failed',
                    'details': {'error': str(e)},
                    'model_type': 'Simple AI'
                }
        else:
            print("⚠️ Simple AI not available")

        # تدريب Advanced AI
        if advanced_ai and len(prices) >= 100:
            total_models += 1
            try:
                print("🟡 Training Advanced AI model...")
                if not getattr(advanced_ai, 'is_trained', False) or force_retrain:
                    # جرب طرق التدريب المختلفة
                    advanced_result = None
                    if hasattr(advanced_ai, 'train_models'):
                        advanced_result = advanced_ai.train_models(prices, volumes)
                    elif hasattr(advanced_ai, 'train_ensemble'):
                        advanced_result = advanced_ai.train_ensemble(prices, volumes)
                    else:
                        raise Exception("No suitable training method found")

                    if isinstance(advanced_result, dict) and 'error' not in advanced_result:
                        training_results['advanced_ai'] = {
                            'status': 'success',
                            'details': advanced_result,
                            'model_type': 'Advanced AI',
                            'training_time': (datetime.now() - start_time).total_seconds()
                        }
                        successful_models += 1
                        print("✅ Advanced AI training completed successfully")
                    else:
                        training_results['advanced_ai'] = {
                            'status': 'failed',
                            'details': advanced_result if isinstance(advanced_result, dict) else {
                                'error': str(advanced_result)},
                            'model_type': 'Advanced AI'
                        }
                        print("❌ Advanced AI training failed")
                else:
                    training_results['advanced_ai'] = {
                        'status': 'skipped',
                        'details': {'message': 'Model already trained'},
                        'model_type': 'Advanced AI'
                    }
                    successful_models += 1
                    print("ℹ️ Advanced AI already trained")

            except Exception as e:
                print(f"❌ Advanced AI error: {e}")
                training_results['advanced_ai'] = {
                    'status': 'failed',
                    'details': {'error': str(e)},
                    'model_type': 'Advanced AI'
                }
        elif advanced_ai:
            training_results['advanced_ai'] = {
                'status': 'skipped',
                'details': {'message': f'Insufficient data (need 100+, got {len(prices)})'},
                'model_type': 'Advanced AI'
            }
            print(f"⚠️ Advanced AI skipped: insufficient data ({len(prices)} < 100)")
        else:
            print("⚠️ Advanced AI not available")

        # تدريب Enhanced AI
        if ENHANCED_AI_AVAILABLE and enhanced_advanced_ai and len(prices) >= 200:
            total_models += 1
            try:
                print("🟢 Training Enhanced AI model...")
                enhanced_result = enhanced_advanced_ai.train_enhanced_ensemble(prices, volumes)
                if isinstance(enhanced_result, dict) and 'error' not in enhanced_result:
                    training_results['enhanced_ai'] = {
                        'status': 'success',
                        'details': enhanced_result,
                        'model_type': 'Enhanced AI',
                        'training_time': (datetime.now() - start_time).total_seconds()
                    }
                    successful_models += 1
                    print("✅ Enhanced AI training completed successfully")
                else:
                    training_results['enhanced_ai'] = {
                        'status': 'failed',
                        'details': enhanced_result if isinstance(enhanced_result, dict) else {
                            'error': str(enhanced_result)},
                        'model_type': 'Enhanced AI'
                    }
                    print("❌ Enhanced AI training failed")
            except Exception as e:
                print(f"❌ Enhanced AI error: {e}")
                training_results['enhanced_ai'] = {
                    'status': 'failed',
                    'details': {'error': str(e)},
                    'model_type': 'Enhanced AI'
                }
        elif ENHANCED_AI_AVAILABLE and enhanced_advanced_ai:
            training_results['enhanced_ai'] = {
                'status': 'skipped',
                'details': {'message': f'Insufficient data (need 200+, got {len(prices)})'},
                'model_type': 'Enhanced AI'
            }
            print(f"⚠️ Enhanced AI skipped: insufficient data ({len(prices)} < 200)")

        # تحديد النتيجة النهائية
        success_rate = (successful_models / total_models * 100) if total_models > 0 else 0

        if successful_models == 0:
            overall_status = "failed"
            message = "فشل تدريب جميع النماذج - تحقق من البيانات أو حاول مرة أخرى"
        elif successful_models == total_models:
            overall_status = "success"
            message = f"🎉 تم تدريب جميع النماذج بنجاح! معدل النجاح: {success_rate:.1f}%"
        else:
            overall_status = "partial"
            message = f"⚠️ تم تدريب {successful_models} من أصل {total_models} نماذج (معدل النجاح: {success_rate:.1f}%)"

        # حفظ النتائج في التخزين المؤقت
        if redis_client:
            try:
                cache_data = {
                    'symbol': symbol,
                    'interval': interval,
                    'timestamp': datetime.now().isoformat(),
                    'training_results': training_results,
                    'overall_status': overall_status,
                    'success_rate': success_rate
                }
                redis_client.setex(f"training:{symbol}:{interval}", 3600, json.dumps(cache_data))
                print("✅ Results cached successfully")
            except Exception as e:
                print(f"⚠️ Caching failed: {e}")

        total_time = (datetime.now() - start_time).total_seconds()
        print(f"🏁 Training completed in {total_time:.2f} seconds")

        # إرجاع النتيجة النهائية
        result = {
            "symbol": symbol,
            "interval": interval,
            "overall_status": overall_status,
            "message": message,
            "successful_models": successful_models,
            "total_models": total_models,
            "success_rate": round(success_rate, 1),
            "data_points_used": len(prices),
            "training_results": training_results,
            "training_time_seconds": round(total_time, 2),
            "timestamp": datetime.now().isoformat(),
            "recommendations": {
                "simple_ai_ready": training_results.get('simple_ai', {}).get('status') == 'success',
                "advanced_ai_ready": training_results.get('advanced_ai', {}).get('status') == 'success',
                "enhanced_ai_ready": training_results.get('enhanced_ai', {}).get('status') == 'success',
                "can_use_for_predictions": successful_models > 0,
                "quality_score": "excellent" if success_rate >= 90 else "good" if success_rate >= 70 else "fair" if success_rate >= 50 else "poor"
            }
        }

        return clean_response_data(result)

    except HTTPException as http_exc:
        # إعادة رفع HTTP exceptions كما هي
        print(f"❌ HTTP Exception: {http_exc.detail}")
        raise http_exc

    except Exception as e:
        # معالجة الأخطاء غير المتوقعة
        error_time = (datetime.now() - start_time).total_seconds()
        print(f"💥 Unexpected error after {error_time:.2f}s: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")

        raise HTTPException(
            status_code=500,
            detail={
                "error": "خطأ غير متوقع أثناء التدريب",
                "message": f"حدث خطأ غير متوقع: {str(e)}",
                "symbol": symbol,
                "time_elapsed": f"{error_time:.2f} seconds",
                "suggestions": [
                    "تحقق من صحة رمز العملة",
                    "جرب تقليل عدد نقاط البيانات",
                    "حاول مرة أخرى بعد دقيقة",
                    "تأكد من استقرار اتصال الإنترنت"
                ],
                "technical_details": str(e) if len(str(e)) < 200 else str(e)[:200] + "..."
            }
        )


# Enhanced predict endpoint with better error handling
@app.get("/ai/predict/{symbol}")
async def predict_enhanced_safe(symbol: str):
    """
    التنبؤ مع معالجة محسنة للأخطاء
    """
    try:
        symbol = symbol.upper().strip()

        if not binance_client:
            raise HTTPException(
                status_code=503,
                detail={
                    "error": "خدمة التنبؤ غير متاحة",
                    "message": "خدمة Binance غير متصلة حالياً",
                    "suggestion": "حاول مرة أخرى لاحقاً"
                }
            )

        # جلب بيانات حديثة للتنبؤ
        try:
            klines = safe_binance_call(binance_client.get_klines, symbol, "1h", 100)
            if not klines:
                raise HTTPException(
                    status_code=404,
                    detail={
                        "error": "لا توجد بيانات للتنبؤ",
                        "message": f"لا توجد بيانات حديثة للعملة {symbol}",
                        "symbol": symbol
                    }
                )

            prices = extract_close_prices(klines)
            current_price = prices[-1] if prices else None

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "خطأ في جلب البيانات للتنبؤ",
                    "message": f"فشل في جلب البيانات: {str(e)}",
                    "symbol": symbol
                }
            )

        predictions = {}

        # محاولة التنبؤ بالنماذج المختلفة
        if simple_ai and getattr(simple_ai, 'is_trained', False):
            try:
                simple_pred = simple_ai.predict(prices)
                if 'error' not in simple_pred:
                    predictions['simple_ai'] = simple_pred
            except Exception as e:
                predictions['simple_ai'] = {'error': str(e)}

        if advanced_ai and getattr(advanced_ai, 'is_trained', False):
            try:
                volumes = [float(k.get('volume', 0)) for k in klines]
                if hasattr(advanced_ai, 'predict_ensemble'):
                    adv_pred = advanced_ai.predict_ensemble(prices, volumes)
                else:
                    adv_pred = {'error': 'Prediction method not available'}

                if 'error' not in adv_pred:
                    predictions['advanced_ai'] = adv_pred
            except Exception as e:
                predictions['advanced_ai'] = {'error': str(e)}

        result = {
            "symbol": symbol,
            "current_price": current_price,
            "predictions": predictions,
            "timestamp": datetime.now().isoformat(),
            "data_points": len(prices),
            "prediction_available": len(predictions) > 0,
            "message": "تم الحصول على التنبؤات بنجاح" if predictions else "لا توجد نماذج مدربة للتنبؤ"
        }

        return clean_response_data(result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "خطأ في خدمة التنبؤ",
                "message": f"فشل في التنبؤ: {str(e)}",
                "symbol": symbol
            }
        )
    
@app.get("/ai/training-status/{symbol}")
async def get_training_status(
        symbol: str,
        interval: str = Query(default="1h", description="Training interval to check")
):
    """
    التحقق من حالة التدريب لرمز معين
    """
    try:
        symbol = symbol.upper().strip()

        # البحث في التخزين المؤقت
        if redis_client:
            training_cache_key = f"training_results:{symbol}:{interval}"
            try:
                cached_result = redis_client.get(training_cache_key)
                if cached_result:
                    cached_data = json.loads(cached_result)
                    cache_age = (datetime.now() - datetime.fromisoformat(cached_data['timestamp'])).total_seconds() / 60
                    return clean_response_data({
                        "symbol": symbol,
                        "interval": interval,
                        "is_cached": True,
                        "cache_age_minutes": round(cache_age, 1),
                        **cached_data
                    })
            except Exception as e:
                print(f"Cache read error: {e}")

        # التحقق من حالة النماذج المباشرة
        models_status = {}

        if simple_ai:
            models_status['simple_ai'] = {
                'available': True,
                'trained': getattr(simple_ai, 'is_trained', False)
            }

        if advanced_ai:
            models_status['advanced_ai'] = {
                'available': True,
                'trained': getattr(advanced_ai, 'is_trained', False)
            }

        if ENHANCED_AI_AVAILABLE and enhanced_advanced_ai:
            models_status['enhanced_ai'] = {
                'available': True,
                'trained': getattr(enhanced_advanced_ai, 'is_trained', False)
            }

        return clean_response_data({
            "symbol": symbol,
            "interval": interval,
            "is_cached": False,
            "models_status": models_status,
            "last_check": datetime.now().isoformat(),
            "message": "No cached training results found - showing current model status"
        })

    except Exception as e:
        print(f"Training status check error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get training status: {str(e)}")


@app.get("/ai/validate-symbol/{symbol}")
async def validate_symbol_endpoint(symbol: str):
    """
    التحقق من صحة وتوفر رمز العملة
    """
    try:
        symbol = symbol.upper().strip()

        if not binance_client:
            return clean_response_data({
                "symbol": symbol,
                "is_valid": False,
                "error": "Binance client not available",
                "message": "Cannot validate symbol - Binance API not connected"
            })

        # اختبار الاتصال والحصول على السعر
        try:
            price = safe_binance_call(binance_client.get_symbol_price, symbol)

            if price and float(price) > 0:
                # اختبار جلب بيانات تاريخية بسيطة
                test_data = safe_binance_call(binance_client.get_klines, symbol, "1h", 10)

                return clean_response_data({
                    "symbol": symbol,
                    "is_valid": True,
                    "current_price": float(price),
                    "data_available": len(test_data) if test_data else 0,
                    "message": "Symbol is valid and has trading data available",
                    "timestamp": datetime.now().isoformat()
                })
            else:
                return clean_response_data({
                    "symbol": symbol,
                    "is_valid": False,
                    "message": "Symbol found but no valid price data",
                    "timestamp": datetime.now().isoformat()
                })

        except Exception as api_error:
            return clean_response_data({
                "symbol": symbol,
                "is_valid": False,
                "error": str(api_error),
                "message": "Symbol validation failed - may not exist or be inactive",
                "timestamp": datetime.now().isoformat()
            })

    except Exception as e:
        print(f"Symbol validation error: {e}")
        return clean_response_data({
            "symbol": symbol,
            "is_valid": False,
            "error": str(e),
            "message": "Failed to validate symbol due to server error",
            "timestamp": datetime.now().isoformat()
        })


# إضافة endpoint لاختبار الاتصال
@app.get("/ai/test-connection")
async def test_ai_connection():
    """
    اختبار الاتصالات والوحدات
    """
    results = {
        "timestamp": datetime.now().isoformat(),
        "overall_status": "healthy"
    }

    # اختبار Binance
    try:
        if binance_client:
            test_price = safe_binance_call(binance_client.get_symbol_price, "BTCUSDT")
            results["binance"] = {
                "status": "connected",
                "test_price": test_price,
                "message": "Binance API working"
            }
        else:
            results["binance"] = {
                "status": "not_available",
                "message": "Binance client not initialized"
            }
    except Exception as e:
        results["binance"] = {
            "status": "error",
            "error": str(e),
            "message": "Binance API connection failed"
        }
        results["overall_status"] = "degraded"

    # اختبار Redis
    try:
        if redis_client:
            redis_client.ping()
            results["redis"] = {
                "status": "connected",
                "message": "Redis cache working"
            }
        else:
            results["redis"] = {
                "status": "not_available",
                "message": "Redis not configured"
            }
    except Exception as e:
        results["redis"] = {
            "status": "error",
            "error": str(e),
            "message": "Redis connection failed"
        }

    # اختبار AI modules
    results["ai_modules"] = {
        "simple_ai": {
            "available": simple_ai is not None,
            "trained": getattr(simple_ai, 'is_trained', False) if simple_ai else False
        },
        "advanced_ai": {
            "available": advanced_ai is not None,
            "trained": getattr(advanced_ai, 'is_trained', False) if advanced_ai else False
        },
        "enhanced_ai": {
            "available": ENHANCED_AI_AVAILABLE,
            "instance": enhanced_advanced_ai is not None,
            "trained": getattr(enhanced_advanced_ai, 'is_trained', False) if enhanced_advanced_ai else False
        },
        "sentiment_analysis": {
            "available": SENTIMENT_AVAILABLE,
            "instance": sentiment_analyzer is not None
        }
    }

    return clean_response_data(results)

# ============ Main Entry Point ============
if __name__ == "__main__":
    import uvicorn

    print("=" * 50)
    print("🎯 Trading AI Platform Ready")
    print("📡 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("🤖 Enhanced AI Info: http://localhost:8000/ai/enhanced/info")
    print("📊 Debug Info: http://localhost:8000/debug/modules")
    print("💾 Cache Stats: http://localhost:8000/cache/stats")
    print("=" * 50)

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False, log_level="info", access_log=True)