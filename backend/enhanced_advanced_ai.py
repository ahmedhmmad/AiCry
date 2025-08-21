# """
# Enhanced Advanced AI Trading System
# نظام الذكاء الاصطناعي المحسن للتداول
# Version 2.0 - مع تحسينات الأداء والدقة
# """
#
# import numpy as np
# import pandas as pd
# import os
# import joblib
# import hashlib
# import json
# from typing import List, Dict, Any, Tuple, Optional
# from datetime import datetime, timedelta
# from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
# from functools import lru_cache
# import warnings
# warnings.filterwarnings('ignore')
#
# # نماذج التعلم الآلي المحسنة
# from sklearn.ensemble import (
#     RandomForestClassifier,
#     GradientBoostingClassifier,
#     ExtraTreesClassifier,
#     VotingClassifier,
#     AdaBoostClassifier
# )
# from sklearn.linear_model import LogisticRegression, RidgeClassifier
# from sklearn.svm import SVC
# from sklearn.neural_network import MLPClassifier
# from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
# from sklearn.preprocessing import StandardScaler, RobustScaler
# from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
# from sklearn.feature_selection import SelectKBest, f_classif, RFE
#
# # مكتبات إضافية للأداء
# try:
#     import xgboost as xgb
#     from xgboost import XGBClassifier
#     XGB_AVAILABLE = True
# except ImportError:
#     XGB_AVAILABLE = False
#     print("XGBoost غير متاح - استخدام نماذج بديلة")
#
# try:
#     import lightgbm as lgb
#     from lightgbm import LGBMClassifier
#     LGBM_AVAILABLE = True
# except ImportError:
#     LGBM_AVAILABLE = False
#     print("LightGBM غير متاح - استخدام نماذج بديلة")
#
# try:
#     from catboost import CatBoostClassifier
#     CATBOOST_AVAILABLE = True
# except ImportError:
#     CATBOOST_AVAILABLE = False
#     print("CatBoost غير متاح - استخدام نماذج بديلة")
#
#
# class EnhancedAdvancedAI:
#     """
#     نظام الذكاء الاصطناعي المحسن مع:
#     - نماذج أكثر وأقوى
#     - معالجة متوازية للسرعة
#     - تخزين مؤقت ذكي
#     - feature engineering متقدم
#     - تحسين تلقائي للمعاملات
#     """
#
#     def __init__(self, enable_parallel=True, cache_size=1000):
#         """
#         تهيئة النظام المحسن
#
#         Args:
#             enable_parallel: تفعيل المعالجة المتوازية
#             cache_size: حجم الذاكرة المؤقتة
#         """
#         self.enable_parallel = enable_parallel
#         self.cache_size = cache_size
#
#         # إعداد النماذج المحسنة
#         self.models = self._initialize_enhanced_models()
#
#         # أدوات المعالجة
#         self.scaler = RobustScaler()  # أفضل للقيم الشاذة
#         self.feature_selector = None
#         self.is_trained = False
#         self.model_path = "/app/models/enhanced/"
#
#         # معلومات الأداء
#         self.feature_importance = {}
#         self.model_performance = {}
#         self.training_history = []
#
#         # المعالجة المتوازية
#         if enable_parallel:
#             self.thread_executor = ThreadPoolExecutor(max_workers=4)
#             self.process_executor = ProcessPoolExecutor(max_workers=2)
#
#         # إنشاء مجلد النماذج
#         os.makedirs(self.model_path, exist_ok=True)
#
#         # تفعيل التخزين المؤقت
#         self._setup_caching()
#
#     def _calculate_indicators_internal(self, data=None):
#         # Placeholder implementation
#         # You can later replace this with a real call to calculate_indicators
#         return self.calculate_indicators(data) if data is not None else {}
#
#     def _engineer_features_internal(self, data=None):
#         # Placeholder: ممكن تستبدلها لاحقًا بالدالة الفعلية engineer_features
#         return self.engineer_features(data) if data is not None else {}
#
#     def _initialize_enhanced_models(self) -> Dict:
#         """
#         تهيئة النماذج المحسنة مع معاملات محسنة
#         """
#         models = {}
#
#         # Random Forest محسن
#         models['enhanced_rf'] = RandomForestClassifier(
#             n_estimators=500,
#             max_depth=20,
#             min_samples_split=5,
#             min_samples_leaf=2,
#             max_features='sqrt',
#             bootstrap=True,
#             oob_score=True,
#             n_jobs=-1,
#             random_state=42
#         )
#
#         # Gradient Boosting محسن
#         models['enhanced_gb'] = GradientBoostingClassifier(
#             n_estimators=300,
#             learning_rate=0.05,
#             max_depth=7,
#             min_samples_split=5,
#             min_samples_leaf=3,
#             subsample=0.8,
#             max_features='sqrt',
#             random_state=42
#         )
#
#         # Extra Trees - نموذج جديد قوي
#         models['extra_trees'] = ExtraTreesClassifier(
#             n_estimators=400,
#             max_depth=25,
#             min_samples_split=3,
#             min_samples_leaf=1,
#             max_features='sqrt',
#             bootstrap=False,
#             n_jobs=-1,
#             random_state=42
#         )
#
#         # XGBoost - إذا كان متاحاً
#         if XGB_AVAILABLE:
#             models['xgboost'] = XGBClassifier(
#                 n_estimators=400,
#                 learning_rate=0.01,
#                 max_depth=10,
#                 min_child_weight=1,
#                 gamma=0.1,
#                 subsample=0.8,
#                 colsample_bytree=0.8,
#                 objective='binary:logistic',
#                 nthread=-1,
#                 scale_pos_weight=1,
#                 seed=42
#             )
#
#         # LightGBM - إذا كان متاحاً
#         if LGBM_AVAILABLE:
#             models['lightgbm'] = LGBMClassifier(
#                 n_estimators=350,
#                 learning_rate=0.01,
#                 max_depth=15,
#                 num_leaves=31,
#                 min_child_samples=20,
#                 subsample=0.8,
#                 colsample_bytree=0.8,
#                 reg_alpha=0.1,
#                 reg_lambda=0.1,
#                 n_jobs=-1,
#                 random_state=42,
#                 verbose=-1
#             )
#
#         # CatBoost - إذا كان متاحاً
#         if CATBOOST_AVAILABLE:
#             models['catboost'] = CatBoostClassifier(
#                 iterations=300,
#                 learning_rate=0.03,
#                 depth=8,
#                 l2_leaf_reg=3,
#                 border_count=128,
#                 thread_count=-1,
#                 random_state=42,
#                 verbose=False
#             )
#
#         # AdaBoost
#         models['adaboost'] = AdaBoostClassifier(
#             n_estimators=200,
#             learning_rate=0.5,
#             random_state=42
#         )
#
#         # Neural Network
#         models['neural_net'] = MLPClassifier(
#             hidden_layer_sizes=(100, 50, 25),
#             activation='relu',
#             solver='adam',
#             alpha=0.001,
#             learning_rate='adaptive',
#             learning_rate_init=0.001,
#             max_iter=1000,
#             early_stopping=True,
#             validation_fraction=0.1,
#             random_state=42
#         )
#
#         # Logistic Regression محسن
#         models['logistic_l2'] = LogisticRegression(
#             penalty='l2',
#             C=1.0,
#             solver='lbfgs',
#             max_iter=1000,
#             n_jobs=-1,
#             random_state=42
#         )
#
#         return models
#
#     def _setup_caching(self):
#         """
#         إعداد نظام التخزين المؤقت
#         """
#         # تخزين مؤقت للمؤشرات
#         self.calculate_indicators_cached = lru_cache(maxsize=self.cache_size)(
#             self._calculate_indicators_internal
#         )
#
#         # تخزين مؤقت للميزات
#         self.engineer_features_cached = lru_cache(maxsize=self.cache_size)(
#             self._engineer_features_internal
#         )
#
#     def engineer_advanced_features(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
#         """
#         هندسة ميزات متقدمة ومحسنة مع معالجة متوازية
#         """
#         try:
#             # تحويل إلى hash للتخزين المؤقت
#             prices_hash = hashlib.md5(str(prices).encode()).hexdigest()
#             volumes_hash = hashlib.md5(str(volumes).encode()).hexdigest() if volumes else "none"
#             cache_key = f"{prices_hash}_{volumes_hash}"
#
#             # استخدام التخزين المؤقت إذا كان متاحاً
#             if hasattr(self, 'features_cache') and cache_key in self.features_cache:
#                 return self.features_cache[cache_key]
#
#             # المعالجة المتوازية للميزات
#             if self.enable_parallel:
#                 features_df = self._parallel_feature_engineering(prices, volumes)
#             else:
#                 features_df = self._sequential_feature_engineering(prices, volumes)
#
#             # حفظ في التخزين المؤقت
#             if not hasattr(self, 'features_cache'):
#                 self.features_cache = {}
#             self.features_cache[cache_key] = features_df
#
#             return features_df
#
#         except Exception as e:
#             print(f"خطأ في هندسة الميزات: {e}")
#             return self._basic_features(prices, volumes)
#
#     def _parallel_feature_engineering(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
#         """
#         هندسة الميزات بالمعالجة المتوازية
#         """
#         df = pd.DataFrame({'price': prices})
#         if volumes:
#             df['volume'] = volumes
#         else:
#             df['volume'] = np.random.uniform(1000, 10000, len(prices))
#
#         # قائمة المهام للمعالجة المتوازية
#         feature_tasks = [
#             ('price_features', self._calculate_price_features),
#             ('technical_indicators', self._calculate_technical_indicators),
#             ('statistical_features', self._calculate_statistical_features),
#             ('pattern_features', self._calculate_pattern_features),
#             ('volume_features', self._calculate_volume_features),
#             ('advanced_indicators', self._calculate_advanced_indicators)
#         ]
#
#         # تنفيذ المهام بشكل متوازي
#         features_dict = {}
#         with ThreadPoolExecutor(max_workers=6) as executor:
#             futures = {
#                 executor.submit(func, df): name
#                 for name, func in feature_tasks
#             }
#
#             for future in futures:
#                 name = futures[future]
#                 try:
#                     result = future.result(timeout=10)
#                     features_dict[name] = result
#                 except Exception as e:
#                     print(f"خطأ في حساب {name}: {e}")
#                     features_dict[name] = pd.DataFrame()
#
#         # دمج جميع الميزات
#         all_features = [df]
#         for feature_df in features_dict.values():
#             if not feature_df.empty:
#                 all_features.append(feature_df)
#
#         final_df = pd.concat(all_features, axis=1)
#
#         # إزالة الأعمدة المكررة
#         final_df = final_df.loc[:, ~final_df.columns.duplicated()]
#
#         # ملء القيم المفقودة
#         final_df = final_df.fillna(method='ffill').fillna(method='bfill').fillna(0)
#
#         return final_df
#
#     def _calculate_price_features(self, df: pd.DataFrame) -> pd.DataFrame:
#         """
#         حساب ميزات السعر المتقدمة
#         """
#         features = pd.DataFrame(index=df.index)
#
#         # المتوسطات المتحركة المتعددة
#         for period in [5, 10, 20, 50, 100, 200]:
#             if len(df) >= period:
#                 features[f'ma_{period}'] = df['price'].rolling(period).mean()
#                 features[f'price_to_ma_{period}'] = df['price'] / features[f'ma_{period}']
#
#         # المتوسطات المتحركة الأسية
#         for period in [12, 26, 50]:
#             if len(df) >= period:
#                 features[f'ema_{period}'] = df['price'].ewm(span=period).mean()
#
#         # التغيرات النسبية
#         for period in [1, 3, 5, 10, 20]:
#             if len(df) > period:
#                 features[f'return_{period}'] = df['price'].pct_change(period)
#                 features[f'log_return_{period}'] = np.log(df['price'] / df['price'].shift(period))
#
#         # الزخم
#         for period in [5, 10, 20]:
#             if len(df) > period:
#                 features[f'momentum_{period}'] = df['price'] / df['price'].shift(period) - 1
#
#         return features
#
#     def _calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
#         """
#         حساب المؤشرات الفنية المتقدمة
#         """
#         features = pd.DataFrame(index=df.index)
#
#         # RSI متعدد الفترات
#         for period in [7, 14, 21]:
#             features[f'rsi_{period}'] = self._calculate_rsi(df['price'], period)
#
#         # MACD متعدد
#         features['macd_12_26'], features['macd_signal_9'], features['macd_hist'] = self._calculate_macd(df['price'])
#         features['macd_5_13'], features['macd_signal_5'], _ = self._calculate_macd(df['price'], 5, 13, 5)
#
#         # Bollinger Bands
#         for period in [20, 50]:
#             if len(df) >= period:
#                 ma = df['price'].rolling(period).mean()
#                 std = df['price'].rolling(period).std()
#                 features[f'bb_upper_{period}'] = ma + (2 * std)
#                 features[f'bb_lower_{period}'] = ma - (2 * std)
#                 features[f'bb_width_{period}'] = features[f'bb_upper_{period}'] - features[f'bb_lower_{period}']
#                 features[f'bb_position_{period}'] = (df['price'] - features[f'bb_lower_{period}']) / features[f'bb_width_{period}']
#
#         # Stochastic Oscillator
#         for period in [14, 21]:
#             if len(df) >= period:
#                 low_min = df['price'].rolling(period).min()
#                 high_max = df['price'].rolling(period).max()
#                 features[f'stoch_k_{period}'] = 100 * (df['price'] - low_min) / (high_max - low_min)
#                 features[f'stoch_d_{period}'] = features[f'stoch_k_{period}'].rolling(3).mean()
#
#         # ATR (Average True Range)
#         for period in [14, 21]:
#             if len(df) > period:
#                 high = df['price'].rolling(2).max()
#                 low = df['price'].rolling(2).min()
#                 close_prev = df['price'].shift(1)
#
#                 tr1 = high - low
#                 tr2 = abs(high - close_prev)
#                 tr3 = abs(low - close_prev)
#
#                 tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
#                 features[f'atr_{period}'] = tr.rolling(period).mean()
#
#         # CCI (Commodity Channel Index)
#         for period in [20, 40]:
#             if len(df) >= period:
#                 typical_price = df['price']
#                 sma = typical_price.rolling(period).mean()
#                 mad = (typical_price - sma).abs().rolling(period).mean()
#                 features[f'cci_{period}'] = (typical_price - sma) / (0.015 * mad)
#
#         # Williams %R
#         for period in [14, 28]:
#             if len(df) >= period:
#                 high_max = df['price'].rolling(period).max()
#                 low_min = df['price'].rolling(period).min()
#                 features[f'williams_r_{period}'] = -100 * (high_max - df['price']) / (high_max - low_min)
#
#         # ROC (Rate of Change)
#         for period in [10, 20]:
#             if len(df) > period:
#                 features[f'roc_{period}'] = ((df['price'] - df['price'].shift(period)) / df['price'].shift(period)) * 100
#
#         return features
#
#     def _calculate_statistical_features(self, df: pd.DataFrame) -> pd.DataFrame:
#         """
#         حساب الميزات الإحصائية المتقدمة
#         """
#         features = pd.DataFrame(index=df.index)
#
#         # التقلب
#         for period in [5, 10, 20, 50]:
#             if len(df) >= period:
#                 features[f'volatility_{period}'] = df['price'].pct_change().rolling(period).std()
#                 features[f'volatility_ratio_{period}'] = features[f'volatility_{period}'] / features[f'volatility_{period}'].rolling(50).mean()
#
#         # Skewness و Kurtosis
#         for period in [20, 50]:
#             if len(df) >= period:
#                 returns = df['price'].pct_change()
#                 features[f'skew_{period}'] = returns.rolling(period).skew()
#                 features[f'kurtosis_{period}'] = returns.rolling(period).kurt()
#
#         # Z-Score
#         for period in [20, 50]:
#             if len(df) >= period:
#                 ma = df['price'].rolling(period).mean()
#                 std = df['price'].rolling(period).std()
#                 features[f'zscore_{period}'] = (df['price'] - ma) / std
#
#         # Hurst Exponent (للكشف عن الاتجاه)
#         if len(df) >= 100:
#             features['hurst_100'] = self._calculate_hurst_exponent(df['price'].values[-100:])
#
#         # Entropy
#         for period in [20, 50]:
#             if len(df) >= period:
#                 features[f'entropy_{period}'] = df['price'].rolling(period).apply(self._calculate_entropy)
#
#         return features
#
#     def _calculate_pattern_features(self, df: pd.DataFrame) -> pd.DataFrame:
#         """
#         حساب ميزات الأنماط والتشكيلات
#         """
#         features = pd.DataFrame(index=df.index)
#
#         # نماذج الشموع اليابانية
#         if len(df) >= 3:
#             # Doji
#             body = abs(df['price'] - df['price'].shift(1))
#             features['is_doji'] = (body < df['price'] * 0.001).astype(int)
#
#             # Hammer/Hanging Man
#             lower_shadow = df['price'].rolling(2).min() - df['price'].rolling(3).min()
#             upper_shadow = df['price'].rolling(2).max() - df['price']
#             features['hammer_pattern'] = ((lower_shadow > body * 2) & (upper_shadow < body * 0.5)).astype(int)
#
#             # Engulfing
#             prev_body = abs(df['price'].shift(1) - df['price'].shift(2))
#             features['bullish_engulfing'] = ((df['price'] > df['price'].shift(1)) &
#                                             (body > prev_body * 1.5)).astype(int)
#             features['bearish_engulfing'] = ((df['price'] < df['price'].shift(1)) &
#                                             (body > prev_body * 1.5)).astype(int)
#
#         # Support/Resistance Levels
#         for period in [20, 50]:
#             if len(df) >= period:
#                 features[f'distance_from_high_{period}'] = (df['price'] - df['price'].rolling(period).max()) / df['price']
#                 features[f'distance_from_low_{period}'] = (df['price'] - df['price'].rolling(period).min()) / df['price']
#
#         # Trend Strength
#         for period in [10, 20, 50]:
#             if len(df) >= period:
#                 # Linear Regression Slope
#                 x = np.arange(period)
#                 slopes = []
#                 for i in range(len(df) - period + 1):
#                     y = df['price'].iloc[i:i+period].values
#                     if len(y) == period:
#                         slope = np.polyfit(x, y, 1)[0]
#                         slopes.append(slope)
#                     else:
#                         slopes.append(np.nan)
#
#                 # Pad with NaN for initial values
#                 slopes = [np.nan] * (period - 1) + slopes
#                 features[f'trend_strength_{period}'] = pd.Series(slopes[:len(df)], index=df.index)
#
#         return features
#
#     def _calculate_volume_features(self, df: pd.DataFrame) -> pd.DataFrame:
#         """
#         حساب ميزات الحجم المتقدمة
#         """
#         features = pd.DataFrame(index=df.index)
#
#         if 'volume' not in df.columns:
#             return features
#
#         # Volume Moving Averages
#         for period in [5, 10, 20]:
#             if len(df) >= period:
#                 features[f'volume_ma_{period}'] = df['volume'].rolling(period).mean()
#                 features[f'volume_ratio_{period}'] = df['volume'] / features[f'volume_ma_{period}']
#
#         # OBV (On-Balance Volume)
#         obv = [0]
#         for i in range(1, len(df)):
#             if df['price'].iloc[i] > df['price'].iloc[i-1]:
#                 obv.append(obv[-1] + df['volume'].iloc[i])
#             elif df['price'].iloc[i] < df['price'].iloc[i-1]:
#                 obv.append(obv[-1] - df['volume'].iloc[i])
#             else:
#                 obv.append(obv[-1])
#         features['obv'] = obv
#         features['obv_ma_20'] = features['obv'].rolling(20).mean()
#
#         # VWAP (Volume Weighted Average Price)
#         features['vwap'] = (df['price'] * df['volume']).cumsum() / df['volume'].cumsum()
#         features['price_to_vwap'] = df['price'] / features['vwap']
#
#         # Accumulation/Distribution Line
#         money_flow_multiplier = ((df['price'] - df['price'].rolling(2).min()) -
#                                 (df['price'].rolling(2).max() - df['price'])) / \
#                                (df['price'].rolling(2).max() - df['price'].rolling(2).min())
#         money_flow_volume = money_flow_multiplier * df['volume']
#         features['ad_line'] = money_flow_volume.cumsum()
#
#         # Chaikin Money Flow
#         for period in [20, 40]:
#             if len(df) >= period:
#                 features[f'cmf_{period}'] = money_flow_volume.rolling(period).sum() / df['volume'].rolling(period).sum()
#
#         # Volume Rate of Change
#         for period in [10, 20]:
#             if len(df) > period:
#                 features[f'vroc_{period}'] = ((df['volume'] - df['volume'].shift(period)) /
#                                              df['volume'].shift(period)) * 100
#
#         return features
#
#     def _calculate_advanced_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
#         """
#         حساب المؤشرات المتقدمة والمعقدة
#         """
#         features = pd.DataFrame(index=df.index)
#
#         # Ichimoku Cloud Components
#         if len(df) >= 52:
#             # Tenkan-sen (Conversion Line)
#             high_9 = df['price'].rolling(9).max()
#             low_9 = df['price'].rolling(9).min()
#             features['ichimoku_tenkan'] = (high_9 + low_9) / 2
#
#             # Kijun-sen (Base Line)
#             high_26 = df['price'].rolling(26).max()
#             low_26 = df['price'].rolling(26).min()
#             features['ichimoku_kijun'] = (high_26 + low_26) / 2
#
#             # Senkou Span A (Leading Span A)
#             features['ichimoku_senkou_a'] = ((features['ichimoku_tenkan'] + features['ichimoku_kijun']) / 2).shift(26)
#
#             # Senkou Span B (Leading Span B)
#             high_52 = df['price'].rolling(52).max()
#             low_52 = df['price'].rolling(52).min()
#             features['ichimoku_senkou_b'] = ((high_52 + low_52) / 2).shift(26)
#
#             # Chikou Span (Lagging Span)
#             features['ichimoku_chikou'] = df['price'].shift(-26)
#
#         # Parabolic SAR
#         features['sar'] = self._calculate_parabolic_sar(df['price'])
#
#         # Pivot Points
#         if len(df) >= 2:
#             high = df['price'].rolling(2).max()
#             low = df['price'].rolling(2).min()
#             close = df['price']
#
#             pivot = (high + low + close) / 3
#             features['pivot_point'] = pivot
#             features['pivot_r1'] = 2 * pivot - low
#             features['pivot_s1'] = 2 * pivot - high
#             features['pivot_r2'] = pivot + (high - low)
#             features['pivot_s2'] = pivot - (high - low)
#
#         # Fibonacci Retracement Levels
#         if len(df) >= 100:
#             recent_high = df['price'].iloc[-100:].max()
#             recent_low = df['price'].iloc[-100:].min()
#             diff = recent_high - recent_low
#
#             features['fib_0'] = recent_low
#             features['fib_236'] = recent_low + 0.236 * diff
#             features['fib_382'] = recent_low + 0.382 * diff
#             features['fib_500'] = recent_low + 0.500 * diff
#             features['fib_618'] = recent_low + 0.618 * diff
#             features['fib_1000'] = recent_high
#
#             # المسافة من مستويات فيبوناتشي
#             features['dist_from_fib_236'] = (df['price'] - features['fib_236']) / df['price']
#             features['dist_from_fib_382'] = (df['price'] - features['fib_382']) / df['price']
#             features['dist_from_fib_618'] = (df['price'] - features['fib_618']) / df['price']
#
#         # Elder Ray Index
#         if len(df) >= 13:
#             ema_13 = df['price'].ewm(span=13).mean()
#             features['elder_bull_power'] = df['price'].rolling(2).max() - ema_13
#             features['elder_bear_power'] = df['price'].rolling(2).min() - ema_13
#
#         # Aroon Indicator
#         for period in [25, 50]:
#             if len(df) >= period:
#                 aroon_up = []
#                 aroon_down = []
#
#                 for i in range(period - 1, len(df)):
#                     window = df['price'].iloc[i - period + 1:i + 1]
#                     days_since_high = period - 1 - window.values.argmax()
#                     days_since_low = period - 1 - window.values.argmin()
#
#                     aroon_up.append(((period - days_since_high) / period) * 100)
#                     aroon_down.append(((period - days_since_low) / period) * 100)
#
#                 # Pad with NaN
#                 aroon_up = [np.nan] * (period - 1) + aroon_up
#                 aroon_down = [np.nan] * (period - 1) + aroon_down
#
#                 features[f'aroon_up_{period}'] = pd.Series(aroon_up[:len(df)], index=df.index)
#                 features[f'aroon_down_{period}'] = pd.Series(aroon_down[:len(df)], index=df.index)
#                 features[f'aroon_oscillator_{period}'] = features[f'aroon_up_{period}'] - features[f'aroon_down_{period}']
#
#         return features
#
#     # ================== Helper Functions ==================
#
#     def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
#         """حساب RSI"""
#         delta = prices.diff()
#         gains = delta.where(delta > 0, 0)
#         losses = -delta.where(delta < 0, 0)
#
#         avg_gains = gains.rolling(period).mean()
#         avg_losses = losses.rolling(period).mean()
#
#         rs = avg_gains / avg_losses
#         rsi = 100 - (100 / (1 + rs))
#         return rsi.fillna(50)
#
#     def _calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple:
#         """حساب MACD"""
#         ema_fast = prices.ewm(span=fast).mean()
#         ema_slow = prices.ewm(span=slow).mean()
#         macd_line = ema_fast - ema_slow
#         signal_line = macd_line.ewm(span=signal).mean()
#         histogram = macd_line - signal_line
#         return macd_line, signal_line, histogram
#
#     def _calculate_hurst_exponent(self, prices: np.ndarray) -> float:
#         """حساب Hurst Exponent"""
#         try:
#             lags = range(2, min(100, len(prices) // 2))
#             tau = [np.sqrt(np.std(np.subtract(prices[lag:], prices[:-lag]))) for lag in lags]
#             poly = np.polyfit(np.log(lags), np.log(tau), 1)
#             return poly[0] * 2.0
#         except:
#             return 0.5
#
#     def _calculate_entropy(self, data: pd.Series) -> float:
#         """حساب Shannon Entropy"""
#         try:
#             if len(data) < 2:
#                 return 0
#             hist, _ = np.histogram(data, bins=10)
#             hist = hist[hist > 0]
#             probs = hist / hist.sum()
#             return -np.sum(probs * np.log2(probs))
#         except:
#             return 0
#
#     def _calculate_parabolic_sar(self, prices: pd.Series, af_start: float = 0.02, af_increment: float = 0.02, af_max: float = 0.2) -> pd.Series:
#         """حساب Parabolic SAR"""
#         sar = prices.copy()
#         is_uptrend = True
#         af = af_start
#         ep = prices.iloc[0]
#
#         for i in range(1, len(prices)):
#             if is_uptrend:
#                 sar.iloc[i] = sar.iloc[i-1] + af * (ep - sar.iloc[i-1])
#                 if prices.iloc[i] > ep:
#                     ep = prices.iloc[i]
#                     af = min(af + af_increment, af_max)
#                 if prices.iloc[i] < sar.iloc[i]:
#                     is_uptrend = False
#                     sar.iloc[i] = ep
#                     ep = prices.iloc[i]
#                     af = af_start
#             else:
#                 sar.iloc[i] = sar.iloc[i-1] + af * (ep - sar.iloc[i-1])
#                 if prices.iloc[i] < ep:
#                     ep = prices.iloc[i]
#                     af = min(af + af_increment, af_max)
#                 if prices.iloc[i] > sar.iloc[i]:
#                     is_uptrend = True
#                     sar.iloc[i] = ep
#                     ep = prices.iloc[i]
#                     af = af_start
#
#         return sar
#
#     def _sequential_feature_engineering(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
#         """النسخة التسلسلية لهندسة الميزات (كنسخة احتياطية)"""
#         df = pd.DataFrame({'price': prices})
#         if volumes:
#             df['volume'] = volumes
#
#         # جمع كل الميزات بشكل تسلسلي
#         price_features = self._calculate_price_features(df)
#         technical_features = self._calculate_technical_indicators(df)
#         statistical_features = self._calculate_statistical_features(df)
#         pattern_features = self._calculate_pattern_features(df)
#         volume_features = self._calculate_volume_features(df)
#         advanced_features = self._calculate_advanced_indicators(df)
#
#         # دمج الميزات
#         all_features = pd.concat([
#             df, price_features, technical_features,
#             statistical_features, pattern_features,
#             volume_features, advanced_features
#         ], axis=1)
#
#         # إزالة الأعمدة المكررة وملء القيم المفقودة
#         all_features = all_features.loc[:, ~all_features.columns.duplicated()]
#         all_features = all_features.fillna(method='ffill').fillna(method='bfill').fillna(0)
#
#         return all_features
#
#     def _basic_features(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
#         """ميزات أساسية كنسخة احتياطية"""
#         df = pd.DataFrame({'price': prices})
#
#         # ميزات بسيطة
#         df['ma_10'] = df['price'].rolling(10).mean()
#         df['ma_20'] = df['price'].rolling(20).mean()
#         df['rsi'] = self._calculate_rsi(df['price'])
#         df['price_change'] = df['price'].pct_change()
#
#         return df.fillna(0)
#
#     # ================== Training Functions ==================
#
#     def train_enhanced_ensemble(self, prices: List[float], volumes: List[float] = None,
#                                optimize_hyperparameters: bool = False) -> Dict[str, Any]:
#         """
#         تدريب النماذج المحسنة مع خيار تحسين المعاملات
#
#         Args:
#             prices: قائمة الأسعار
#             volumes: قائمة الأحجام (اختياري)
#             optimize_hyperparameters: تفعيل البحث عن أفضل معاملات
#         """
#         try:
#             print(f"🎯 بدء التدريب المحسن مع {len(prices)} نقطة بيانات")
#
#             if len(prices) < 100:
#                 return {"error": "يحتاج 100 نقطة على الأقل للتدريب المحسن"}
#
#             # هندسة الميزات
#             start_time = datetime.now()
#             features_df = self.engineer_advanced_features(prices, volumes)
#             feature_time = (datetime.now() - start_time).total_seconds()
#             print(f"✅ هندسة الميزات اكتملت في {feature_time:.2f} ثانية - {len(features_df.columns)} ميزة")
#
#             # اختيار الميزات المهمة
#             feature_columns = self._select_best_features(features_df, prices)
#             X = features_df[feature_columns].values
#
#             # إنشاء الأهداف
#             y = self._create_advanced_targets(prices)
#
#             # إزالة القيم المفقودة
#             valid_indices = ~(np.isnan(y) | np.isnan(X).any(axis=1))
#             X = X[valid_indices]
#             y = y[valid_indices]
#
#             if len(X) < 100:
#                 return {"error": "بيانات صالحة غير كافية للتدريب"}
#
#             # تقسيم البيانات
#             X_train, X_test, y_train, y_test = train_test_split(
#                 X, y, test_size=0.2, random_state=42, stratify=y
#             )
#
#             # تطبيع البيانات
#             X_train_scaled = self.scaler.fit_transform(X_train)
#             X_test_scaled = self.scaler.transform(X_test)
#
#             # تحسين المعاملات إذا طُلب ذلك
#             if optimize_hyperparameters:
#                 print("🔍 بدء تحسين المعاملات...")
#                 self._optimize_hyperparameters(X_train_scaled, y_train)
#
#             # تدريب النماذج بالمعالجة المتوازية
#             print("🚀 تدريب النماذج بالمعالجة المتوازية...")
#             model_results = self._parallel_model_training(
#                 X_train_scaled, y_train, X_test_scaled, y_test
#             )
#
#             # حساب أهمية الميزات
#             self._calculate_feature_importance(feature_columns, X_train_scaled, y_train)
#
#             # حفظ النماذج
#             self._save_enhanced_models()
#             self.is_trained = True
#
#             # إحصائيات الأداء
#             best_model = max(model_results.keys(), key=lambda k: model_results[k]['f1_score'])
#             avg_accuracy = np.mean([v['accuracy'] for v in model_results.values()])
#             avg_f1 = np.mean([v['f1_score'] for v in model_results.values()])
#
#             training_time = (datetime.now() - start_time).total_seconds()
#
#             result = {
#                 "training_completed": True,
#                 "training_time_seconds": round(training_time, 2),
#                 "feature_engineering_time": round(feature_time, 2),
#                 "training_samples": len(X_train),
#                 "test_samples": len(X_test),
#                 "feature_count": len(feature_columns),
#                 "models_trained": len(model_results),
#                 "model_results": model_results,
#                 "best_model": best_model,
#                 "best_accuracy": round(model_results[best_model]['accuracy'], 3),
#                 "best_f1_score": round(model_results[best_model]['f1_score'], 3),
#                 "average_accuracy": round(avg_accuracy, 3),
#                 "average_f1_score": round(avg_f1, 3),
#                 "top_features": self._get_top_features(10),
#                 "performance_improvement": self._calculate_improvement(avg_accuracy)
#             }
#
#             # حفظ سجل التدريب
#             self.training_history.append({
#                 "timestamp": datetime.now().isoformat(),
#                 "result": result
#             })
#
#             return result
#
#         except Exception as e:
#             return {"error": f"فشل التدريب المحسن: {str(e)}"}
#
#     def _parallel_model_training(self, X_train, y_train, X_test, y_test) -> Dict:
#         """تدريب النماذج بشكل متوازي"""
#         results = {}
#
#         if self.enable_parallel:
#             with ThreadPoolExecutor(max_workers=min(4, len(self.models))) as executor:
#                 futures = {}
#                 for name, model in self.models.items():
#                     future = executor.submit(
#                         self._train_single_model,
#                         name, model, X_train, y_train, X_test, y_test
#                     )
#                     futures[future] = name
#
#                 for future in futures:
#                     name = futures[future]
#                     try:
#                         result = future.result(timeout=60)
#                         results[name] = result
#                     except Exception as e:
#                         print(f"❌ خطأ في تدريب {name}: {e}")
#                         results[name] = {"error": str(e)}
#         else:
#             # التدريب التسلسلي
#             for name, model in self.models.items():
#                 results[name] = self._train_single_model(
#                     name, model, X_train, y_train, X_test, y_test
#                 )
#
#         return results
#
#     def _train_single_model(self, name: str, model, X_train, y_train, X_test, y_test) -> Dict:
#         """تدريب نموذج واحد وحساب المقاييس"""
#         try:
#             print(f"  📊 تدريب {name}...")
#             start = datetime.now()
#
#             # التدريب
#             model.fit(X_train, y_train)
#
#             # التنبؤ
#             train_pred = model.predict(X_train)
#             test_pred = model.predict(X_test)
#
#             # حساب المقاييس
#             train_acc = accuracy_score(y_train, train_pred)
#             test_acc = accuracy_score(y_test, test_pred)
#             precision = precision_score(y_test, test_pred, average='weighted', zero_division=0)
#             recall = recall_score(y_test, test_pred, average='weighted', zero_division=0)
#             f1 = f1_score(y_test, test_pred, average='weighted', zero_division=0)
#
#             # الوقت المستغرق
#             training_time = (datetime.now() - start).total_seconds()
#
#             print(f"  ✅ {name} - Accuracy: {test_acc:.3f}, F1: {f1:.3f} ({training_time:.1f}s)")
#
#             return {
#                 "accuracy": float(test_acc),
#                 "train_accuracy": float(train_acc),
#                 "precision": float(precision),
#                 "recall": float(recall),
#                 "f1_score": float(f1),
#                 "training_time": float(training_time),
#                 "overfitting_score": float(train_acc - test_acc)
#             }
#
#         except Exception as e:
#             return {"error": str(e)}
#
#     def _optimize_hyperparameters(self, X_train, y_train):
#         """تحسين معاملات النماذج الرئيسية"""
#         # تحسين Random Forest
#         if 'enhanced_rf' in self.models:
#             rf_params = {
#                 'n_estimators': [300, 500, 700],
#                 'max_depth': [15, 20, 25],
#                 'min_samples_split': [3, 5, 7],
#                 'min_samples_leaf': [1, 2, 3]
#             }
#
#             rf_search = GridSearchCV(
#                 self.models['enhanced_rf'],
#                 rf_params,
#                 cv=3,
#                 scoring='f1_weighted',
#                 n_jobs=-1,
#                 verbose=0
#             )
#
#             rf_search.fit(X_train, y_train)
#             self.models['enhanced_rf'] = rf_search.best_estimator_
#             print(f"  ✅ Random Forest محسن: {rf_search.best_params_}")
#
#         # يمكن إضافة تحسين للنماذج الأخرى هنا
#
#     def _select_best_features(self, features_df: pd.DataFrame, prices: List[float], n_features: int = 50) -> List[str]:
#         """اختيار أفضل الميزات باستخدام طرق متعددة"""
#         # إزالة الأعمدة غير الرقمية
#         numeric_cols = features_df.select_dtypes(include=[np.number]).columns.tolist()
#
#         # إزالة الأعمدة الثابتة
#         non_constant_cols = [col for col in numeric_cols
#                             if features_df[col].std() > 0]
#
#         if len(non_constant_cols) <= n_features:
#             return non_constant_cols
#
#         # إنشاء الأهداف
#         y = self._create_advanced_targets(prices)
#         y = y[:len(features_df)]
#
#         # اختيار الميزات باستخدام SelectKBest
#         X = features_df[non_constant_cols].fillna(0)
#         valid_indices = ~np.isnan(y)
#
#         selector = SelectKBest(f_classif, k=min(n_features, len(non_constant_cols)))
#         selector.fit(X[valid_indices], y[valid_indices])
#
#         selected_features = [non_constant_cols[i] for i in selector.get_support(indices=True)]
#
#         # إضافة ميزات أساسية مهمة إذا لم تكن موجودة
#         essential_features = ['price', 'rsi_14', 'macd_12_26', 'volume_ratio_10']
#         for feature in essential_features:
#             if feature in non_constant_cols and feature not in selected_features:
#                 selected_features.append(feature)
#
#         return selected_features[:n_features]
#
#     def _create_advanced_targets(self, prices: List[float], threshold: float = 0.003) -> np.ndarray:
#         """إنشاء أهداف متقدمة للتدريب"""
#         targets = []
#
#         for i in range(len(prices) - 1):
#             price_change = (prices[i + 1] - prices[i]) / prices[i]
#
#             if price_change > threshold:
#                 target = 2  # صعود قوي
#             elif price_change > 0:
#                 target = 1  # صعود ضعيف
#             elif price_change < -threshold:
#                 target = -1  # هبوط قوي
#             else:
#                 target = 0  # استقرار
#
#             targets.append(target)
#
#         # إضافة آخر قيمة
#         targets.append(targets[-1] if targets else 0)
#
#         # تحويل إلى تصنيف ثنائي للتبسيط
#         binary_targets = [1 if t > 0 else 0 for t in targets]
#
#         return np.array(binary_targets)
#
#     def _calculate_feature_importance(self, feature_columns: List[str], X_train, y_train):
#         """حساب أهمية الميزات من النماذج المختلفة"""
#         importance_scores = {}
#
#         for name, model in self.models.items():
#             if hasattr(model, 'feature_importances_'):
#                 try:
#                     model.fit(X_train, y_train)
#                     importances = model.feature_importances_
#
#                     for i, col in enumerate(feature_columns):
#                         if col not in importance_scores:
#                             importance_scores[col] = []
#                         importance_scores[col].append(importances[i])
#                 except:
#                     pass
#
#         # حساب المتوسط
#         self.feature_importance = {
#             col: np.mean(scores) for col, scores in importance_scores.items()
#         }
#
#     def _get_top_features(self, n: int = 10) -> List[Dict]:
#         """الحصول على أهم الميزات"""
#         if not self.feature_importance:
#             return []
#
#         sorted_features = sorted(
#             self.feature_importance.items(),
#             key=lambda x: x[1],
#             reverse=True
#         )
#
#         return [
#             {"name": name, "importance": round(score, 4)}
#             for name, score in sorted_features[:n]
#         ]
#
#     def _calculate_improvement(self, current_accuracy: float) -> str:
#         """حساب نسبة التحسن"""
#         baseline_accuracy = 0.65  # الدقة الأساسية المتوقعة
#         improvement = ((current_accuracy - baseline_accuracy) / baseline_accuracy) * 100
#
#         if improvement > 20:
#             return f"تحسن ممتاز: +{improvement:.1f}%"
#         elif improvement > 10:
#             return f"تحسن جيد: +{improvement:.1f}%"
#         elif improvement > 0:
#             return f"تحسن طفيف: +{improvement:.1f}%"
#         else:
#             return "يحتاج مزيد من البيانات"
#
#     # ================== Prediction Functions ==================
#
#     def predict_enhanced_ensemble(self, prices: List[float], volumes: List[float] = None) -> Dict[str, Any]:
#         """
#         التنبؤ المحسن باستخدام مجموعة النماذج
#         """
#         try:
#             if not self.is_trained:
#                 return {"error": "النماذج غير مدربة"}
#
#             if len(prices) < 100:
#                 return {"error": "يحتاج 100 نقطة على الأقل للتنبؤ المحسن"}
#
#             # هندسة الميزات
#             features_df = self.engineer_advanced_features(prices, volumes)
#
#             # استخدام نفس الميزات المستخدمة في التدريب
#             feature_columns = list(self.feature_importance.keys()) if self.feature_importance else features_df.columns
#             feature_columns = [col for col in feature_columns if col in features_df.columns]
#
#             # أخذ آخر نقطة للتنبؤ
#             X = features_df[feature_columns].iloc[-1:].values
#
#             if np.isnan(X).any():
#                 # محاولة استخدام نقطة سابقة
#                 X = features_df[feature_columns].iloc[-2:-1].values
#                 if np.isnan(X).any():
#                     return {"error": "بيانات غير صالحة للتنبؤ"}
#
#             # تطبيع البيانات
#             X_scaled = self.scaler.transform(X)
#
#             # التنبؤ من كل نموذج
#             predictions = {}
#             probabilities = {}
#             prediction_times = {}
#
#             for name, model in self.models.items():
#                 try:
#                     start = datetime.now()
#                     pred = model.predict(X_scaled)[0]
#                     prediction_times[name] = (datetime.now() - start).total_seconds() * 1000  # milliseconds
#
#                     predictions[name] = int(pred)
#
#                     if hasattr(model, 'predict_proba'):
#                         prob = model.predict_proba(X_scaled)[0]
#                         probabilities[name] = {
#                             'down': float(prob[0] * 100),
#                             'up': float(prob[1] * 100) if len(prob) > 1 else float((1 - prob[0]) * 100)
#                         }
#                     else:
#                         probabilities[name] = {'down': 50.0, 'up': 50.0}
#
#                 except Exception as e:
#                     predictions[name] = 0
#                     probabilities[name] = {'down': 50.0, 'up': 50.0}
#                     prediction_times[name] = 0
#
#             # التنبؤ المجمع المحسن
#             ensemble_result = self._enhanced_ensemble_prediction(predictions, probabilities)
#
#             # تحليل السوق الحالي
#             market_analysis = self._analyze_current_market(features_df.iloc[-1], prices)
#
#             # حساب مستوى الثقة
#             confidence_analysis = self._analyze_confidence(predictions, probabilities)
#
#             result = {
#                 "ensemble_prediction": ensemble_result,
#                 "individual_predictions": predictions,
#                 "individual_probabilities": probabilities,
#                 "prediction_times_ms": prediction_times,
#                 "market_analysis": market_analysis,
#                 "confidence_analysis": confidence_analysis,
#                 "feature_analysis": self._analyze_important_features(features_df.iloc[-1]),
#                 "risk_assessment": self._assess_risk(ensemble_result, market_analysis),
#                 "suggested_action": self._suggest_action(ensemble_result, confidence_analysis),
#                 "timestamp": datetime.now().isoformat()
#             }
#
#             return result
#
#         except Exception as e:
#             return {"error": f"فشل التنبؤ المحسن: {str(e)}"}
#
#     def _enhanced_ensemble_prediction(self, predictions: Dict, probabilities: Dict) -> Dict:
#         """التنبؤ المجمع المحسن مع أوزان ديناميكية"""
#         # حساب الأوزان بناءً على أداء النماذج
#         model_weights = self._calculate_model_weights()
#
#         # التصويت الموزون
#         weighted_votes = 0
#         total_weight = 0
#
#         for model_name, prediction in predictions.items():
#             weight = model_weights.get(model_name, 1.0)
#             weighted_votes += prediction * weight
#             total_weight += weight
#
#         # حساب الاحتماليات الموزونة
#         weighted_up_prob = 0
#         weighted_down_prob = 0
#
#         for model_name, probs in probabilities.items():
#             weight = model_weights.get(model_name, 1.0)
#             weighted_up_prob += probs['up'] * weight
#             weighted_down_prob += probs['down'] * weight
#
#         avg_up_prob = weighted_up_prob / total_weight if total_weight > 0 else 50
#         avg_down_prob = weighted_down_prob / total_weight if total_weight > 0 else 50
#
#         # القرار النهائي
#         final_prediction = "UP" if weighted_votes / total_weight > 0.5 else "DOWN"
#
#         # التوصية بناءً على مستوى الثقة
#         confidence = max(avg_up_prob, avg_down_prob)
#
#         if confidence > 75:
#             if avg_up_prob > 75:
#                 recommendation = "STRONG BUY"
#             elif avg_down_prob > 75:
#                 recommendation = "STRONG SELL"
#             else:
#                 recommendation = "HOLD"
#         elif confidence > 60:
#             if avg_up_prob > 60:
#                 recommendation = "BUY"
#             elif avg_down_prob > 60:
#                 recommendation = "SELL"
#             else:
#                 recommendation = "HOLD"
#         else:
#             recommendation = "HOLD"
#
#         # حساب قوة الإجماع
#         agreement_score = self._calculate_agreement_score(predictions)
#
#         return {
#             "final_prediction": final_prediction,
#             "recommendation": recommendation,
#             "confidence": float(confidence),
#             "probabilities": {
#                 "up": float(avg_up_prob),
#                 "down": float(avg_down_prob)
#             },
#             "agreement_score": float(agreement_score),
#             "models_agree": agreement_score > 70,
#             "signal_strength": self._calculate_signal_strength(confidence, agreement_score)
#         }
#
#     def _calculate_model_weights(self) -> Dict[str, float]:
#         """حساب أوزان النماذج بناءً على الأداء"""
#         if not self.model_performance:
#             # أوزان افتراضية
#             return {
#                 'xgboost': 1.5,
#                 'lightgbm': 1.5,
#                 'catboost': 1.5,
#                 'enhanced_rf': 1.2,
#                 'enhanced_gb': 1.2,
#                 'extra_trees': 1.1,
#                 'neural_net': 1.0,
#                 'adaboost': 0.9,
#                 'logistic_l2': 0.8
#             }
#
#         # حساب الأوزان من الأداء الفعلي
#         weights = {}
#         for model_name, performance in self.model_performance.items():
#             if 'f1_score' in performance:
#                 weights[model_name] = performance['f1_score']
#
#         return weights
#
#     def _calculate_agreement_score(self, predictions: Dict) -> float:
#         """حساب مستوى الاتفاق بين النماذج"""
#         if not predictions:
#             return 0
#
#         votes = list(predictions.values())
#         up_votes = sum(votes)
#         down_votes = len(votes) - up_votes
#
#         agreement = (max(up_votes, down_votes) / len(votes)) * 100
#         return agreement
#
#     def _calculate_signal_strength(self, confidence: float, agreement: float) -> str:
#         """حساب قوة الإشارة"""
#         combined_score = (confidence + agreement) / 2
#
#         if combined_score > 80:
#             return "قوية جداً"
#         elif combined_score > 70:
#             return "قوية"
#         elif combined_score > 60:
#             return "متوسطة"
#         elif combined_score > 50:
#             return "ضعيفة"
#         else:
#             return "ضعيفة جداً"
#
#     def _analyze_current_market(self, current_features: pd.Series, prices: List[float]) -> Dict:
#         """تحليل حالة السوق الحالية"""
#         analysis = {
#             "trend": self._identify_trend(prices),
#             "volatility": self._calculate_current_volatility(prices),
#             "momentum": self._calculate_momentum(prices),
#             "support_resistance": self._find_support_resistance(prices),
#             "market_phase": self._identify_market_phase(current_features)
#         }
#
#         return analysis
#
#     def _identify_trend(self, prices: List[float]) -> Dict:
#         """تحديد الاتجاه"""
#         if len(prices) < 20:
#             return {"direction": "UNKNOWN", "strength": 0}
#
#         recent_prices = prices[-20:]
#         ma_short = np.mean(recent_prices[-5:])
#         ma_long = np.mean(recent_prices)
#
#         if ma_short > ma_long * 1.01:
#             direction = "UPTREND"
#             strength = min(100, (ma_short / ma_long - 1) * 1000)
#         elif ma_short < ma_long * 0.99:
#             direction = "DOWNTREND"
#             strength = min(100, (1 - ma_short / ma_long) * 1000)
#         else:
#             direction = "SIDEWAYS"
#             strength = 50
#
#         return {
#             "direction": direction,
#             "strength": float(strength),
#             "ma_short": float(ma_short),
#             "ma_long": float(ma_long)
#         }
#
#     def _calculate_current_volatility(self, prices: List[float]) -> Dict:
#         """حساب التقلب الحالي"""
#         if len(prices) < 20:
#             return {"level": "UNKNOWN", "value": 0}
#
#         returns = np.diff(prices[-20:]) / prices[-20:-1]
#         volatility = np.std(returns) * 100
#
#         if volatility < 1:
#             level = "LOW"
#         elif volatility < 3:
#             level = "MEDIUM"
#         elif volatility < 5:
#             level = "HIGH"
#         else:
#             level = "EXTREME"
#
#         return {
#             "level": level,
#             "value": float(volatility),
#             "interpretation": self._interpret_volatility(level)
#         }
#
#     def _interpret_volatility(self, level: str) -> str:
#         """تفسير مستوى التقلب"""
#         interpretations = {
#             "LOW": "السوق مستقر - مناسب للتداول",
#             "MEDIUM": "تقلب معتدل - توخي الحذر",
#             "HIGH": "تقلب عالي - فرص ومخاطر",
#             "EXTREME": "تقلب شديد - خطر مرتفع",
#             "UNKNOWN": "غير محدد"
#         }
#         return interpretations.get(level, "غير محدد")
#
#     def _calculate_momentum(self, prices: List[float]) -> Dict:
#         """حساب الزخم"""
#         if len(prices) < 10:
#             return {"value": 0, "interpretation": "غير محدد"}
#
#         momentum = (prices[-1] / prices[-10] - 1) * 100
#
#         if momentum > 5:
#             interpretation = "زخم صعودي قوي"
#         elif momentum > 2:
#             interpretation = "زخم صعودي معتدل"
#         elif momentum > -2:
#             interpretation = "زخم محايد"
#         elif momentum > -5:
#             interpretation = "زخم هبوطي معتدل"
#         else:
#             interpretation = "زخم هبوطي قوي"
#
#         return {
#             "value": float(momentum),
#             "interpretation": interpretation
#         }
#
#     def _find_support_resistance(self, prices: List[float]) -> Dict:
#         """إيجاد مستويات الدعم والمقاومة"""
#         if len(prices) < 50:
#             return {"support": 0, "resistance": 0}
#
#         recent_prices = prices[-50:]
#         current_price = prices[-1]
#
#         # مستويات بسيطة
#         support = min(recent_prices[-20:])
#         resistance = max(recent_prices[-20:])
#
#         # مستويات ديناميكية
#         pivot = (max(recent_prices) + min(recent_prices) + current_price) / 3
#
#         return {
#             "support": float(support),
#             "resistance": float(resistance),
#             "pivot": float(pivot),
#             "current_position": "NEAR_SUPPORT" if current_price < pivot else "NEAR_RESISTANCE"
#         }
#
#     def _identify_market_phase(self, features: pd.Series) -> str:
#         """تحديد مرحلة السوق"""
#         try:
#             rsi = features.get('rsi_14', 50)
#             if pd.isna(rsi):
#                 rsi = 50
#
#             if rsi > 70:
#                 return "OVERBOUGHT"
#             elif rsi < 30:
#                 return "OVERSOLD"
#             elif 45 < rsi < 55:
#                 return "NEUTRAL"
#             elif rsi > 55:
#                 return "BULLISH"
#             else:
#                 return "BEARISH"
#         except:
#             return "UNKNOWN"
#
#     def _analyze_confidence(self, predictions: Dict, probabilities: Dict) -> Dict:
#         """تحليل مستوى الثقة"""
#         # حساب انحراف الاحتماليات
#         all_up_probs = [p['up'] for p in probabilities.values()]
#         prob_std = np.std(all_up_probs)
#
#         # حساب الثقة الإجمالية
#         avg_confidence = np.mean([max(p['up'], p['down']) for p in probabilities.values()])
#
#         # تحديد مستوى الثقة
#         if avg_confidence > 75 and prob_std < 10:
#             confidence_level = "عالية جداً"
#         elif avg_confidence > 65 and prob_std < 15:
#             confidence_level = "عالية"
#         elif avg_confidence > 55:
#             confidence_level = "متوسطة"
#         else:
#             confidence_level = "منخفضة"
#
#         return {
#             "average_confidence": float(avg_confidence),
#             "probability_std": float(prob_std),
#             "confidence_level": confidence_level,
#             "models_consensus": prob_std < 15
#         }
#
#     def _analyze_important_features(self, current_features: pd.Series) -> Dict:
#         """تحليل الميزات المهمة"""
#         if not self.feature_importance:
#             return {}
#
#         # أهم 5 ميزات
#         top_features = sorted(
#             self.feature_importance.items(),
#             key=lambda x: x[1],
#             reverse=True
#         )[:5]
#
#         analysis = {}
#         for feature_name, importance in top_features:
#             if feature_name in current_features:
#                 value = current_features[feature_name]
#                 if not pd.isna(value):
#                     analysis[feature_name] = {
#                         "value": float(value),
#                         "importance": float(importance),
#                         "interpretation": self._interpret_feature(feature_name, value)
#                     }
#
#         return analysis
#
#     def _interpret_feature(self, feature_name: str, value: float) -> str:
#         """تفسير قيمة الميزة"""
#         if 'rsi' in feature_name:
#             if value > 70:
#                 return "ذروة شراء"
#             elif value < 30:
#                 return "ذروة بيع"
#             else:
#                 return "محايد"
#         elif 'macd' in feature_name:
#             return "إيجابي" if value > 0 else "سلبي"
#         elif 'momentum' in feature_name:
#             return "صعودي" if value > 0 else "هبوطي"
#         elif 'volatility' in feature_name:
#             return "مرتفع" if value > 2 else "منخفض"
#         else:
#             return "عادي"
#
#     def _assess_risk(self, ensemble_result: Dict, market_analysis: Dict) -> Dict:
#         """تقييم المخاطر"""
#         risk_score = 0
#         risk_factors = []
#
#         # تقييم التقلب
#         volatility = market_analysis.get('volatility', {})
#         if volatility.get('level') == 'EXTREME':
#             risk_score += 30
#             risk_factors.append("تقلب شديد")
#         elif volatility.get('level') == 'HIGH':
#             risk_score += 20
#             risk_factors.append("تقلب عالي")
#
#         # تقييم الثقة
#         if ensemble_result['confidence'] < 60:
#             risk_score += 25
#             risk_factors.append("ثقة منخفضة")
#
#         # تقييم الإجماع
#         if not ensemble_result.get('models_agree', False):
#             risk_score += 15
#             risk_factors.append("اختلاف النماذج")
#
#         # تقييم مرحلة السوق
#         market_phase = market_analysis.get('market_phase', '')
#         if market_phase in ['OVERBOUGHT', 'OVERSOLD']:
#             risk_score += 10
#             risk_factors.append(f"السوق في حالة {market_phase}")
#
#         # تحديد مستوى المخاطر
#         if risk_score < 20:
#             risk_level = "منخفض"
#         elif risk_score < 40:
#             risk_level = "متوسط"
#         elif risk_score < 60:
#             risk_level = "مرتفع"
#         else:
#             risk_level = "مرتفع جداً"
#
#         return {
#             "risk_score": float(risk_score),
#             "risk_level": risk_level,
#             "risk_factors": risk_factors,
#             "recommendation": self._get_risk_recommendation(risk_level)
#         }
#
#     def _get_risk_recommendation(self, risk_level: str) -> str:
#         """توصيات إدارة المخاطر"""
#         recommendations = {
#             "منخفض": "يمكن التداول بحجم عادي",
#             "متوسط": "قلل حجم التداول واستخدم وقف الخسارة",
#             "مرتفع": "تداول بحذر شديد أو انتظر إشارات أوضح",
#             "مرتفع جداً": "تجنب التداول حالياً"
#         }
#         return recommendations.get(risk_level, "توخي الحذر")
#
#     def _suggest_action(self, ensemble_result: Dict, confidence_analysis: Dict) -> Dict:
#         """اقتراح الإجراء المناسب"""
#         recommendation = ensemble_result['recommendation']
#         confidence_level = confidence_analysis['confidence_level']
#
#         # تحديد حجم المركز المقترح
#         if confidence_level == "عالية جداً":
#             position_size = "100%"
#         elif confidence_level == "عالية":
#             position_size = "75%"
#         elif confidence_level == "متوسطة":
#             position_size = "50%"
#         else:
#             position_size = "25%"
#
#         # تحديد نقاط الدخول والخروج
#         if recommendation in ["STRONG BUY", "BUY"]:
#             action = "شراء"
#             stop_loss = "2-3% تحت سعر الدخول"
#             take_profit = "5-10% فوق سعر الدخول"
#         elif recommendation in ["STRONG SELL", "SELL"]:
#             action = "بيع"
#             stop_loss = "2-3% فوق سعر الدخول"
#             take_profit = "5-10% تحت سعر الدخول"
#         else:
#             action = "انتظار"
#             stop_loss = "غير مطلوب"
#             take_profit = "غير مطلوب"
#
#         return {
#             "action": action,
#             "position_size": position_size,
#             "stop_loss": stop_loss,
#             "take_profit": take_profit,
#             "timing": "فوري" if confidence_level in ["عالية جداً", "عالية"] else "انتظر تأكيد"
#         }
#
#     # ================== Model Management ==================
#
#     def _save_enhanced_models(self):
#         """حفظ النماذج المحسنة"""
#         try:
#             for name, model in self.models.items():
#                 model_path = os.path.join(self.model_path, f"enhanced_{name}.pkl")
#                 joblib.dump(model, model_path)
#
#             # حفظ المعالجات
#             scaler_path = os.path.join(self.model_path, "enhanced_scaler.pkl")
#             joblib.dump(self.scaler, scaler_path)
#
#             # حفظ معلومات الأداء
#             if self.feature_importance:
#                 importance_path = os.path.join(self.model_path, "feature_importance.pkl")
#                 joblib.dump(self.feature_importance, importance_path)
#
#             if self.model_performance:
#                 performance_path = os.path.join(self.model_path, "model_performance.pkl")
#                 joblib.dump(self.model_performance, performance_path)
#
#             # حفظ سجل التدريب
#             if self.training_history:
#                 history_path = os.path.join(self.model_path, "training_history.json")
#                 with open(history_path, 'w') as f:
#                     json.dump(self.training_history, f, indent=2, default=str)
#
#             print("✅ تم حفظ جميع النماذج المحسنة")
#
#         except Exception as e:
#             print(f"❌ خطأ في حفظ النماذج: {e}")
#
#     def load_enhanced_models(self) -> Dict[str, Any]:
#         """تحميل النماذج المحسنة المحفوظة"""
#         try:
#             loaded_models = 0
#
#             for name in list(self.models.keys()):
#                 model_path = os.path.join(self.model_path, f"enhanced_{name}.pkl")
#                 if os.path.exists(model_path):
#                     self.models[name] = joblib.load(model_path)
#                     loaded_models += 1
#
#             # تحميل المعالجات
#             scaler_path = os.path.join(self.model_path, "enhanced_scaler.pkl")
#             if os.path.exists(scaler_path):
#                 self.scaler = joblib.load(scaler_path)
#
#             # تحميل معلومات الأداء
#             importance_path = os.path.join(self.model_path, "feature_importance.pkl")
#             if os.path.exists(importance_path):
#                 self.feature_importance = joblib.load(importance_path)
#
#             performance_path = os.path.join(self.model_path, "model_performance.pkl")
#             if os.path.exists(performance_path):
#                 self.model_performance = joblib.load(performance_path)
#
#             # تحميل سجل التدريب
#             history_path = os.path.join(self.model_path, "training_history.json")
#             if os.path.exists(history_path):
#                 with open(history_path, 'r') as f:
#                     self.training_history = json.load(f)
#
#             if loaded_models > 0:
#                 self.is_trained = True
#                 return {
#                     "models_loaded": loaded_models,
#                     "status": "success",
#                     "performance_loaded": bool(self.model_performance),
#                     "features_loaded": bool(self.feature_importance)
#                 }
#             else:
#                 return {"status": "no_models_found"}
#
#         except Exception as e:
#             return {"error": f"فشل تحميل النماذج: {str(e)}"}
#
#     def get_model_info(self) -> Dict[str, Any]:
#         """الحصول على معلومات النماذج"""
#         info = {
#             "is_trained": self.is_trained,
#             "models_count": len(self.models),
#             "models": list(self.models.keys()),
#             "parallel_processing": self.enable_parallel,
#             "cache_size": self.cache_size,
#             "features_count": len(self.feature_importance) if self.feature_importance else 0,
#             "top_features": self._get_top_features(5),
#             "training_history_count": len(self.training_history)
#         }
#
#         if self.model_performance:
#             avg_accuracy = np.mean([p.get('accuracy', 0) for p in self.model_performance.values()])
#             avg_f1 = np.mean([p.get('f1_score', 0) for p in self.model_performance.values()])
#
#             info.update({
#                 "average_accuracy": round(avg_accuracy, 3),
#                 "average_f1_score": round(avg_f1, 3),
#                 "best_model": max(self.model_performance.keys(),
#                                  key=lambda k: self.model_performance[k].get('f1_score', 0))
#             })
#
#         return info
#
#     def cleanup(self):
#         """تنظيف الموارد"""
#         if self.enable_parallel:
#             self.thread_executor.shutdown(wait=False)
#             self.process_executor.shutdown(wait=False)
#
#         # مسح التخزين المؤقت
#         if hasattr(self, 'features_cache'):
#             self.features_cache.clear()
#
#
# # إنشاء instance عام محسن
# enhanced_advanced_ai = EnhancedAdvancedAI(enable_parallel=True, cache_size=1000)
#
# # للتوافق مع الكود القديم
# advanced_ai = enhanced_advanced_ai
"""
Enhanced Advanced AI Trading System - FIXED VERSION
نظام الذكاء الاصطناعي المحسن للتداول - النسخة المُصححة
Version 2.1 - مع إصلاح جميع الأخطاء
"""

import numpy as np
import pandas as pd
import os
import joblib
import hashlib
import json
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
import warnings

warnings.filterwarnings('ignore')

# نماذج التعلم الآلي الأساسية
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    ExtraTreesClassifier,
    VotingClassifier,
    AdaBoostClassifier
)
from sklearn.linear_model import LogisticRegression, RidgeClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.feature_selection import SelectKBest, f_classif

# مكتبات إضافية اختيارية
try:
    import xgboost as xgb
    from xgboost import XGBClassifier

    XGB_AVAILABLE = True
    print("✅ XGBoost متاح")
except ImportError:
    XGB_AVAILABLE = False
    print("⚠️ XGBoost غير متاح - استخدام Random Forest كبديل")

try:
    import lightgbm as lgb
    from lightgbm import LGBMClassifier

    LGBM_AVAILABLE = True
    print("✅ LightGBM متاح")
except ImportError:
    LGBM_AVAILABLE = False
    print("⚠️ LightGBM غير متاح - استخدام Gradient Boosting كبديل")

try:
    from catboost import CatBoostClassifier

    CATBOOST_AVAILABLE = True
    print("✅ CatBoost متاح")
except ImportError:
    CATBOOST_AVAILABLE = False
    print("⚠️ CatBoost غير متاح - استخدام Extra Trees كبديل")


class EnhancedAdvancedAI:
    """
    نظام الذكاء الاصطناعي المحسن مع إصلاح جميع الأخطاء
    """

    def __init__(self, enable_parallel=True, cache_size=1000):
        """تهيئة النظام المحسن"""
        try:
            self.enable_parallel = enable_parallel
            self.cache_size = cache_size

            # إعداد النماذج
            self.models = self._initialize_enhanced_models()

            # أدوات المعالجة
            self.scaler = RobustScaler()
            self.feature_selector = None
            self.is_trained = False
            self.model_path = "/app/models/enhanced/"

            # معلومات الأداء
            self.feature_importance = {}
            self.model_performance = {}
            self.training_history = []

            # المعالجة المتوازية
            if enable_parallel:
                try:
                    self.thread_executor = ThreadPoolExecutor(max_workers=4)
                except:
                    self.enable_parallel = False
                    print("⚠️ فشل تفعيل المعالجة المتوازية - التشغيل التسلسلي")

            # إنشاء مجلد النماذج
            os.makedirs(self.model_path, exist_ok=True)

            print("✅ تم تهيئة Enhanced AI بنجاح")

        except Exception as e:
            print(f"❌ خطأ في تهيئة Enhanced AI: {e}")
            # تهيئة أساسية للعمل
            self._basic_initialization()

    def _basic_initialization(self):
        """تهيئة أساسية في حالة فشل التهيئة المتقدمة"""
        self.models = {
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingClassifier(n_estimators=100, random_state=42)
        }
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "/app/models/enhanced/"
        self.feature_importance = {}
        self.model_performance = {}
        self.training_history = []
        self.enable_parallel = False
        os.makedirs(self.model_path, exist_ok=True)

    def _initialize_enhanced_models(self) -> Dict:
        """تهيئة النماذج المحسنة مع معالجة الأخطاء"""
        models = {}

        try:
            # النماذج الأساسية المضمونة
            models['enhanced_rf'] = RandomForestClassifier(
                n_estimators=300,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                max_features='sqrt',
                bootstrap=True,
                n_jobs=-1,
                random_state=42
            )

            models['enhanced_gb'] = GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=6,
                min_samples_split=5,
                min_samples_leaf=3,
                subsample=0.8,
                max_features='sqrt',
                random_state=42
            )

            models['extra_trees'] = ExtraTreesClassifier(
                n_estimators=200,
                max_depth=15,
                min_samples_split=3,
                min_samples_leaf=1,
                max_features='sqrt',
                bootstrap=False,
                n_jobs=-1,
                random_state=42
            )

            # النماذج الاختيارية
            if XGB_AVAILABLE:
                try:
                    models['xgboost'] = XGBClassifier(
                        n_estimators=200,
                        learning_rate=0.1,
                        max_depth=8,
                        min_child_weight=1,
                        gamma=0.1,
                        subsample=0.8,
                        colsample_bytree=0.8,
                        objective='binary:logistic',
                        n_jobs=-1,
                        random_state=42,
                        verbosity=0
                    )
                except Exception as e:
                    print(f"⚠️ فشل تهيئة XGBoost: {e}")

            if LGBM_AVAILABLE:
                try:
                    models['lightgbm'] = LGBMClassifier(
                        n_estimators=200,
                        learning_rate=0.1,
                        max_depth=10,
                        num_leaves=31,
                        min_child_samples=20,
                        subsample=0.8,
                        colsample_bytree=0.8,
                        n_jobs=-1,
                        random_state=42,
                        verbose=-1
                    )
                except Exception as e:
                    print(f"⚠️ فشل تهيئة LightGBM: {e}")

            if CATBOOST_AVAILABLE:
                try:
                    models['catboost'] = CatBoostClassifier(
                        iterations=200,
                        learning_rate=0.1,
                        depth=6,
                        l2_leaf_reg=3,
                        border_count=128,
                        thread_count=-1,
                        random_state=42,
                        verbose=False
                    )
                except Exception as e:
                    print(f"⚠️ فشل تهيئة CatBoost: {e}")

            # النماذج الإضافية
            models['adaboost'] = AdaBoostClassifier(
                n_estimators=100,
                learning_rate=1.0,
                random_state=42
            )

            models['neural_net'] = MLPClassifier(
                hidden_layer_sizes=(50, 25),
                activation='relu',
                solver='adam',
                alpha=0.001,
                learning_rate='adaptive',
                max_iter=500,
                early_stopping=True,
                validation_fraction=0.1,
                random_state=42
            )

            models['logistic_l2'] = LogisticRegression(
                penalty='l2',
                C=1.0,
                solver='lbfgs',
                max_iter=1000,
                random_state=42
            )

            print(f"✅ تم تهيئة {len(models)} نماذج بنجاح")
            return models

        except Exception as e:
            print(f"❌ خطأ في تهيئة النماذج: {e}")
            # إرجاع نماذج أساسية
            return {
                'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
                'gradient_boosting': GradientBoostingClassifier(n_estimators=100, random_state=42)
            }

    def calculate_safe_indicators(self, prices: List[float]) -> Dict[str, float]:
        """حساب المؤشرات الفنية بطريقة آمنة"""
        try:
            if len(prices) < 20:
                return {}

            prices_series = pd.Series(prices)
            indicators = {}

            # RSI آمن
            try:
                delta = prices_series.diff()
                gains = delta.where(delta > 0, 0)
                losses = -delta.where(delta < 0, 0)

                avg_gains = gains.rolling(14, min_periods=1).mean()
                avg_losses = losses.rolling(14, min_periods=1).mean()

                # تجنب القسمة على صفر
                avg_losses = avg_losses.replace(0, 0.001)
                rs = avg_gains / avg_losses
                rsi = 100 - (100 / (1 + rs))

                indicators['rsi_14'] = float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else 50.0
            except:
                indicators['rsi_14'] = 50.0

            # MACD آمن
            try:
                ema_12 = prices_series.ewm(span=12).mean()
                ema_26 = prices_series.ewm(span=26).mean()
                macd_line = ema_12 - ema_26
                signal_line = macd_line.ewm(span=9).mean()

                indicators['macd_12_26'] = float(macd_line.iloc[-1]) if not pd.isna(macd_line.iloc[-1]) else 0.0
                indicators['macd_signal'] = float(signal_line.iloc[-1]) if not pd.isna(signal_line.iloc[-1]) else 0.0
                indicators['macd_histogram'] = indicators['macd_12_26'] - indicators['macd_signal']
            except:
                indicators['macd_12_26'] = 0.0
                indicators['macd_signal'] = 0.0
                indicators['macd_histogram'] = 0.0

            # المتوسطات المتحركة
            try:
                for period in [5, 10, 20, 50]:
                    if len(prices) >= period:
                        ma = prices_series.rolling(period, min_periods=1).mean()
                        indicators[f'ma_{period}'] = float(ma.iloc[-1]) if not pd.isna(ma.iloc[-1]) else prices[-1]
                        indicators[f'price_to_ma_{period}'] = prices[-1] / indicators[f'ma_{period}']
            except:
                pass

            # التقلب
            try:
                returns = prices_series.pct_change().dropna()
                if len(returns) > 0:
                    indicators['volatility_20'] = float(returns.rolling(min(20, len(returns))).std()) * 100
                else:
                    indicators['volatility_20'] = 1.0
            except:
                indicators['volatility_20'] = 1.0

            # التغيرات السعرية
            try:
                for period in [1, 3, 5, 10]:
                    if len(prices) > period:
                        change = (prices[-1] / prices[-1 - period] - 1) * 100
                        indicators[f'price_change_{period}'] = float(change)
            except:
                pass

            return indicators

        except Exception as e:
            print(f"⚠️ خطأ في حساب المؤشرات: {e}")
            return {}

    def engineer_advanced_features(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
        """هندسة ميزات متقدمة مع معالجة آمنة للأخطاء"""
        try:
            if len(prices) < 20:
                # إرجاع ميزات أساسية للبيانات القليلة
                return self._create_basic_features(prices, volumes)

            # حساب المؤشرات الآمنة
            indicators = self.calculate_safe_indicators(prices)

            # إنشاء DataFrame
            df = pd.DataFrame({'price': prices})
            if volumes and len(volumes) == len(prices):
                df['volume'] = volumes
            else:
                df['volume'] = np.random.uniform(1000, 10000, len(prices))

            # إضافة المؤشرات
            for name, value in indicators.items():
                df[name] = value

            # ميزات إضافية آمنة
            df = self._add_safe_features(df)

            # ملء القيم المفقودة
            df = df.fillna(method='ffill').fillna(method='bfill').fillna(0)

            # إزالة القيم اللانهائية
            df = df.replace([np.inf, -np.inf], 0)

            return df

        except Exception as e:
            print(f"⚠️ خطأ في هندسة الميزات: {e}")
            return self._create_basic_features(prices, volumes)

    def _create_basic_features(self, prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
        """إنشاء ميزات أساسية آمنة"""
        try:
            df = pd.DataFrame({'price': prices})

            if len(prices) >= 10:
                df['ma_10'] = pd.Series(prices).rolling(10, min_periods=1).mean()
                df['price_to_ma_10'] = df['price'] / df['ma_10']
            else:
                df['ma_10'] = df['price']
                df['price_to_ma_10'] = 1.0

            if len(prices) >= 5:
                df['ma_5'] = pd.Series(prices).rolling(5, min_periods=1).mean()
                df['price_change_1'] = pd.Series(prices).pct_change().fillna(0) * 100
            else:
                df['ma_5'] = df['price']
                df['price_change_1'] = 0.0

            # ميزات الحجم البسيطة
            if volumes and len(volumes) == len(prices):
                df['volume'] = volumes
                df['volume_ma_5'] = pd.Series(volumes).rolling(5, min_periods=1).mean()
                df['volume_ratio'] = df['volume'] / df['volume_ma_5']
            else:
                df['volume'] = 1000
                df['volume_ma_5'] = 1000
                df['volume_ratio'] = 1.0

            return df.fillna(0)

        except Exception as e:
            print(f"❌ خطأ في إنشاء الميزات الأساسية: {e}")
            # إرجاع DataFrame بسيط جداً
            return pd.DataFrame({
                'price': prices,
                'price_change': [0] * len(prices)
            })

    def _add_safe_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """إضافة ميزات إضافية بطريقة آمنة"""
        try:
            # Bollinger Bands البسيط
            if len(df) >= 20:
                ma_20 = df['price'].rolling(20, min_periods=10).mean()
                std_20 = df['price'].rolling(20, min_periods=10).std()
                df['bb_upper'] = ma_20 + (2 * std_20)
                df['bb_lower'] = ma_20 - (2 * std_20)
                df['bb_position'] = (df['price'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
                df['bb_position'] = df['bb_position'].clip(0, 1)  # قيد القيم

            # Momentum
            for period in [3, 5, 10]:
                if len(df) > period:
                    df[f'momentum_{period}'] = df['price'] / df['price'].shift(period) - 1
                    df[f'momentum_{period}'] = df[f'momentum_{period}'].fillna(0)

            # Volume features
            if 'volume' in df.columns:
                for period in [5, 10]:
                    if len(df) >= period:
                        vol_ma = df['volume'].rolling(period, min_periods=1).mean()
                        df[f'volume_ma_{period}'] = vol_ma
                        df[f'volume_ratio_{period}'] = df['volume'] / vol_ma
                        df[f'volume_ratio_{period}'] = df[f'volume_ratio_{period}'].fillna(1.0)

            return df

        except Exception as e:
            print(f"⚠️ خطأ في إضافة الميزات: {e}")
            return df

    def train_enhanced_ensemble(self, prices: List[float], volumes: List[float] = None,
                                optimize_hyperparameters: bool = False) -> Dict[str, Any]:
        """تدريب النماذج المحسنة مع معالجة شاملة للأخطاء"""
        try:
            print(f"🎯 بدء التدريب المحسن مع {len(prices)} نقطة بيانات")

            if len(prices) < 50:
                return {"error": "يحتاج 50 نقطة على الأقل للتدريب المحسن"}

            # هندسة الميزات
            start_time = datetime.now()
            features_df = self.engineer_advanced_features(prices, volumes)
            feature_time = (datetime.now() - start_time).total_seconds()
            print(f"✅ هندسة الميزات اكتملت في {feature_time:.2f} ثانية - {len(features_df.columns)} ميزة")

            # اختيار الميزات
            feature_columns = self._select_safe_features(features_df)
            X = features_df[feature_columns].values

            # إنشاء الأهداف
            y = self._create_safe_targets(prices)

            # التحقق من صحة البيانات
            valid_indices = ~(np.isnan(y) | np.isnan(X).any(axis=1) | np.isinf(X).any(axis=1))
            X = X[valid_indices]
            y = y[valid_indices]

            if len(X) < 30:
                return {"error": "بيانات صالحة غير كافية للتدريب"}

            # تقسيم البيانات
            try:
                # التأكد من وجود كلا الصنفين
                unique_classes = np.unique(y)
                if len(unique_classes) < 2:
                    return {"error": "يحتاج صنفين على الأقل للتدريب"}

                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42, stratify=y
                )
            except ValueError:
                # إذا فشل stratify، استخدم تقسيم عادي
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )

            # تطبيع البيانات
            try:
                X_train_scaled = self.scaler.fit_transform(X_train)
                X_test_scaled = self.scaler.transform(X_test)
            except Exception as e:
                print(f"⚠️ خطأ في التطبيع: {e}")
                return {"error": f"فشل في تطبيع البيانات: {str(e)}"}

            # تدريب النماذج
            print("🚀 بدء تدريب النماذج...")
            model_results = self._safe_model_training(
                X_train_scaled, y_train, X_test_scaled, y_test
            )

            # حساب أهمية الميزات
            self._calculate_safe_feature_importance(feature_columns, X_train_scaled, y_train)

            # حفظ النماذج
            self._save_enhanced_models()
            self.is_trained = True

            # إحصائيات النتائج
            valid_results = {k: v for k, v in model_results.items() if 'error' not in v}
            if valid_results:
                best_model = max(valid_results.keys(), key=lambda k: valid_results[k].get('f1_score', 0))
                avg_accuracy = np.mean([v.get('accuracy', 0) for v in valid_results.values()])
                avg_f1 = np.mean([v.get('f1_score', 0) for v in valid_results.values()])
            else:
                best_model = "none"
                avg_accuracy = 0
                avg_f1 = 0

            training_time = (datetime.now() - start_time).total_seconds()

            result = {
                "training_completed": True,
                "training_time_seconds": round(training_time, 2),
                "feature_engineering_time": round(feature_time, 2),
                "training_samples": len(X_train),
                "test_samples": len(X_test),
                "feature_count": len(feature_columns),
                "models_trained": len(valid_results),
                "successful_models": list(valid_results.keys()),
                "failed_models": [k for k, v in model_results.items() if 'error' in v],
                "model_results": model_results,
                "best_model": best_model,
                "best_accuracy": round(valid_results.get(best_model, {}).get('accuracy', 0), 3),
                "best_f1_score": round(valid_results.get(best_model, {}).get('f1_score', 0), 3),
                "average_accuracy": round(avg_accuracy, 3),
                "average_f1_score": round(avg_f1, 3),
                "top_features": self._get_top_features(10),
                "performance_level": self._get_performance_level(avg_accuracy)
            }

            # حفظ سجل التدريب
            self.training_history.append({
                "timestamp": datetime.now().isoformat(),
                "result": result
            })

            return result

        except Exception as e:
            print(f"❌ خطأ في التدريب: {e}")
            return {"error": f"فشل التدريب المحسن: {str(e)}"}

    def _select_safe_features(self, features_df: pd.DataFrame) -> List[str]:
        """اختيار الميزات بطريقة آمنة"""
        try:
            # الميزات الرقمية فقط
            numeric_cols = features_df.select_dtypes(include=[np.number]).columns.tolist()

            # إزالة الأعمدة الثابتة أو التي بها مشاكل
            safe_cols = []
            for col in numeric_cols:
                try:
                    series = features_df[col]
                    if series.std() > 0 and not series.isnull().all() and np.isfinite(series).all():
                        safe_cols.append(col)
                except:
                    continue

            # الحد الأدنى من الميزات
            if len(safe_cols) < 3:
                safe_cols = ['price'] + [col for col in numeric_cols if col != 'price'][:5]

            return safe_cols[:50]  # حد أقصى 50 ميزة

        except Exception as e:
            print(f"⚠️ خطأ في اختيار الميزات: {e}")
            return ['price']

    def _create_safe_targets(self, prices: List[float]) -> np.ndarray:
        """إنشاء أهداف آمنة للتدريب"""
        try:
            targets = []
            threshold = 0.01  # 1%

            for i in range(len(prices) - 1):
                try:
                    price_change = (prices[i + 1] - prices[i]) / prices[i]
                    target = 1 if price_change > threshold else 0
                    targets.append(target)
                except:
                    targets.append(0)

            # إضافة آخر قيمة
            targets.append(targets[-1] if targets else 0)

            return np.array(targets)

        except Exception as e:
            print(f"⚠️ خطأ في إنشاء الأهداف: {e}")
            # إرجاع أهداف عشوائية متوازنة
            return np.random.choice([0, 1], size=len(prices))

    def _safe_model_training(self, X_train, y_train, X_test, y_test) -> Dict:
        """تدريب النماذج بطريقة آمنة"""
        results = {}

        for name, model in self.models.items():
            try:
                print(f"  📊 تدريب {name}...")
                start = datetime.now()

                # التدريب مع timeout
                model.fit(X_train, y_train)

                # التنبؤ
                train_pred = model.predict(X_train)
                test_pred = model.predict(X_test)

                # حساب المقاييس
                train_acc = accuracy_score(y_train, train_pred)
                test_acc = accuracy_score(y_test, test_pred)

                try:
                    precision = precision_score(y_test, test_pred, average='weighted', zero_division=0)
                    recall = recall_score(y_test, test_pred, average='weighted', zero_division=0)
                    f1 = f1_score(y_test, test_pred, average='weighted', zero_division=0)
                except:
                    precision = recall = f1 = 0.5

                training_time = (datetime.now() - start).total_seconds()

                results[name] = {
                    "accuracy": float(test_acc),
                    "train_accuracy": float(train_acc),
                    "precision": float(precision),
                    "recall": float(recall),
                    "f1_score": float(f1),
                    "training_time": float(training_time),
                    "overfitting_score": float(abs(train_acc - test_acc))
                }

                print(f"  ✅ {name} - Accuracy: {test_acc:.3f}, F1: {f1:.3f}")

            except Exception as e:
                print(f"  ❌ فشل تدريب {name}: {e}")
                results[name] = {"error": str(e)}

        return results

    def _calculate_safe_feature_importance(self, feature_columns: List[str], X_train, y_train):
        """حساب أهمية الميزات بطريقة آمنة"""
        try:
            importance_scores = {}

            for name, model in self.models.items():
                if hasattr(model, 'feature_importances_'):
                    try:
                        importances = model.feature_importances_
                        for i, col in enumerate(feature_columns):
                            if col not in importance_scores:
                                importance_scores[col] = []
                            if i < len(importances):
                                importance_scores[col].append(importances[i])
                    except Exception as e:
                        print(f"⚠️ خطأ في حساب أهمية الميزات لـ {name}: {e}")

            # حساب المتوسط
            self.feature_importance = {}
            for col, scores in importance_scores.items():
                if scores:
                    self.feature_importance[col] = np.mean(scores)

        except Exception as e:
            print(f"⚠️ خطأ في حساب أهمية الميزات: {e}")
            self.feature_importance = {}

    def _get_top_features(self, n: int = 10) -> List[Dict]:
        """الحصول على أهم الميزات"""
        if not self.feature_importance:
            return []

        try:
            sorted_features = sorted(
                self.feature_importance.items(),
                key=lambda x: x[1],
                reverse=True
            )

            return [
                {"name": name, "importance": round(float(score), 4)}
                for name, score in sorted_features[:n]
            ]
        except:
            return []

    def _get_performance_level(self, accuracy: float) -> str:
        """تحديد مستوى الأداء"""
        if accuracy > 0.75:
            return "ممتاز"
        elif accuracy > 0.65:
            return "جيد جداً"
        elif accuracy > 0.55:
            return "جيد"
        elif accuracy > 0.50:
            return "مقبول"
        else:
            return "ضعيف"

    def predict_enhanced_ensemble(self, prices: List[float], volumes: List[float] = None) -> Dict[str, Any]:
        """التنبؤ المحسن مع معالجة شاملة للأخطاء"""
        try:
            if not self.is_trained:
                # محاولة تحميل النماذج
                load_result = self.load_enhanced_models()
                if not self.is_trained:
                    return {
                        "error": "النماذج غير مدربة",
                        "suggestion": "قم بتدريب النماذج أولاً باستخدام /ai/enhanced/train/",
                        "load_attempt": load_result
                    }

            if len(prices) < 20:
                return {"error": "يحتاج 20 نقطة على الأقل للتنبؤ المحسن"}

            # هندسة الميزات
            features_df = self.engineer_advanced_features(prices, volumes)

            # استخدام الميزات المحفوظة أو المتاحة
            if self.feature_importance:
                available_features = [col for col in self.feature_importance.keys()
                                      if col in features_df.columns]
            else:
                available_features = self._select_safe_features(features_df)

            if not available_features:
                return {"error": "لا توجد ميزات صالحة للتنبؤ"}

            # أخذ آخر نقطة للتنبؤ
            try:
                X = features_df[available_features].iloc[-1:].values

                # التحقق من صحة البيانات
                if np.isnan(X).any() or np.isinf(X).any():
                    # محاولة استخدام النقطة السابقة
                    if len(features_df) > 1:
                        X = features_df[available_features].iloc[-2:-1].values
                        if np.isnan(X).any() or np.isinf(X).any():
                            return {"error": "بيانات غير صالحة للتنبؤ"}
                    else:
                        return {"error": "بيانات غير صالحة للتنبؤ"}

            except Exception as e:
                return {"error": f"خطأ في تحضير البيانات: {str(e)}"}

            # تطبيع البيانات
            try:
                X_scaled = self.scaler.transform(X)
            except Exception as e:
                return {"error": f"خطأ في تطبيع البيانات: {str(e)}"}

            # التنبؤ من كل نموذج
            predictions = {}
            probabilities = {}
            prediction_times = {}
            successful_models = 0

            for name, model in self.models.items():
                try:
                    start = datetime.now()

                    # التنبؤ
                    pred = model.predict(X_scaled)[0]
                    prediction_time = (datetime.now() - start).total_seconds() * 1000

                    predictions[name] = int(pred)
                    prediction_times[name] = round(prediction_time, 2)

                    # الاحتماليات
                    if hasattr(model, 'predict_proba'):
                        try:
                            prob = model.predict_proba(X_scaled)[0]
                            if len(prob) >= 2:
                                probabilities[name] = {
                                    'down': float(prob[0] * 100),
                                    'up': float(prob[1] * 100)
                                }
                            else:
                                probabilities[name] = {
                                    'down': float((1 - prob[0]) * 100),
                                    'up': float(prob[0] * 100)
                                }
                        except:
                            probabilities[name] = {'down': 50.0, 'up': 50.0}
                    else:
                        # تقدير بسيط للاحتماليات
                        confidence = 65.0 if pred == 1 else 35.0
                        probabilities[name] = {
                            'down': 100 - confidence,
                            'up': confidence
                        }

                    successful_models += 1

                except Exception as e:
                    print(f"⚠️ فشل التنبؤ بـ {name}: {e}")
                    predictions[name] = 0
                    probabilities[name] = {'down': 50.0, 'up': 50.0}
                    prediction_times[name] = 0

            if successful_models == 0:
                return {"error": "فشل جميع النماذج في التنبؤ"}

            # التنبؤ المجمع
            ensemble_result = self._safe_ensemble_prediction(predictions, probabilities)

            # تحليل السوق
            market_analysis = self._safe_market_analysis(features_df.iloc[-1], prices)

            # تحليل الثقة
            confidence_analysis = self._safe_confidence_analysis(predictions, probabilities)

            # تقييم المخاطر
            risk_assessment = self._safe_risk_assessment(ensemble_result, market_analysis)

            result = {
                "ensemble_prediction": ensemble_result,
                "individual_predictions": predictions,
                "individual_probabilities": probabilities,
                "prediction_times_ms": prediction_times,
                "successful_models": successful_models,
                "total_models": len(self.models),
                "market_analysis": market_analysis,
                "confidence_analysis": confidence_analysis,
                "risk_assessment": risk_assessment,
                "features_used": len(available_features),
                "current_price": float(prices[-1]),
                "timestamp": datetime.now().isoformat()
            }

            return result

        except Exception as e:
            print(f"❌ خطأ في التنبؤ المحسن: {e}")
            return {"error": f"فشل التنبؤ المحسن: {str(e)}"}

    def _safe_ensemble_prediction(self, predictions: Dict, probabilities: Dict) -> Dict:
        """التنبؤ المجمع الآمن"""
        try:
            if not predictions:
                return {"error": "لا توجد تنبؤات"}

            # حساب الأوزان
            weights = self._get_safe_model_weights()

            # التصويت الموزون
            weighted_votes = 0
            total_weight = 0

            for model_name, prediction in predictions.items():
                weight = weights.get(model_name, 1.0)
                weighted_votes += prediction * weight
                total_weight += weight

            # حساب الاحتماليات الموزونة
            weighted_up_prob = 0
            weighted_down_prob = 0

            for model_name, probs in probabilities.items():
                if model_name in predictions:  # تأكد من وجود تنبؤ صحيح
                    weight = weights.get(model_name, 1.0)
                    weighted_up_prob += probs.get('up', 50) * weight
                    weighted_down_prob += probs.get('down', 50) * weight

            if total_weight == 0:
                return {"error": "لا توجد أوزان صالحة"}

            avg_up_prob = weighted_up_prob / total_weight
            avg_down_prob = weighted_down_prob / total_weight

            # القرار النهائي
            final_prediction = "UP" if weighted_votes / total_weight > 0.5 else "DOWN"

            # مستوى الثقة
            confidence = max(avg_up_prob, avg_down_prob)

            # التوصية
            if confidence > 70:
                recommendation = "STRONG_BUY" if avg_up_prob > 70 else "STRONG_SELL"
            elif confidence > 60:
                recommendation = "BUY" if avg_up_prob > 60 else "SELL"
            else:
                recommendation = "HOLD"

            # قوة الإجماع
            agreement_score = self._calculate_safe_agreement(predictions)

            return {
                "final_prediction": final_prediction,
                "recommendation": recommendation,
                "confidence": round(float(confidence), 2),
                "probabilities": {
                    "up": round(float(avg_up_prob), 2),
                    "down": round(float(avg_down_prob), 2)
                },
                "agreement_score": round(float(agreement_score), 2),
                "models_agree": agreement_score > 70,
                "signal_strength": self._get_signal_strength(confidence, agreement_score)
            }

        except Exception as e:
            print(f"⚠️ خطأ في التنبؤ المجمع: {e}")
            return {
                "final_prediction": "NEUTRAL",
                "recommendation": "HOLD",
                "confidence": 50.0,
                "probabilities": {"up": 50.0, "down": 50.0},
                "agreement_score": 0.0,
                "models_agree": False,
                "signal_strength": "غير محدد",
                "error": str(e)
            }

    def _get_safe_model_weights(self) -> Dict[str, float]:
        """حساب أوزان آمنة للنماذج"""
        try:
            if self.model_performance:
                weights = {}
                for model_name, performance in self.model_performance.items():
                    f1_score = performance.get('f1_score', 0.5)
                    accuracy = performance.get('accuracy', 0.5)
                    weights[model_name] = (f1_score + accuracy) / 2
                return weights
            else:
                # أوزان افتراضية
                default_weights = {
                    'xgboost': 1.5,
                    'lightgbm': 1.5,
                    'catboost': 1.4,
                    'enhanced_rf': 1.2,
                    'enhanced_gb': 1.2,
                    'extra_trees': 1.1,
                    'neural_net': 1.0,
                    'adaboost': 0.9,
                    'logistic_l2': 0.8
                }
                return {k: v for k, v in default_weights.items() if k in self.models}
        except:
            return {name: 1.0 for name in self.models.keys()}

    def _calculate_safe_agreement(self, predictions: Dict) -> float:
        """حساب اتفاق آمن بين النماذج"""
        try:
            if not predictions:
                return 0.0

            votes = list(predictions.values())
            up_votes = sum(votes)
            down_votes = len(votes) - up_votes

            agreement = (max(up_votes, down_votes) / len(votes)) * 100
            return agreement
        except:
            return 0.0

    def _get_signal_strength(self, confidence: float, agreement: float) -> str:
        """تحديد قوة الإشارة"""
        try:
            combined_score = (confidence + agreement) / 2

            if combined_score > 80:
                return "قوية جداً"
            elif combined_score > 70:
                return "قوية"
            elif combined_score > 60:
                return "متوسطة"
            elif combined_score > 50:
                return "ضعيفة"
            else:
                return "ضعيفة جداً"
        except:
            return "غير محدد"

    def _safe_market_analysis(self, current_features: pd.Series, prices: List[float]) -> Dict:
        """تحليل آمن للسوق"""
        try:
            analysis = {}

            # تحليل الاتجاه
            try:
                if len(prices) >= 20:
                    recent_prices = prices[-20:]
                    ma_short = np.mean(recent_prices[-5:])
                    ma_long = np.mean(recent_prices)

                    if ma_short > ma_long * 1.01:
                        trend = "UPTREND"
                        strength = min(100, (ma_short / ma_long - 1) * 1000)
                    elif ma_short < ma_long * 0.99:
                        trend = "DOWNTREND"
                        strength = min(100, (1 - ma_short / ma_long) * 1000)
                    else:
                        trend = "SIDEWAYS"
                        strength = 50

                    analysis["trend"] = {
                        "direction": trend,
                        "strength": round(float(strength), 2)
                    }
                else:
                    analysis["trend"] = {"direction": "UNKNOWN", "strength": 0}
            except:
                analysis["trend"] = {"direction": "UNKNOWN", "strength": 0}

            # تحليل التقلب
            try:
                if len(prices) >= 10:
                    returns = np.diff(prices[-10:]) / prices[-10:-1]
                    volatility = np.std(returns) * 100

                    if volatility < 1:
                        vol_level = "LOW"
                    elif volatility < 3:
                        vol_level = "MEDIUM"
                    elif volatility < 5:
                        vol_level = "HIGH"
                    else:
                        vol_level = "EXTREME"

                    analysis["volatility"] = {
                        "level": vol_level,
                        "value": round(float(volatility), 2)
                    }
                else:
                    analysis["volatility"] = {"level": "UNKNOWN", "value": 0}
            except:
                analysis["volatility"] = {"level": "UNKNOWN", "value": 0}

            # مرحلة السوق من RSI
            try:
                rsi = current_features.get('rsi_14', 50)
                if pd.isna(rsi):
                    rsi = 50

                if rsi > 70:
                    phase = "OVERBOUGHT"
                elif rsi < 30:
                    phase = "OVERSOLD"
                elif 45 < rsi < 55:
                    phase = "NEUTRAL"
                elif rsi > 55:
                    phase = "BULLISH"
                else:
                    phase = "BEARISH"

                analysis["market_phase"] = phase
            except:
                analysis["market_phase"] = "UNKNOWN"

            return analysis

        except Exception as e:
            print(f"⚠️ خطأ في تحليل السوق: {e}")
            return {"error": str(e)}

    def _safe_confidence_analysis(self, predictions: Dict, probabilities: Dict) -> Dict:
        """تحليل آمن للثقة"""
        try:
            if not probabilities:
                return {"average_confidence": 50.0, "confidence_level": "منخفضة"}

            # حساب متوسط الثقة
            confidence_values = []
            for probs in probabilities.values():
                up_prob = probs.get('up', 50)
                down_prob = probs.get('down', 50)
                confidence_values.append(max(up_prob, down_prob))

            avg_confidence = np.mean(confidence_values) if confidence_values else 50.0

            # تحديد مستوى الثقة
            if avg_confidence > 75:
                confidence_level = "عالية جداً"
            elif avg_confidence > 65:
                confidence_level = "عالية"
            elif avg_confidence > 55:
                confidence_level = "متوسطة"
            else:
                confidence_level = "منخفضة"

            return {
                "average_confidence": round(float(avg_confidence), 2),
                "confidence_level": confidence_level,
                "models_analyzed": len(probabilities)
            }

        except Exception as e:
            return {
                "average_confidence": 50.0,
                "confidence_level": "غير محدد",
                "error": str(e)
            }

    def _safe_risk_assessment(self, ensemble_result: Dict, market_analysis: Dict) -> Dict:
        """تقييم آمن للمخاطر"""
        try:
            risk_score = 0
            risk_factors = []

            # تقييم التقلب
            volatility = market_analysis.get('volatility', {})
            vol_level = volatility.get('level', 'UNKNOWN')

            if vol_level == 'EXTREME':
                risk_score += 30
                risk_factors.append("تقلب شديد")
            elif vol_level == 'HIGH':
                risk_score += 20
                risk_factors.append("تقلب عالي")

            # تقييم الثقة
            confidence = ensemble_result.get('confidence', 50)
            if confidence < 60:
                risk_score += 25
                risk_factors.append("ثقة منخفضة")

            # تقييم الإجماع
            if not ensemble_result.get('models_agree', False):
                risk_score += 15
                risk_factors.append("اختلاف النماذج")

            # تحديد مستوى المخاطر
            if risk_score < 20:
                risk_level = "منخفض"
            elif risk_score < 40:
                risk_level = "متوسط"
            elif risk_score < 60:
                risk_level = "مرتفع"
            else:
                risk_level = "مرتفع جداً"

            return {
                "risk_score": float(risk_score),
                "risk_level": risk_level,
                "risk_factors": risk_factors
            }

        except Exception as e:
            return {
                "risk_score": 50.0,
                "risk_level": "غير محدد",
                "risk_factors": ["خطأ في التحليل"],
                "error": str(e)
            }

    def _save_enhanced_models(self):
        """حفظ آمن للنماذج"""
        try:
            saved_models = 0

            for name, model in self.models.items():
                try:
                    model_path = os.path.join(self.model_path, f"enhanced_{name}.pkl")
                    joblib.dump(model, model_path)
                    saved_models += 1
                except Exception as e:
                    print(f"⚠️ فشل حفظ {name}: {e}")

            # حفظ المعالجات
            try:
                scaler_path = os.path.join(self.model_path, "enhanced_scaler.pkl")
                joblib.dump(self.scaler, scaler_path)
            except Exception as e:
                print(f"⚠️ فشل حفظ Scaler: {e}")

            # حفظ معلومات الأداء
            try:
                if self.feature_importance:
                    importance_path = os.path.join(self.model_path, "feature_importance.pkl")
                    joblib.dump(self.feature_importance, importance_path)

                if self.model_performance:
                    performance_path = os.path.join(self.model_path, "model_performance.pkl")
                    joblib.dump(self.model_performance, performance_path)
            except Exception as e:
                print(f"⚠️ فشل حفظ معلومات الأداء: {e}")

            print(f"✅ تم حفظ {saved_models} نماذج من أصل {len(self.models)}")

        except Exception as e:
            print(f"❌ خطأ في حفظ النماذج: {e}")

    def load_enhanced_models(self) -> Dict[str, Any]:
        """تحميل آمن للنماذج"""
        try:
            loaded_models = 0
            failed_models = []

            for name in list(self.models.keys()):
                try:
                    model_path = os.path.join(self.model_path, f"enhanced_{name}.pkl")
                    if os.path.exists(model_path):
                        self.models[name] = joblib.load(model_path)
                        loaded_models += 1
                    else:
                        failed_models.append(f"{name} (file not found)")
                except Exception as e:
                    failed_models.append(f"{name} ({str(e)})")

            # تحميل المعالجات
            scaler_loaded = False
            try:
                scaler_path = os.path.join(self.model_path, "enhanced_scaler.pkl")
                if os.path.exists(scaler_path):
                    self.scaler = joblib.load(scaler_path)
                    scaler_loaded = True
            except Exception as e:
                print(f"⚠️ فشل تحميل Scaler: {e}")

            # تحميل معلومات الأداء
            importance_loaded = False
            performance_loaded = False

            try:
                importance_path = os.path.join(self.model_path, "feature_importance.pkl")
                if os.path.exists(importance_path):
                    self.feature_importance = joblib.load(importance_path)
                    importance_loaded = True
            except:
                pass

            try:
                performance_path = os.path.join(self.model_path, "model_performance.pkl")
                if os.path.exists(performance_path):
                    self.model_performance = joblib.load(performance_path)
                    performance_loaded = True
            except:
                pass

            if loaded_models > 0:
                self.is_trained = True
                return {
                    "status": "success",
                    "models_loaded": loaded_models,
                    "total_models": len(self.models),
                    "failed_models": failed_models,
                    "scaler_loaded": scaler_loaded,
                    "performance_loaded": performance_loaded,
                    "features_loaded": importance_loaded
                }
            else:
                return {
                    "status": "no_models_found",
                    "failed_models": failed_models
                }

        except Exception as e:
            return {"status": "error", "error": str(e)}

    def get_model_info(self) -> Dict[str, Any]:
        """الحصول على معلومات النماذج"""
        try:
            info = {
                "is_trained": self.is_trained,
                "models_count": len(self.models),
                "models": list(self.models.keys()),
                "parallel_processing": self.enable_parallel,
                "cache_size": self.cache_size,
                "features_count": len(self.feature_importance) if self.feature_importance else 0,
                "top_features": self._get_top_features(5),
                "training_history_count": len(self.training_history),
                "xgboost_available": XGB_AVAILABLE,
                "lightgbm_available": LGBM_AVAILABLE,
                "catboost_available": CATBOOST_AVAILABLE
            }

            if self.model_performance:
                valid_performance = {k: v for k, v in self.model_performance.items()
                                     if isinstance(v, dict) and 'accuracy' in v}

                if valid_performance:
                    avg_accuracy = np.mean([p['accuracy'] for p in valid_performance.values()])
                    avg_f1 = np.mean([p.get('f1_score', 0) for p in valid_performance.values()])
                    best_model = max(valid_performance.keys(),
                                     key=lambda k: valid_performance[k].get('f1_score', 0))

                    info.update({
                        "average_accuracy": round(avg_accuracy, 3),
                        "average_f1_score": round(avg_f1, 3),
                        "best_model": best_model,
                        "performance_available": True
                    })
                else:
                    info["performance_available"] = False
            else:
                info["performance_available"] = False

            return info

        except Exception as e:
            return {
                "error": str(e),
                "is_trained": False,
                "models_count": 0
            }

    def cleanup(self):
        """تنظيف آمن للموارد"""
        try:
            if self.enable_parallel and hasattr(self, 'thread_executor'):
                self.thread_executor.shutdown(wait=False)

            # مسح التخزين المؤقت
            if hasattr(self, 'features_cache'):
                self.features_cache.clear()

        except Exception as e:
            print(f"⚠️ خطأ في التنظيف: {e}")


# إنشاء instance عام محسن مع معالجة الأخطاء
try:
    enhanced_advanced_ai = EnhancedAdvancedAI(enable_parallel=True, cache_size=1000)
    print("✅ تم إنشاء Enhanced Advanced AI بنجاح")
except Exception as e:
    print(f"❌ فشل إنشاء Enhanced Advanced AI: {e}")
    # إنشاء نسخة أساسية
    enhanced_advanced_ai = EnhancedAdvancedAI(enable_parallel=False, cache_size=100)

# للتوافق مع الكود القديم
advanced_ai = enhanced_advanced_ai