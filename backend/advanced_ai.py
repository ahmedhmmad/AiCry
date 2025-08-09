import numpy as np
import pandas as pd
import os
import joblib
from typing import List, Dict, Any
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
from datetime import datetime
from simple_ai import simple_ai

class AdvancedAI:
    def __init__(self):
        self.models = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'gradient_boost': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'logistic': LogisticRegression(random_state=42, max_iter=1000)
        }
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "/app/models/"
        self.feature_importance = {}
        
        # إنشاء مجلد النماذج إذا لم يكن موجوداً
        os.makedirs(self.model_path, exist_ok=True)
    
    def clean_numpy_types(self, obj):
        """تحويل numpy types إلى Python types للـ JSON"""
        if isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {k: self.clean_numpy_types(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self.clean_numpy_types(item) for item in obj]
        elif pd.isna(obj):
            return None
        return obj
    
    def engineer_advanced_features(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
        """
        هندسة ميزات متقدمة ومحسنة
        """
        try:
            # استخدام المؤشرات المحسنة إذا كانت متاحة
            try:
                from enhanced_indicators import calculate_enhanced_indicators
                features_df = calculate_enhanced_indicators(prices, volumes)
                print(f"تم استخدام المؤشرات المحسنة: {features_df.shape[1]} ميزة")
                return features_df
            except ImportError:
                print("المؤشرات المحسنة غير متاحة، استخدام الأساسية...")
                return self.engineer_basic_features(prices, volumes)
        except Exception as e:
            print(f"خطأ في هندسة الميزات: {e}")
            return self.engineer_basic_features(prices, volumes)

    def engineer_basic_features(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
        """
        هندسة ميزات أساسية (النسخة القديمة)
        """
        df = pd.DataFrame({'price': prices})
        
        if volumes:
            df['volume'] = volumes[:len(prices)]
        else:
            df['volume'] = np.random.uniform(1000, 10000, len(prices))
        
        # المتوسطات المتحركة
        df['ma_5'] = df['price'].rolling(window=5).mean()
        df['ma_10'] = df['price'].rolling(window=10).mean()
        df['ma_20'] = df['price'].rolling(window=20).mean()
        df['ma_50'] = df['price'].rolling(window=50).mean()
        
        # RSI
        delta = df['price'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # MACD
        exp1 = df['price'].ewm(span=12).mean()
        exp2 = df['price'].ewm(span=26).mean()
        df['macd'] = exp1 - exp2
        df['macd_signal'] = df['macd'].ewm(span=9).mean()
        df['macd_histogram'] = df['macd'] - df['macd_signal']
        
        # Bollinger Bands
        bb_period = 20
        df['bb_middle'] = df['price'].rolling(window=bb_period).mean()
        bb_std = df['price'].rolling(window=bb_period).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        df['bb_position'] = (df['price'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
        
        # مؤشرات التقلب
        df['volatility'] = df['price'].rolling(window=20).std()
        df['price_change'] = df['price'].pct_change()
        df['volume_change'] = df['volume'].pct_change()
        
        # مؤشرات الزخم
        df['momentum_5'] = df['price'] / df['price'].shift(5) - 1
        df['momentum_10'] = df['price'] / df['price'].shift(10) - 1
        df['momentum_20'] = df['price'] / df['price'].shift(20) - 1
        
        # المؤشرات الفنية المتقدمة
        df['stoch_k'] = ((df['price'] - df['price'].rolling(14).min()) / 
                        (df['price'].rolling(14).max() - df['price'].rolling(14).min())) * 100
        df['stoch_d'] = df['stoch_k'].rolling(3).mean()
        
        # العلاقات بين الميزات
        df['ma_ratio_5_20'] = df['ma_5'] / df['ma_20']
        df['ma_ratio_10_50'] = df['ma_10'] / df['ma_50']
        df['volume_price_trend'] = df['volume'] * df['price_change']
        
        # ميزات زمنية
        df['hour'] = np.arange(len(df)) % 24
        df['day_of_week'] = (np.arange(len(df)) // 24) % 7
        
        # تحويل الميزات الدورية
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        
        # تنظيف البيانات
        df = df.bfill().ffill()
        
        return df
    
    def select_important_features(self, df: pd.DataFrame) -> List[str]:
        """
        اختيار الميزات المهمة
        """
        try:
            # استخدام الاختيار المتقدم إذا كان متاحاً
            try:
                from enhanced_indicators import select_best_features
                target = df['price'].shift(-1) - df['price']  # تغيير السعر
                selected_features = select_best_features(df, target, max_features=60)
                print(f"تم اختيار {len(selected_features)} ميزة متقدمة")
                return selected_features
            except ImportError:
                print("استخدام الاختيار الأساسي للميزات...")
                pass
        except Exception as e:
            print(f"خطأ في الاختيار المتقدم: {e}")
        
        # الطريقة الأساسية
        exclude_cols = ['price', 'hour', 'day_of_week']
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        
        # التأكد من وجود البيانات
        available_cols = []
        for col in feature_cols:
            if col in df.columns and not df[col].isna().all():
                available_cols.append(col)
        
        return available_cols[:30]  # أخذ أفضل 30 ميزة
    
    def generate_feature_report(self, prices: List[float], volumes: List[float] = None) -> Dict[str, Any]:
        """
        إنشاء تقرير مفصل عن الميزات المُستخدمة
        """
        try:
            features_df = self.engineer_advanced_features(prices, volumes)
            selected_features = self.select_important_features(features_df)
            
            # تحليل أساسي للميزات
            feature_analysis = {
                'total_features_generated': features_df.shape[1],
                'selected_features_count': len(selected_features),
                'top_20_features': selected_features[:20],
                'feature_categories': self.categorize_features(selected_features),
                'data_quality': {
                    'missing_values': features_df.isnull().sum().sum(),
                    'infinite_values': np.isinf(features_df.select_dtypes(include=[np.number])).sum().sum(),
                    'data_points': len(features_df)
                },
                'enhancement_status': 'enhanced_indicators_available' if self.has_enhanced_indicators() else 'basic_indicators_only'
            }
            
            # إضافة إحصائيات إضافية إذا كانت المؤشرات المحسنة متاحة
            if self.has_enhanced_indicators():
                try:
                    from enhanced_indicators import create_feature_importance_report
                    target = features_df['price'].shift(-1) - features_df['price']
                    detailed_report = create_feature_importance_report(features_df, target)
                    feature_analysis.update(detailed_report)
                except Exception as e:
                    feature_analysis['detailed_analysis_error'] = str(e)
            
            return feature_analysis
            
        except Exception as e:
            return {"error": f"فشل في إنشاء التقرير: {str(e)}"}
    
    def has_enhanced_indicators(self) -> bool:
        """فحص إذا كانت المؤشرات المحسنة متاحة"""
        try:
            import enhanced_indicators
            return True
        except ImportError:
            return False
    
    def categorize_features(self, features: List[str]) -> Dict[str, List[str]]:
        """تصنيف الميزات حسب النوع"""
        categories = {
            'trend_indicators': [],
            'momentum_indicators': [],
            'volatility_indicators': [],
            'volume_indicators': [],
            'statistical_features': [],
            'time_features': [],
            'other_features': []
        }
        
        for feature in features:
            if any(x in feature.lower() for x in ['ma', 'ema', 'sma', 'hma', 'adx', 'trend']):
                categories['trend_indicators'].append(feature)
            elif any(x in feature.lower() for x in ['rsi', 'stoch', 'williams', 'roc', 'momentum']):
                categories['momentum_indicators'].append(feature)
            elif any(x in feature.lower() for x in ['bb', 'atr', 'kc', 'std', 'volatility']):
                categories['volatility_indicators'].append(feature)
            elif any(x in feature.lower() for x in ['volume', 'obv', 'vpt', 'cmf', 'vwap']):
                categories['volume_indicators'].append(feature)
            elif any(x in feature.lower() for x in ['zscore', 'lr_', 'cv_', 'ratio', 'change']):
                categories['statistical_features'].append(feature)
            elif any(x in feature.lower() for x in ['hour', 'day', 'sin', 'cos']):
                categories['time_features'].append(feature)
            else:
                categories['other_features'].append(feature)
        
        return categories
    
    def create_targets(self, prices: List[float], future_periods: int = 1) -> np.ndarray:
        """
        إنشاء أهداف التدريب (صعود/هبوط)
        """
        targets = []
        for i in range(len(prices) - future_periods):
            current_price = prices[i]
            future_price = prices[i + future_periods]
            
            # 1 للصعود، 0 للهبوط
            target = 1 if future_price > current_price else 0
            targets.append(target)
        
        # إضافة نقاط للوصول لنفس طول المصفوفة
        for _ in range(future_periods):
            targets.append(targets[-1] if targets else 0)
        
        return np.array(targets)
    
    def train_ensemble(self, prices: List[float], volumes: List[float] = None) -> Dict[str, Any]:
        """
        تدريب مجموعة النماذج
        """
        try:
            print(f"Training with {len(prices)} price points")
            
            if len(prices) < 50:
                return {"error": "يحتاج 50 نقطة على الأقل للتدريب المتقدم"}
            
            # هندسة الميزات
            features_df = self.engineer_advanced_features(prices, volumes)
            
            # اختيار الميزات المهمة
            feature_columns = self.select_important_features(features_df)
            X = features_df[feature_columns].values
            
            # إنشاء الأهداف
            y = self.create_targets(prices)
            
            # إزالة القيم المفقودة
            valid_indices = ~(np.isnan(y) | np.isnan(X).any(axis=1))
            X = X[valid_indices]
            y = y[valid_indices]
            
            if len(X) < 50:
                return {"error": "بيانات صالحة غير كافية للتدريب"}
            
            # تقسيم البيانات
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # تطبيع البيانات
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # تدريب النماذج
            model_scores = {}
            for name, model in self.models.items():
                try:
                    # تدريب النموذج
                    model.fit(X_train_scaled, y_train)
                    
                    # اختبار الأداء
                    test_pred = model.predict(X_test_scaled)
                    test_accuracy = accuracy_score(y_test, test_pred)
                    
                    model_scores[name] = {
                        'accuracy': float(test_accuracy),
                        'samples': int(len(X_test))
                    }
                except Exception as e:
                    model_scores[name] = {'error': str(e)}
            
            # حفظ النماذج
            self.save_ensemble()
            self.is_trained = True
            
            # حساب أهمية الميزات
            self.calculate_feature_importance(feature_columns)
            
            # اختيار أفضل نموذج
            valid_scores = {k: v['accuracy'] for k, v in model_scores.items() if 'accuracy' in v}
            best_model = max(valid_scores.keys(), key=lambda k: valid_scores[k]) if valid_scores else 'random_forest'
            
            result = {
                "training_completed": True,
                "training_samples": int(len(X_train)),
                "test_samples": int(len(X_test)),
                "feature_count": int(len(feature_columns)),
                "model_scores": {k: round(v.get('accuracy', 0), 3) for k, v in model_scores.items()},
                "best_model": best_model,
                "best_accuracy": round(valid_scores.get(best_model, 0), 3),
                "performance_level": self.get_performance_level(valid_scores.get(best_model, 0)),
                "top_features": self.get_top_features(5),
                "enhancement_used": self.has_enhanced_indicators()
            }
            
            return self.clean_numpy_types(result)
            
        except Exception as e:
            return {"error": f"فشل التدريب المتقدم: {str(e)}"}
    
    def predict_ensemble(self, prices: List[float], volumes: List[float] = None) -> Dict[str, Any]:
        """
        التنبؤ باستخدام مجموعة النماذج
        """
        try:
            if not self.is_trained:
                return {"error": "النماذج غير مدربة"}
            
            if len(prices) < 50:
                return {"error": "يحتاج 50 نقطة على الأقل للتنبؤ"}
            
            # هندسة الميزات
            features_df = self.engineer_advanced_features(prices, volumes)
            feature_columns = self.select_important_features(features_df)
            
            # أخذ آخر نقطة للتنبؤ
            X = features_df[feature_columns].iloc[-1:].values
            
            if np.isnan(X).any():
                return {"error": "بيانات غير صالحة للتنبؤ"}
            
            # تطبيع البيانات
            X_scaled = self.scaler.transform(X)
            
            # التنبؤ من كل نموذج
            predictions = {}
            probabilities = {}
            
            for name, model in self.models.items():
                try:
                    pred = model.predict(X_scaled)[0]
                    prob = model.predict_proba(X_scaled)[0] if hasattr(model, 'predict_proba') else [0.5, 0.5]
                    
                    predictions[name] = int(pred)
                    probabilities[name] = {
                        'down': float(prob[0] * 100),
                        'up': float(prob[1] * 100)
                    }
                except Exception as e:
                    predictions[name] = 0
                    probabilities[name] = {'down': 50.0, 'up': 50.0}
            
            # التنبؤ المجمع
            ensemble_prediction = self.combine_predictions(predictions, probabilities)
            
            # تحليل اتفاق النماذج
            agreement = self.calculate_model_agreement(predictions)
            
            result = {
                "ensemble_prediction": ensemble_prediction,
                "individual_predictions": predictions,
                "individual_probabilities": probabilities,
                "model_agreement": agreement,
                "feature_analysis": self.analyze_current_features(features_df.iloc[-1])
            }
            
            return self.clean_numpy_types(result)
            
        except Exception as e:
            return {"error": f"فشل التنبؤ: {str(e)}"}
    
    def combine_predictions(self, predictions: Dict, probabilities: Dict) -> Dict[str, Any]:
        """
        دمج تنبؤات النماذج المختلفة
        """
        # حساب التصويت
        votes = list(predictions.values())
        up_votes = sum(votes)
        total_votes = len(votes)
        
        # حساب متوسط الاحتماليات
        avg_up_prob = np.mean([p['up'] for p in probabilities.values()])
        avg_down_prob = np.mean([p['down'] for p in probabilities.values()])
        
        # التنبؤ النهائي
        final_prediction = "UP" if up_votes > total_votes / 2 else "DOWN"
        final_recommendation = "BUY" if avg_up_prob > 60 else "SELL" if avg_down_prob > 60 else "HOLD"
        
        # مستوى الثقة
        confidence = max(avg_up_prob, avg_down_prob)
        
        return {
            "final_prediction": final_prediction,
            "recommendation": final_recommendation,
            "confidence": float(confidence),
            "probabilities": {
                "up": float(avg_up_prob),
                "down": float(avg_down_prob)
            },
            "consensus": f"{up_votes}/{total_votes} models predict UP",
            "interpretation": self.interpret_prediction(final_prediction, confidence)
        }
    
    def calculate_model_agreement(self, predictions: Dict) -> str:
        """
        حساب مستوى اتفاق النماذج
        """
        votes = list(predictions.values())
        agreement_score = max(votes.count(0), votes.count(1)) / len(votes)
        
        if agreement_score >= 0.8:
            return "إجماع قوي"
        elif agreement_score >= 0.6:
            return "اتفاق معتدل"
        else:
            return "آراء متضاربة"
    
    def analyze_current_features(self, current_features: pd.Series) -> Dict[str, str]:
        """
        تحليل الميزات الحالية
        """
        analysis = {}
        
        # تحليل RSI
        rsi = current_features.get('rsi', 50)
        if pd.isna(rsi):
            rsi = 50
        
        if rsi > 70:
            analysis['rsi_signal'] = "ذروة شراء"
        elif rsi < 30:
            analysis['rsi_signal'] = "ذروة بيع"
        else:
            analysis['rsi_signal'] = "متوازن"
        
        # تحليل MACD
        macd = current_features.get('macd', 0)
        macd_signal = current_features.get('macd_signal', 0)
        if pd.isna(macd) or pd.isna(macd_signal):
            analysis['macd_signal'] = "غير متاح"
        elif macd > macd_signal:
            analysis['macd_signal'] = "إيجابي"
        else:
            analysis['macd_signal'] = "سلبي"
        
        # تحليل Bollinger Bands
        bb_position = current_features.get('bb_position', 0.5)
        if pd.isna(bb_position):
            bb_position = 0.5
            
        if bb_position > 0.8:
            analysis['bb_signal'] = "قرب الحد العلوي"
        elif bb_position < 0.2:
            analysis['bb_signal'] = "قرب الحد السفلي"
        else:
            analysis['bb_signal'] = "في النطاق الطبيعي"
        
        # تحليل الاتجاه
        ma_ratio = current_features.get('ma_ratio_5_20', 1)
        if pd.isna(ma_ratio):
            ma_ratio = 1
            
        if ma_ratio > 1.02:
            analysis['trend_signal'] = "اتجاه صاعد قوي"
        elif ma_ratio < 0.98:
            analysis['trend_signal'] = "اتجاه هابط قوي"
        else:
            analysis['trend_signal'] = "اتجاه جانبي"
        
        return analysis
    
    def interpret_prediction(self, prediction: str, confidence: float) -> str:
        """
        تفسير التنبؤ
        """
        direction = "صاعد" if prediction == "UP" else "هابط"
        
        if confidence > 80:
            strength = "قوي جداً"
        elif confidence > 65:
            strength = "قوي"
        elif confidence > 55:
            strength = "متوسط"
        else:
            strength = "ضعيف"
        
        return f"اتجاه {direction} بثقة {strength} ({confidence:.1f}%)"
    
    def calculate_feature_importance(self, feature_names: List[str]):
        """
        حساب أهمية الميزات
        """
        self.feature_importance = {}
        
        for name, model in self.models.items():
            if hasattr(model, 'feature_importances_'):
                importance_dict = dict(zip(feature_names, model.feature_importances_))
                self.feature_importance[name] = importance_dict
    
    def get_top_features(self, n: int = 5) -> List[str]:
        """
        الحصول على أهم الميزات
        """
        if not self.feature_importance:
            return []
        
        # حساب متوسط الأهمية عبر جميع النماذج
        all_features = {}
        for model_features in self.feature_importance.values():
            for feature, importance in model_features.items():
                if feature not in all_features:
                    all_features[feature] = []
                all_features[feature].append(importance)
        
        # حساب المتوسط
        avg_importance = {
            feature: np.mean(importances) 
            for feature, importances in all_features.items()
        }
        
        # ترتيب حسب الأهمية
        sorted_features = sorted(avg_importance.items(), key=lambda x: x[1], reverse=True)
        
        return [feature for feature, _ in sorted_features[:n]]
    
    def get_performance_level(self, accuracy: float) -> str:
        """
        تحديد مستوى الأداء
        """
        if accuracy > 0.75:
            return "ممتاز"
        elif accuracy > 0.65:
            return "جيد جداً"
        elif accuracy > 0.55:
            return "جيد"
        elif accuracy > 0.45:
            return "مقبول"
        else:
            return "ضعيف"
    
    def save_ensemble(self):
        """
        حفظ مجموعة النماذج
        """
        try:
            for name, model in self.models.items():
                model_path = f"{self.model_path}advanced_{name}.pkl"
                joblib.dump(model, model_path)
            
            # حفظ scaler
            scaler_path = f"{self.model_path}advanced_scaler.pkl"
            joblib.dump(self.scaler, scaler_path)
            
            # حفظ أهمية الميزات
            if self.feature_importance:
                joblib.dump(self.feature_importance, f"{self.model_path}feature_importance.pkl")
        except Exception as e:
            print(f"خطأ في حفظ النماذج: {e}")
    
    def load_ensemble(self):
        """
        تحميل النماذج المحفوظة
        """
        try:
            loaded_models = 0
            for name in self.models.keys():
                model_path = f"{self.model_path}advanced_{name}.pkl"
                if os.path.exists(model_path):
                    self.models[name] = joblib.load(model_path)
                    loaded_models += 1
            
            scaler_path = f"{self.model_path}advanced_scaler.pkl"
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            # تحميل أهمية الميزات
            importance_path = f"{self.model_path}feature_importance.pkl"
            if os.path.exists(importance_path):
                self.feature_importance = joblib.load(importance_path)
            
            if loaded_models > 0:
                self.is_trained = True
                return {"model_loaded": True, "models_count": loaded_models}
            else:
                return {"model_loaded": False, "error": "لا توجد نماذج محفوظة"}
                
        except Exception as e:
            return {"error": f"فشل تحميل النماذج: {str(e)}"}

# إنشاء instance عام
advanced_ai = AdvancedAI()
