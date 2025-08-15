from fastapi import FastAPI, HTTPException, Query, Body
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

# إنشاء كائن تحليل وايكوف
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
            wyckoff_conf = float(wyckoff_trading.get("confidence", 50)) * 100  # تحويل إلى نسبة مئوية
            wyckoff_phase = wyckoff.get("current_phase", "UNKNOWN")
        elif "error" not in wyckoff and "overall_recommendation" in wyckoff:
            # في حالة التحليل متعدد الإطارات
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

        # وزن تحليل وايكوف (25% - أعلى وزن بسبب شموليته)
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

            # تحديد التوصية بناءً على النسب
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

        # تحديد مستوى المخاطر مع مراعاة وايكوف
        risk_factors = []
        if final_confidence < 60:
            risk_factors.append("ثقة منخفضة")
        if contributing_signals < 2:
            risk_factors.append("إشارات قليلة")
        if wyckoff_phase in ["DISTRIBUTION", "MARKDOWN"] and final_recommendation in ["BUY", "STRONG_BUY"]:
            risk_factors.append("تضارب مع مرحلة وايكوف")
        if wyckoff_phase in ["ACCUMULATION", "MARKUP"] and final_recommendation in ["SELL", "STRONG_SELL"]:
            risk_factors.append("تضارب مع مرحلة وايكوف")

        if len(risk_factors) == 0:
            risk_level = "LOW"
        elif len(risk_factors) <= 1:
            risk_level = "MODERATE"
        else:
            risk_level = "HIGH"

        # إنشاء التفسير المفصل
        reasoning_parts = []

        if contributing_signals == 0:
            reasoning = "لا توجد إشارات واضحة من أي من طرق التحليل - من الأفضل الانتظار"
        else:
            # تحليل مساهمة كل طريقة
            contributors = []
            if tech_rec != 'HOLD':
                contributors.append(f"التحليل الفني ({tech_rec})")
            if simple_rec != 'HOLD':
                contributors.append(f"AI البسيط ({simple_rec})")
            if advanced_rec != 'HOLD':
                contributors.append(f"AI المتقدم ({advanced_rec})")
            if wyckoff_rec != 'HOLD':
                contributors.append(f"وايكوف ({wyckoff_rec} - {wyckoff_phase})")

            if len(contributors) > 1:
                consensus_strength = "قوي" if agreement_level == "STRONG_CONSENSUS" else "جزئي"
                reasoning = f"إجماع {consensus_strength} من {len(contributors)} طرق تحليل: {', '.join(contributors)}"
            else:
                reasoning = f"إشارة من {contributors[0]} فقط"

            # إضافة تحذيرات المخاطر
            if risk_factors:
                reasoning += f" - تحذير: {', '.join(risk_factors)}"

        # حساب توزيع الأوزان النهائي
        weight_distribution = {}
        if total_weight > 0:
            weight_distribution = {
                "technical": round((tech_weight / total_weight) * 100, 1),
                "simple_ai": round((simple_weight / total_weight) * 100, 1),
                "advanced_ai": round((advanced_weight / total_weight) * 100, 1),
                "wyckoff": round((wyckoff_weight / total_weight) * 100, 1)
            }

        return {
            "final_recommendation": final_recommendation,
            "final_confidence": round(final_confidence, 1),
            "reasoning": reasoning,
            "agreement_level": agreement_level,
            "risk_level": risk_level,
            "strength": strength,
            "contributing_signals": contributing_signals,
            "risk_factors": risk_factors,
            "weight_distribution": weight_distribution,
            "analysis_breakdown": analysis_breakdown,
            "wyckoff_phase": wyckoff_phase,
            "market_regime": determine_market_regime(wyckoff_phase, final_recommendation, strength)
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


def determine_market_regime(wyckoff_phase: str, recommendation: str, strength: str) -> Dict[str, str]:
    """تحديد نظام السوق الحالي"""

    if wyckoff_phase == "ACCUMULATION":
        if recommendation in ["BUY", "STRONG_BUY"]:
            regime = "ACCUMULATION_BULLISH"
            description = "مرحلة تجميع مع فرص شراء"
        else:
            regime = "ACCUMULATION_NEUTRAL"
            description = "مرحلة تجميع - انتظار إشارة الخروج"

    elif wyckoff_phase == "MARKUP":
        if recommendation in ["BUY", "STRONG_BUY"]:
            regime = "TRENDING_BULLISH"
            description = "اتجاه صاعد قوي - استمرار الصعود"
        else:
            regime = "TRENDING_WEAKENING"
            description = "اتجاه صاعد لكن مع إشارات ضعف"

    elif wyckoff_phase == "DISTRIBUTION":
        if recommendation in ["SELL", "STRONG_SELL"]:
            regime = "DISTRIBUTION_BEARISH"
            description = "مرحلة توزيع مع فرص بيع"
        else:
            regime = "DISTRIBUTION_NEUTRAL"
            description = "مرحلة توزيع - حذر مطلوب"

    elif wyckoff_phase == "MARKDOWN":
        if recommendation in ["SELL", "STRONG_SELL"]:
            regime = "TRENDING_BEARISH"
            description = "اتجاه هابط قوي - استمرار الهبوط"
        else:
            regime = "TRENDING_BOTTOMING"
            description = "اتجاه هابط لكن مع إشارات تقوية"

    else:
        regime = "UNCERTAIN"
        description = "نظام السوق غير واضح - حذر مطلوب"

    return {
        "regime": regime,
        "description": description
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
                elif resistance_distance > 0.1:
                    context["price_level"] = "FAR_FROM_RESISTANCE"

            if "nearest_support" in sr and sr["nearest_support"]:
                support_distance = (current_price - sr["nearest_support"]) / current_price
                if support_distance < 0.02:
                    context["price_level"] = "NEAR_SUPPORT"
                elif support_distance > 0.1:
                    context["price_level"] = "FAR_FROM_SUPPORT"

        # تحليل الحجم من وايكوف
        if wyckoff and "volume_analysis" in wyckoff:
            vol_analysis = wyckoff["volume_analysis"]
            if vol_analysis.get("volume_quality") == "HIGH":
                context["volume_profile"] = "ABOVE_AVERAGE"
            elif vol_analysis.get("volume_quality") == "LOW":
                context["volume_profile"] = "BELOW_AVERAGE"

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

        # تحليل التذبذب
        if "volatility" in technical:
            volatility = technical["volatility"]
            if volatility > 0.05:
                context["volatility_state"] = "HIGH"
            elif volatility < 0.02:
                context["volatility_state"] = "LOW"

    except Exception as e:
        context["error"] = f"خطأ في تحليل السياق: {str(e)}"

    return context
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
        current_price = trading_sim.binance_client.get_symbol_price(symbol)
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
# إضافة هذه الـ endpoints إلى ملف main.py

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
        
        current_price = trading_sim.binance_client.get_symbol_price(portfolio.symbol)
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
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
