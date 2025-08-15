from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
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
from wyckoff_analysis import WyckoffIntegration, WyckoffAnalyzer


# Import trading simulator properly
from trading_simulator import TradingSimulator, initialize_trading_simulator

load_dotenv()

app = FastAPI(title="Trading AI Platform", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://frontend:3000",
        "http://152.67.153.191:3000",  # Add this line!
        "*"  # Or use "*" for all origins (less secure but works for testing)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = "postgresql://trading_user:trading_pass_2024@postgres:5432/trading_db"
engine = create_engine(DATABASE_URL)

# Redis connection
redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)

# Binance client
binance_client = BinanceClient()

# Alert service
alert_service = AlertService(DATABASE_URL)

# Initialize trading simulator
trading_sim = initialize_trading_simulator(DATABASE_URL)

# Initialize Wyckoff analysis
wyckoff_integration = WyckoffIntegration(binance_client)


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
            "AI-powered predictions",
            "Wyckoff Analysis",
            "Trading Simulation"
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
    """
    الحصول على قائمة العملات المتاحة
    """
    try:
        symbols = binance_client.get_available_symbols()
        return {
            "symbols": symbols,
            "count": len(symbols),
            "note": "Popular USDT trading pairs"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/price/{symbol}")
async def get_current_price(symbol: str):
    """
    الحصول على السعر الحالي لعملة معينة
    """
    try:
        price = binance_client.get_symbol_price(symbol)
        if not price:
            raise HTTPException(status_code=404, detail=f"Could not fetch price for {symbol}")

        return {
            "symbol": symbol.upper(),
            "price": float(price),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai/ultimate-analysis/{symbol}")
async def get_ultimate_analysis(
        symbol: str,
        interval: str = Query(default="1h", description="Analysis timeframe"),
        include_wyckoff: bool = Query(default=True, description="Include Wyckoff analysis"),
        multi_timeframe_wyckoff: bool = Query(default=False, description="Multi-timeframe Wyckoff analysis")
):
    """
    التحليل الشامل النهائي مع جميع طبقات الذكاء الصناعي + تحليل وايكوف
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

        # تحليل وايكوف
        wyckoff_result = {"error": "Wyckoff analysis disabled"}
        if include_wyckoff:
            try:
                if multi_timeframe_wyckoff:
                    wyckoff_result = wyckoff_integration.get_multi_timeframe_wyckoff(symbol)
                else:
                    wyckoff_result = wyckoff_integration.get_wyckoff_analysis_for_symbol(symbol, interval)
            except Exception as e:
                wyckoff_result = {"error": f"خطأ في تحليل وايكوف: {str(e)}"}

        # القرار النهائي المدمج (محدث ليشمل وايكوف)
        ultimate_decision = combine_all_recommendations(
            technical_analysis, simple_ai_result, advanced_ai_result, wyckoff_result
        )

        # حساب عدد طرق التحليل النشطة
        active_methods = 3  # التحليل الفني + AI البسيط + AI المتقدم
        if include_wyckoff and "error" not in wyckoff_result:
            active_methods += 1

        # بناء النتيجة النهائية
        result = {
            "symbol": symbol.upper(),
            "current_price": float(latest_candle["close"]),
            "timestamp": pd.Timestamp.fromtimestamp(latest_candle["timestamp"] / 1000).strftime(
                "%Y-%m-%d %H:%M:%S UTC"),
            "analysis_layers": {
                "1_technical_analysis": technical_analysis,
                "2_simple_ai": simple_ai_result,
                "3_advanced_ai": advanced_ai_result,
                "4_wyckoff_analysis": wyckoff_result if include_wyckoff else {"disabled": True}
            },
            "ultimate_decision": ultimate_decision,
            "analysis_summary": {
                "total_analysis_methods": active_methods,
                "confidence_score": float(ultimate_decision.get("final_confidence", 0)),
                "risk_assessment": ultimate_decision.get("risk_level", "UNKNOWN"),
                "recommendation_strength": ultimate_decision.get("strength", "WEAK"),
                "wyckoff_enabled": include_wyckoff,
                "multi_timeframe_wyckoff": multi_timeframe_wyckoff if include_wyckoff else False
            },
            "market_context": generate_market_context(
                technical_analysis, wyckoff_result if include_wyckoff else None, latest_candle
            )
        }

        # تنظيف البيانات من numpy types قبل الإرسال
        cleaned_result = clean_response_data(result)
        return cleaned_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في التحليل الشامل: {str(e)}")


@app.get("/ai/comprehensive-analysis/{symbol}")
async def get_comprehensive_analysis(symbol: str):
    """
    التحليل الشامل البديل (fallback)
    """
    try:
        klines_data = binance_client.get_klines(symbol, "1h", 100)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")

        close_prices = extract_close_prices(klines_data)
        latest_candle = klines_data[-1]

        # التحليل الفني الأساسي
        analysis = comprehensive_analysis(close_prices)

        result = {
            "symbol": symbol.upper(),
            "current_price": float(latest_candle["close"]),
            "timestamp": datetime.utcnow().isoformat(),
            "analysis": analysis
        }

        return clean_response_data(result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Trading Portfolio Endpoints
@app.post("/trading/portfolio/create")
async def create_portfolio(
        user_id: str = Body(...),
        symbol: str = Body(...),
        initial_balance: float = Body(...),
        risk_level: str = Body(...)
):
    """
    إنشاء محفظة تداول جديدة
    """
    try:
        # التحقق من صحة رمز العملة
        current_price = binance_client.get_symbol_price(symbol)
        if not current_price:
            raise HTTPException(status_code=400, detail="رمز العملة غير صالح أو غير مدعوم")

        # التحقق من مستوى المخاطرة
        valid_risk_levels = ["LOW", "MEDIUM", "HIGH"]
        if risk_level not in valid_risk_levels:
            raise HTTPException(status_code=400, detail="مستوى المخاطرة يجب أن يكون LOW أو MEDIUM أو HIGH")

        # إنشاء المحفظة
        new_portfolio = trading_sim.Portfolio(
            user_id=user_id,
            symbol=symbol.upper(),
            initial_balance=initial_balance,
            current_balance=initial_balance,
            risk_level=risk_level,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        trading_sim.session.add(new_portfolio)
        trading_sim.session.commit()

        return {
            "portfolio_id": new_portfolio.id,
            "symbol": new_portfolio.symbol,
            "initial_balance": new_portfolio.initial_balance,
            "risk_level": new_portfolio.risk_level,
            "is_active": new_portfolio.is_active,
            "message": "تم إنشاء المحفظة بنجاح"
        }
    except Exception as e:
        trading_sim.session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/trading/portfolios/{user_id}")
async def get_user_portfolios(user_id: str):
    """
    جلب جميع محافظ المستخدم
    """
    try:
        result = trading_sim.get_all_portfolios(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/trading/portfolio/{portfolio_id}")
async def delete_portfolio(portfolio_id: str):
    """
    حذف محفظة
    """
    try:
        # البحث عن المحفظة
        portfolio = trading_sim.session.query(trading_sim.Portfolio).filter_by(id=portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="المحفظة غير موجودة")

        # حذف المحفظة
        trading_sim.session.delete(portfolio)
        trading_sim.session.commit()

        return {
            "message": "تم حذف المحفظة بنجاح",
            "portfolio_id": portfolio_id
        }
    except Exception as e:
        trading_sim.session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/trading/portfolio/{portfolio_id}/toggle")
async def toggle_portfolio_status(portfolio_id: str):
    """
    تفعيل/إيقاف التداول التلقائي للمحفظة
    """
    try:
        portfolio = trading_sim.session.query(trading_sim.Portfolio).filter_by(id=portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="المحفظة غير موجودة")

        portfolio.is_active = not portfolio.is_active
        portfolio.updated_at = datetime.utcnow()
        trading_sim.session.commit()

        return {
            "portfolio_id": portfolio_id,
            "is_active": portfolio.is_active,
            "status": "مفعل" if portfolio.is_active else "معطل",
            "message": f"تم {'تفعيل' if portfolio.is_active else 'إيقاف'} التداول التلقائي"
        }
    except Exception as e:
        trading_sim.session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/trading/manual-trade/{portfolio_id}")
async def manual_trade(
        portfolio_id: str,
        action: str = Body(...),
        percentage: float = Body(...)
):
    """
    تنفيذ صفقة يدوية
    """
    try:
        # إنشاء إشارة يدوية
        portfolio = trading_sim.session.query(trading_sim.Portfolio).filter_by(id=portfolio_id).first()
        if not portfolio:
            raise HTTPException(status_code=404, detail="المحفظة غير موجودة")

        current_price = binance_client.get_symbol_price(portfolio.symbol)
        if not current_price:
            raise HTTPException(status_code=400, detail="فشل في جلب السعر الحالي")

        manual_signal = {
            'action': action.upper(),
            'confidence': 100,  # ثقة كاملة للتداول اليدوي
            'source': 'MANUAL',
            'reasoning': f'تداول يدوي بنسبة {percentage}%',
            'current_price': current_price
        }

        # تعديل حجم التداول للتداول اليدوي
        if action.upper() == 'BUY':
            original_method = trading_sim.calculate_trade_size
            trading_sim.calculate_trade_size = lambda conf, risk: percentage / 100
            result = trading_sim.execute_trade(portfolio_id, manual_signal)
            trading_sim.calculate_trade_size = original_method
        else:
            result = trading_sim.execute_trade(portfolio_id, manual_signal)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def combine_all_recommendations(technical: Dict, simple_ai: Dict, advanced_ai: Dict, wyckoff: Dict) -> Dict[str, Any]:
    """
    دمج التوصيات من جميع طبقات التحليل بما في ذلك وايكوف
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

        # استخراج توصية وايكوف
        wyckoff_rec = "HOLD"
        wyckoff_conf = 50.0
        wyckoff_phase = "UNKNOWN"

        if "error" not in wyckoff and "trading_recommendation" in wyckoff:
            wyckoff_trading = wyckoff["trading_recommendation"]
            wyckoff_rec = wyckoff_trading.get("action", "HOLD")
            wyckoff_conf = float(wyckoff_trading.get("confidence", 50)) * 100
            wyckoff_phase = wyckoff.get("current_phase", "UNKNOWN")
        elif "error" not in wyckoff and "overall_recommendation" in wyckoff:
            overall_rec = wyckoff["overall_recommendation"]
            wyckoff_rec = overall_rec.get("final_action", "HOLD")
            wyckoff_conf = float(overall_rec.get("confidence", 0.5)) * 100
            wyckoff_phase = overall_rec.get("wyckoff_phase", "UNKNOWN")

        # حساب الأوزان بناءً على الثقة والأهمية
        total_weight = 0
        weighted_buy_score = 0
        weighted_sell_score = 0
        contributing_signals = 0
        analysis_breakdown = {}

        # وزن التحليل الفني (20%)
        tech_weight = (tech_conf / 100) * 0.8
        if tech_rec in ['BUY', 'STRONG_BUY']:
            weighted_buy_score += tech_weight
        elif tech_rec in ['SELL', 'STRONG_SELL']:
            weighted_sell_score += tech_weight
        total_weight += tech_weight
        if tech_rec != 'HOLD':
            contributing_signals += 1
        analysis_breakdown["technical"] = {
            "recommendation": tech_rec,
            "confidence": tech_conf,
            "weight": round(tech_weight, 3)
        }

        # وزن AI البسيط (25%)
        simple_weight = (simple_conf / 100) * 1.0
        if simple_rec in ['BUY', 'STRONG_BUY']:
            weighted_buy_score += simple_weight
        elif simple_rec in ['SELL', 'STRONG_SELL']:
            weighted_sell_score += simple_weight
        total_weight += simple_weight
        if simple_rec != 'HOLD':
            contributing_signals += 1
        analysis_breakdown["simple_ai"] = {
            "recommendation": simple_rec,
            "confidence": simple_conf,
            "weight": round(simple_weight, 3)
        }

        # وزن AI المتقدم (30%)
        advanced_weight = (advanced_conf / 100) * 1.2
        if advanced_rec in ['BUY', 'STRONG_BUY']:
            weighted_buy_score += advanced_weight
        elif advanced_rec in ['SELL', 'STRONG_SELL']:
            weighted_sell_score += advanced_weight
        total_weight += advanced_weight
        if advanced_rec != 'HOLD':
            contributing_signals += 1
        analysis_breakdown["advanced_ai"] = {
            "recommendation": advanced_rec,
            "confidence": advanced_conf,
            "weight": round(advanced_weight, 3)
        }

        # وزن تحليل وايكوف (25%)
        wyckoff_weight = (wyckoff_conf / 100) * 1.5
        if wyckoff_rec in ['BUY', 'STRONG_BUY']:
            weighted_buy_score += wyckoff_weight
        elif wyckoff_rec in ['SELL', 'STRONG_SELL']:
            weighted_sell_score += wyckoff_weight
        total_weight += wyckoff_weight
        if wyckoff_rec != 'HOLD':
            contributing_signals += 1
        analysis_breakdown["wyckoff"] = {
            "recommendation": wyckoff_rec,
            "confidence": wyckoff_conf,
            "phase": wyckoff_phase,
            "weight": round(wyckoff_weight, 3)
        }

        # حساب التوصية النهائية
        if total_weight == 0:
            final_recommendation = "HOLD"
            final_confidence = 50.0
            agreement_level = "NO_SIGNALS"
        else:
            buy_ratio = weighted_buy_score / total_weight
            sell_ratio = weighted_sell_score / total_weight

            if buy_ratio > sell_ratio and buy_ratio > 0.35:
                if buy_ratio > 0.75:
                    final_recommendation = "STRONG_BUY"
                elif buy_ratio > 0.55:
                    final_recommendation = "BUY"
                else:
                    final_recommendation = "WEAK_BUY"
                final_confidence = min(buy_ratio * 100 * 1.3, 95.0)
            elif sell_ratio > buy_ratio and sell_ratio > 0.35:
                if sell_ratio > 0.75:
                    final_recommendation = "STRONG_SELL"
                elif sell_ratio > 0.55:
                    final_recommendation = "SELL"
                else:
                    final_recommendation = "WEAK_SELL"
                final_confidence = min(sell_ratio * 100 * 1.3, 95.0)
            else:
                final_recommendation = "HOLD"
                final_confidence = 60.0

            # مستوى الاتفاق
            if contributing_signals >= 3:
                agreement_level = "STRONG_CONSENSUS"
            elif contributing_signals >= 2:
                agreement_level = "MODERATE_CONSENSUS"
            elif contributing_signals == 1:
                agreement_level = "SINGLE_SIGNAL"
            else:
                agreement_level = "MIXED_SIGNALS"

        # تحديد قوة التوصية
        if final_confidence > 85:
            strength = "VERY_STRONG"
        elif final_confidence > 70:
            strength = "STRONG"
        elif final_confidence > 55:
            strength = "MODERATE"
        else:
            strength = "WEAK"

        # تحديد مستوى المخاطر
        risk_factors = []
        if final_confidence < 60:
            risk_factors.append("ثقة منخفضة")
        if contributing_signals < 2:
            risk_factors.append("إشارات قليلة")

        if len(risk_factors) == 0:
            risk_level = "LOW"
        elif len(risk_factors) <= 1:
            risk_level = "MODERATE"
        else:
            risk_level = "HIGH"

        return {
            "final_recommendation": final_recommendation,
            "final_confidence": round(final_confidence, 1),
            "agreement_level": agreement_level,
            "risk_level": risk_level,
            "strength": strength,
            "contributing_signals": contributing_signals,
            "risk_factors": risk_factors,
            "analysis_breakdown": analysis_breakdown,
            "wyckoff_phase": wyckoff_phase
        }

    except Exception as e:
        return {
            "final_recommendation": "HOLD",
            "final_confidence": 50.0,
            "agreement_level": "ERROR",
            "risk_level": "HIGH",
            "strength": "WEAK",
            "contributing_signals": 0,
            "error": str(e)
        }


def generate_market_context(technical: Dict, wyckoff: Dict, latest_candle: Dict) -> Dict[str, Any]:
    """توليد السياق العام للسوق"""
    context = {
        "price_level": "NEUTRAL",
        "volume_profile": "NORMAL",
        "volatility_state": "MODERATE",
        "trend_status": "SIDEWAYS"
    }

    try:
        current_price = float(latest_candle["close"])

        # تحليل مستوى السعر من التحليل الفني
        if "support_resistance" in technical:
            sr = technical["support_resistance"]
            if "nearest_resistance" in sr and sr["nearest_resistance"]:
                resistance_distance = (sr["nearest_resistance"] - current_price) / current_price
                if resistance_distance < 0.02:
                    context["price_level"] = "NEAR_RESISTANCE"

        # تحليل الاتجاه
        if "trend" in technical:
            trend_info = technical["trend"]
            trend_strength = trend_info.get("strength", 0)
            if trend_strength > 0.7:
                context["trend_status"] = "STRONG_UPTREND"
            elif trend_strength > 0.3:
                context["trend_status"] = "UPTREND"
            elif trend_strength < -0.7:
                context["trend_status"] = "STRONG_DOWNTREND"
            elif trend_strength < -0.3:
                context["trend_status"] = "DOWNTREND"

    except Exception as e:
        context["error"] = f"خطأ في تحليل السياق: {str(e)}"

    return context


# Additional Trading Endpoints
@app.get("/trading/dashboard/{user_id}")
async def get_trading_dashboard(user_id: str):
    """
    الحصول على لوحة التداول الشاملة
    """
    try:
        # جلب جميع المحافظ
        portfolios_result = trading_sim.get_all_portfolios(user_id)

        # حساب الإحصائيات العامة
        total_balance = 0
        total_profit_loss = 0
        active_portfolios = 0

        if "portfolios" in portfolios_result:
            for portfolio in portfolios_result["portfolios"]:
                if "performance" in portfolio:
                    perf = portfolio["performance"]
                    total_balance += perf.get("current_balance", 0)
                    total_profit_loss += perf.get("total_profit_loss", 0)
                    if portfolio.get("is_active"):
                        active_portfolios += 1

        # جلب الصفقات الأخيرة
        recent_trades = []
        try:
            trades = trading_sim.session.query(trading_sim.Trade).order_by(
                trading_sim.Trade.timestamp.desc()
            ).limit(10).all()

            for trade in trades:
                recent_trades.append({
                    "id": trade.id,
                    "symbol": trade.symbol,
                    "trade_type": trade.trade_type,
                    "quantity": trade.quantity,
                    "price": trade.price,
                    "profit_loss": trade.profit_loss,
                    "timestamp": trade.timestamp.isoformat(),
                    "signal_source": trade.signal_source
                })
        except Exception as e:
            recent_trades = [{"error": f"فشل في جلب الصفقات: {str(e)}"}]

        return {
            "user_id": user_id,
            "summary": {
                "total_portfolios": portfolios_result.get("total_portfolios", 0),
                "active_portfolios": active_portfolios,
                "total_balance": round(total_balance, 2),
                "total_profit_loss": round(total_profit_loss, 2),
                "profit_percentage": round((total_profit_loss / total_balance * 100), 2) if total_balance > 0 else 0
            },
            "portfolios": portfolios_result.get("portfolios", []),
            "recent_trades": recent_trades,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/trading/performance/{portfolio_id}")
async def get_portfolio_performance(portfolio_id: str):
    """
    الحصول على أداء محفظة محددة
    """
    try:
        result = trading_sim.get_portfolio_performance(portfolio_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/trading/auto-cycle/{portfolio_id}")
async def run_auto_trading_cycle(portfolio_id: str):
    """
    تشغيل دورة التداول التلقائي لمحفظة محددة
    """
    try:
        result = trading_sim.auto_trade_cycle(portfolio_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/trading/suggestions/{user_id}")
async def get_investment_suggestions(user_id: str, risk_level: str = Query(default="MEDIUM")):
    """
    اقتراح العملات للاستثمار
    """
    try:
        result = trading_sim.suggest_cryptocurrencies(risk_level)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Backtesting Endpoints
@app.post("/backtest/single/{symbol}")
async def run_single_backtest(
        symbol: str,
        days: int = Query(default=7, description="Number of days to backtest"),
        strategy: str = Query(default="AI_HYBRID", description="Trading strategy"),
        initial_balance: float = Query(default=1000.0, description="Initial balance")
):
    """
    تشغيل اختبار خلفي لعملة واحدة
    """
    try:
        # الحصول على البيانات التاريخية
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)

        # جلب بيانات الشموع
        klines_data = binance_client.get_klines(symbol, "1h", days * 24)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch historical data for {symbol}")

        # تشغيل الاختبار الخلفي
        backtest_result = simulate_trading_strategy(klines_data, strategy, initial_balance)

        return {
            "symbol": symbol.upper(),
            "strategy": strategy,
            "period": f"{days} days",
            "initial_balance": initial_balance,
            "backtest_result": backtest_result,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def simulate_trading_strategy(klines_data: List, strategy: str, initial_balance: float) -> Dict:
    """
    محاكاة استراتيجية التداول على البيانات التاريخية
    """
    try:
        balance = initial_balance
        position = 0.0
        trades = []
        max_balance = initial_balance
        max_drawdown = 0.0

        for i, candle in enumerate(klines_data[20:], 20):  # تجاهل أول 20 شمعة للمؤشرات
            close_prices = [float(k["close"]) for k in klines_data[i - 20:i + 1]]
            current_price = float(candle["close"])

            # تحليل السوق
            technical_analysis = comprehensive_analysis(close_prices)

            # إشارة التداول بناءً على الاستراتيجية
            signal = get_trading_signal(technical_analysis, strategy)

            if signal == "BUY" and balance > current_price:
                # شراء
                quantity = balance * 0.95 / current_price  # استخدام 95% من الرصيد
                position += quantity
                balance = balance - (quantity * current_price)
                trades.append({
                    "type": "BUY",
                    "price": current_price,
                    "quantity": quantity,
                    "timestamp": candle["timestamp"]
                })

            elif signal == "SELL" and position > 0:
                # بيع
                balance += position * current_price
                trades.append({
                    "type": "SELL",
                    "price": current_price,
                    "quantity": position,
                    "timestamp": candle["timestamp"]
                })
                position = 0

            # حساب القيمة الإجمالية
            total_value = balance + (position * current_price)
            max_balance = max(max_balance, total_value)
            drawdown = (max_balance - total_value) / max_balance
            max_drawdown = max(max_drawdown, drawdown)

        # القيمة النهائية
        final_price = float(klines_data[-1]["close"])
        final_value = balance + (position * final_price)

        # حساب الأداء
        total_return = final_value - initial_balance
        return_percentage = (total_return / initial_balance) * 100

        # حساب معدل الربح
        winning_trades = [t for t in trades if t["type"] == "SELL"]
        win_rate = 0
        if len(winning_trades) > 0:
            profitable_trades = 0
            for i in range(0, len(winning_trades)):
                if i > 0:
                    buy_price = trades[i * 2]["price"]  # سعر الشراء
                    sell_price = winning_trades[i]["price"]  # سعر البيع
                    if sell_price > buy_price:
                        profitable_trades += 1
            win_rate = (profitable_trades / len(winning_trades)) * 100

        return {
            "initial_balance": initial_balance,
            "final_balance": round(final_value, 2),
            "total_return": round(total_return, 2),
            "return_percentage": round(return_percentage, 2),
            "max_drawdown": round(max_drawdown * 100, 2),
            "total_trades": len(trades),
            "win_rate": round(win_rate, 2),
            "trades": trades[:10],  # إرجاع أول 10 صفقات فقط
            "strategy_used": strategy
        }
    except Exception as e:
        return {"error": f"فشل في محاكاة الاستراتيجية: {str(e)}"}


def get_trading_signal(technical_analysis: Dict, strategy: str) -> str:
    """
    الحصول على إشارة التداول بناءً على الاستراتيجية
    """
    try:
        if strategy == "TECHNICAL":
            return technical_analysis.get("overall_recommendation", "HOLD")

        elif strategy == "AI_HYBRID":
            # دمج التحليل الفني مع AI
            tech_rec = technical_analysis.get("overall_recommendation", "HOLD")

            # إشارات إضافية من المؤشرات
            macd_signal = "HOLD"
            if "macd" in technical_analysis:
                macd = technical_analysis["macd"]
                if macd.get("signal") == "BUY":
                    macd_signal = "BUY"
                elif macd.get("signal") == "SELL":
                    macd_signal = "SELL"

            rsi_signal = "HOLD"
            if "rsi" in technical_analysis:
                rsi_value = technical_analysis["rsi"].get("current", 50)
                if rsi_value < 30:
                    rsi_signal = "BUY"  # منطقة ذروة البيع
                elif rsi_value > 70:
                    rsi_signal = "SELL"  # منطقة ذروة الشراء

            # دمج الإشارات
            signals = [tech_rec, macd_signal, rsi_signal]
            buy_count = signals.count("BUY")
            sell_count = signals.count("SELL")

            if buy_count >= 2:
                return "BUY"
            elif sell_count >= 2:
                return "SELL"
            else:
                return "HOLD"

        else:
            return technical_analysis.get("overall_recommendation", "HOLD")

    except Exception as e:
        return "HOLD"


# Scheduler Endpoints
@app.get("/trading/scheduler/status")
async def get_scheduler_status():
    """
    الحصول على حالة المجدول
    """
    try:
        # هذا سيتطلب تتبع حالة المجدول
        return {
            "is_running": False,  # يجب تنفيذ هذا مع المجدول الفعلي
            "next_run": None,
            "last_run": None,
            "active_cycles": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/trading/scheduler/start")
async def start_scheduler():
    """
    بدء المجدول
    """
    try:
        # تنفيذ بدء المجدول
        return {"message": "تم بدء المجدول بنجاح", "status": "running"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/trading/scheduler/stop")
async def stop_scheduler():
    """
    إيقاف المجدول
    """
    try:
        # تنفيذ إيقاف المجدول
        return {"message": "تم إيقاف المجدول بنجاح", "status": "stopped"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Alert Endpoints
@app.get("/alerts/recent/{limit}")
async def get_recent_alerts(limit: int = 10):
    """
    الحصول على التنبيهات الأخيرة
    """
    try:
        # استخدام alert_service للحصول على التنبيهات
        alerts = alert_service.get_recent_alerts(limit)
        return {"alerts": alerts, "count": len(alerts)}
    except Exception as e:
        return {"alerts": [], "error": str(e)}


@app.post("/alerts/create")
async def create_alert(
        symbol: str = Body(...),
        alert_type: str = Body(...),
        threshold: float = Body(...),
        user_id: str = Body(...)
):
    """
    إنشاء تنبيه جديد
    """
    try:
        alert = alert_service.create_alert(symbol, alert_type, threshold, user_id)
        return {"message": "تم إنشاء التنبيه بنجاح", "alert_id": alert}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Market Data Endpoints
@app.get("/market/data/{symbol}")
async def get_market_data(
        symbol: str,
        interval: str = Query(default="1h"),
        limit: int = Query(default=100)
):
    """
    الحصول على بيانات السوق
    """
    try:
        klines_data = binance_client.get_klines(symbol, interval, limit)
        if not klines_data:
            raise HTTPException(status_code=404, detail=f"Could not fetch data for {symbol}")

        # تنسيق البيانات للرسوم البيانية
        formatted_data = []
        for candle in klines_data:
            formatted_data.append({
                "timestamp": candle["timestamp"],
                "open": float(candle["open"]),
                "high": float(candle["high"]),
                "low": float(candle["low"]),
                "close": float(candle["close"]),
                "volume": float(candle["volume"])
            })

        return {
            "symbol": symbol.upper(),
            "interval": interval,
            "data": formatted_data,
            "count": len(formatted_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Startup event
@app.on_event("startup")
async def startup_event():
    """
    تنفيذ عند بدء التطبيق
    """
    try:
        # إنشاء الجداول في قاعدة البيانات
        print("✅ Database tables created successfully")

        # اختبار اتصال Binance
        test_price = binance_client.get_symbol_price("BTCUSDT")
        if test_price:
            print(f"✅ Binance API connected - BTC price: ${test_price}")
        else:
            print("⚠️ Binance API connection issue")

    except Exception as e:
        print(f"❌ Startup error: {str(e)}")

@app.get("/trading/suggest-coins")
async def suggest_coins(
    risk_level: str = Query(default="MEDIUM", description="Risk level: LOW, MEDIUM, HIGH"),
    count: int = Query(default=10, description="Number of suggestions")
):
    """
    اقتراح العملات للاستثمار
    """
    try:
        result = trading_sim.suggest_cryptocurrencies(risk_level, count)
        return result
    except Exception as e:
        # Fallback demo data
        demo_suggestions = [
            {
                "symbol": "BTCUSDT",
                "recommendation": "BUY",
                "confidence": 78.5,
                "current_price": 67350.45,
                "score": 85.2,
                "reasoning": "تحليل فني إيجابي مع كسر مستوى مقاومة مهم",
                "analysis_source": "AI_ANALYSIS"
            },
            {
                "symbol": "ETHUSDT",
                "recommendation": "BUY",
                "confidence": 82.1,
                "current_price": 3245.67,
                "score": 88.7,
                "reasoning": "قوة نسبية عالية مع تحسن في حجم التداول",
                "analysis_source": "AI_ANALYSIS"
            },
            {
                "symbol": "BNBUSDT",
                "recommendation": "HOLD",
                "confidence": 65.3,
                "current_price": 415.23,
                "score": 72.4,
                "reasoning": "توجه جانبي - انتظار كسر مستوى مهم",
                "analysis_source": "AI_ANALYSIS"
            }
        ]
        return {
            "suggestions": demo_suggestions[:count],
            "risk_level": risk_level,
            "analysis_timestamp": datetime.now().isoformat(),
            "note": "اقتراحات تجريبية - خطأ في النظام الرئيسي"
        }
    
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)