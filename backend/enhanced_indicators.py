import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple
import ta
from scipy import stats
from sklearn.preprocessing import StandardScaler

def calculate_enhanced_indicators(prices: List[float], volumes: List[float] = None) -> pd.DataFrame:
    """
    حساب مؤشرات فنية متقدمة ومحسنة
    """
    df = pd.DataFrame({
        'close': prices,
        'volume': volumes or [1000] * len(prices)
    })
    
    # إضافة أسعار وهمية للمؤشرات التي تحتاج OHLC
    df['high'] = df['close'] * 1.01  # ارتفاع وهمي
    df['low'] = df['close'] * 0.99   # انخفاض وهمي
    df['open'] = df['close'].shift(1).fillna(df['close'])
    
    # === المتوسطات المتحركة المتقدمة ===
    # المتوسطات التقليدية
    df['ema_5'] = df['close'].ewm(span=5).mean()
    df['ema_10'] = df['close'].ewm(span=10).mean()
    df['ema_21'] = df['close'].ewm(span=21).mean()
    df['ema_50'] = df['close'].ewm(span=50).mean()
    df['ema_100'] = df['close'].ewm(span=100).mean()
    df['ema_200'] = df['close'].ewm(span=200).mean()
    
    # متوسطات متحركة مرجحة
    df['wma_10'] = df['close'].rolling(10).apply(lambda x: np.average(x, weights=range(1, len(x)+1)))
    df['wma_20'] = df['close'].rolling(20).apply(lambda x: np.average(x, weights=range(1, len(x)+1)))
    
    # Hull Moving Average
    df['hma_14'] = calculate_hull_ma(df['close'], 14)
    df['hma_21'] = calculate_hull_ma(df['close'], 21)
    
    # === مؤشرات الزخم المتقدمة ===
    # RSI متعدد الفترات
    df['rsi_7'] = ta.momentum.RSIIndicator(df['close'], window=7).rsi()
    df['rsi_14'] = ta.momentum.RSIIndicator(df['close'], window=14).rsi()
    df['rsi_21'] = ta.momentum.RSIIndicator(df['close'], window=21).rsi()
    df['rsi_50'] = ta.momentum.RSIIndicator(df['close'], window=50).rsi()
    
    # Stochastic RSI
    stoch_rsi = ta.momentum.StochRSIIndicator(df['close'])
    df['stoch_rsi'] = stoch_rsi.stochrsi()
    df['stoch_rsi_k'] = stoch_rsi.stochrsi_k()
    df['stoch_rsi_d'] = stoch_rsi.stochrsi_d()
    
    # Williams %R
    df['williams_r'] = ta.momentum.WilliamsRIndicator(df['high'], df['low'], df['close']).willr()
    
    # Ultimate Oscillator
    df['ultimate_osc'] = ta.momentum.UltimateOscillator(df['high'], df['low'], df['close']).ultimate_oscillator()
    
    # ROC (Rate of Change)
    df['roc_10'] = ta.momentum.ROCIndicator(df['close'], window=10).roc()
    df['roc_20'] = ta.momentum.ROCIndicator(df['close'], window=20).roc()
    
    # === مؤشرات الاتجاه المتقدمة ===
    # MACD متعدد الفترات
    macd_12_26 = ta.trend.MACD(df['close'], window_slow=26, window_fast=12, window_sign=9)
    df['macd'] = macd_12_26.macd()
    df['macd_signal'] = macd_12_26.macd_signal()
    df['macd_histogram'] = macd_12_26.macd_diff()
    
    # MACD بفترات مختلفة
    macd_5_35 = ta.trend.MACD(df['close'], window_slow=35, window_fast=5, window_sign=5)
    df['macd_fast'] = macd_5_35.macd()
    df['macd_fast_signal'] = macd_5_35.macd_signal()
    
    # ADX (Average Directional Index)
    adx = ta.trend.ADXIndicator(df['high'], df['low'], df['close'])
    df['adx'] = adx.adx()
    df['adx_pos'] = adx.adx_pos()
    df['adx_neg'] = adx.adx_neg()
    
    # Parabolic SAR
    df['psar'] = ta.trend.PSARIndicator(df['high'], df['low'], df['close']).psar()
    
    # Ichimoku
    ichimoku = ta.trend.IchimokuIndicator(df['high'], df['low'])
    df['ichimoku_conv'] = ichimoku.ichimoku_conversion_line()
    df['ichimoku_base'] = ichimoku.ichimoku_base_line()
    df['ichimoku_a'] = ichimoku.ichimoku_a()
    df['ichimoku_b'] = ichimoku.ichimoku_b()
    
    # === مؤشرات التقلب المتقدمة ===
    # Bollinger Bands متعددة
    bb_20 = ta.volatility.BollingerBands(df['close'], window=20, window_dev=2)
    df['bb_upper'] = bb_20.bollinger_hband()
    df['bb_middle'] = bb_20.bollinger_mavg()
    df['bb_lower'] = bb_20.bollinger_lband()
    df['bb_width'] = bb_20.bollinger_wband()
    df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
    
    # Bollinger Bands بفترات مختلفة
    bb_10 = ta.volatility.BollingerBands(df['close'], window=10, window_dev=1.5)
    df['bb_upper_10'] = bb_10.bollinger_hband()
    df['bb_lower_10'] = bb_10.bollinger_lband()
    
    # Keltner Channels
    kc = ta.volatility.KeltnerChannel(df['high'], df['low'], df['close'])
    df['kc_upper'] = kc.keltner_channel_hband()
    df['kc_middle'] = kc.keltner_channel_mband()
    df['kc_lower'] = kc.keltner_channel_lband()
    
    # Average True Range
    df['atr'] = ta.volatility.AverageTrueRange(df['high'], df['low'], df['close']).average_true_range()
    
    # Donchian Channels
    dc = ta.volatility.DonchianChannel(df['high'], df['low'], df['close'])
    df['dc_upper'] = dc.donchian_channel_hband()
    df['dc_middle'] = dc.donchian_channel_mband()
    df['dc_lower'] = dc.donchian_channel_lband()
    
    # === مؤشرات الحجم المتقدمة ===
    # On Balance Volume
    df['obv'] = ta.volume.OnBalanceVolumeIndicator(df['close'], df['volume']).on_balance_volume()
    
    # Volume Price Trend
    df['vpt'] = ta.volume.VolumePriceTrendIndicator(df['close'], df['volume']).volume_price_trend()
    
    # Accumulation Distribution Line
    df['ad'] = ta.volume.AccDistIndexIndicator(df['high'], df['low'], df['close'], df['volume']).acc_dist_index()
    
    # Chaikin Money Flow
    df['cmf'] = ta.volume.ChaikinMoneyFlowIndicator(df['high'], df['low'], df['close'], df['volume']).chaikin_money_flow()
    
    # Volume Weighted Average Price
    df['vwap'] = calculate_vwap(df['close'], df['volume'])
    
    # === مؤشرات إحصائية متقدمة ===
    # Z-Score للأسعار
    df['price_zscore'] = calculate_zscore(df['close'], 20)
    df['volume_zscore'] = calculate_zscore(df['volume'], 20)
    
    # Linear Regression
    df['lr_slope_10'] = calculate_linear_regression_slope(df['close'], 10)
    df['lr_slope_20'] = calculate_linear_regression_slope(df['close'], 20)
    df['lr_r2_10'] = calculate_linear_regression_r2(df['close'], 10)
    df['lr_r2_20'] = calculate_linear_regression_r2(df['close'], 20)
    
    # Standard Deviation
    df['std_10'] = df['close'].rolling(10).std()
    df['std_20'] = df['close'].rolling(20).std()
    df['std_50'] = df['close'].rolling(50).std()
    
    # Coefficient of Variation
    df['cv_10'] = df['std_10'] / df['close'].rolling(10).mean()
    df['cv_20'] = df['std_20'] / df['close'].rolling(20).mean()
    
    # === مؤشرات السوق النفسية ===
    # Fear & Greed Index (مبسط)
    df['fear_greed'] = calculate_fear_greed_index(df)
    
    # Market Regime (Bull/Bear/Sideways)
    df['market_regime'] = calculate_market_regime(df['close'])
    
    # Support & Resistance Levels
    support_resistance = calculate_support_resistance(df['close'])
    df['support_level'] = support_resistance['support']
    df['resistance_level'] = support_resistance['resistance']
    df['distance_to_support'] = (df['close'] - df['support_level']) / df['close']
    df['distance_to_resistance'] = (df['resistance_level'] - df['close']) / df['close']
    
    # === مؤشرات العلاقات والنسب ===
    # Price-Volume Relationships
    df['pv_trend'] = calculate_price_volume_trend(df['close'], df['volume'])
    df['volume_ma_ratio'] = df['volume'] / df['volume'].rolling(20).mean()
    
    # Moving Average Relationships
    df['ema_5_21_ratio'] = df['ema_5'] / df['ema_21']
    df['ema_21_50_ratio'] = df['ema_21'] / df['ema_50']
    df['ema_50_200_ratio'] = df['ema_50'] / df['ema_200']
    
    # RSI Relationships
    df['rsi_7_14_diff'] = df['rsi_7'] - df['rsi_14']
    df['rsi_divergence'] = calculate_rsi_divergence(df['close'], df['rsi_14'])
    
    # === ميزات تطورية (Lagged Features) ===
    # Price changes
    for lag in [1, 2, 3, 5, 10]:
        df[f'price_change_{lag}'] = df['close'].pct_change(lag)
        df[f'volume_change_{lag}'] = df['volume'].pct_change(lag)
        df[f'rsi_change_{lag}'] = df['rsi_14'].diff(lag)
    
    # === ميزات دورية (Cyclical Features) ===
    # Time-based features
    df['hour_sin'] = np.sin(2 * np.pi * (np.arange(len(df)) % 24) / 24)
    df['hour_cos'] = np.cos(2 * np.pi * (np.arange(len(df)) % 24) / 24)
    df['day_sin'] = np.sin(2 * np.pi * (np.arange(len(df)) // 24 % 7) / 7)
    df['day_cos'] = np.cos(2 * np.pi * (np.arange(len(df)) // 24 % 7) / 7)
    
    # === فلترة الضوضاء ===
    # Savitzky-Golay Filter
    from scipy.signal import savgol_filter
    if len(df) > 51:
        df['price_filtered'] = savgol_filter(df['close'], 51, 3)
        df['price_noise'] = df['close'] - df['price_filtered']
    
    # === تنظيف البيانات ===
    # إزالة القيم اللانهائية والشاذة
    df = df.replace([np.inf, -np.inf], np.nan)
    
    # ملء القيم المفقودة
    df = df.bfill().ffill()
    
    # إزالة الأعمدة ذات التباين المنخفض
    df = remove_low_variance_features(df)
    
    return df

def calculate_hull_ma(series: pd.Series, period: int) -> pd.Series:
    """حساب Hull Moving Average"""
    try:
        wma_half = series.rolling(int(period/2)).apply(lambda x: np.average(x, weights=range(1, len(x)+1)))
        wma_full = series.rolling(period).apply(lambda x: np.average(x, weights=range(1, len(x)+1)))
        raw_hma = 2 * wma_half - wma_full
        hma = raw_hma.rolling(int(np.sqrt(period))).apply(lambda x: np.average(x, weights=range(1, len(x)+1)))
        return hma
    except:
        return pd.Series(index=series.index)

def calculate_vwap(prices: pd.Series, volumes: pd.Series) -> pd.Series:
    """حساب Volume Weighted Average Price"""
    return (prices * volumes).cumsum() / volumes.cumsum()

def calculate_zscore(series: pd.Series, window: int) -> pd.Series:
    """حساب Z-Score"""
    return (series - series.rolling(window).mean()) / series.rolling(window).std()

def calculate_linear_regression_slope(series: pd.Series, window: int) -> pd.Series:
    """حساب ميل الانحدار الخطي"""
    def get_slope(y):
        if len(y) < 2:
            return 0
        x = np.arange(len(y))
        slope, _, _, _, _ = stats.linregress(x, y)
        return slope
    
    return series.rolling(window).apply(get_slope)

def calculate_linear_regression_r2(series: pd.Series, window: int) -> pd.Series:
    """حساب R-squared للانحدار الخطي"""
    def get_r2(y):
        if len(y) < 2:
            return 0
        x = np.arange(len(y))
        _, _, r_value, _, _ = stats.linregress(x, y)
        return r_value ** 2
    
    return series.rolling(window).apply(get_r2)

def calculate_fear_greed_index(df: pd.DataFrame) -> pd.Series:
    """حساب مؤشر الخوف والجشع المبسط"""
    # مبني على RSI, volatility, momentum
    rsi_score = (100 - df['rsi_14']) / 100  # كلما قل RSI، كلما زاد الخوف
    vol_score = 1 - (df['std_20'] / df['close'].rolling(20).mean())  # كلما زاد التقلب، كلما زاد الخوف
    momentum_score = (df['close'] / df['close'].shift(20) - 1).clip(-0.5, 0.5) + 0.5
    
    fear_greed = (rsi_score + vol_score + momentum_score) / 3 * 100
    return fear_greed.fillna(50)

def calculate_market_regime(prices: pd.Series) -> pd.Series:
    """تحديد نظام السوق (Bull/Bear/Sideways)"""
    # مبني على المتوسطات المتحركة والاتجاه
    ma_20 = prices.rolling(20).mean()
    ma_50 = prices.rolling(50).mean()
    
    conditions = [
        (prices > ma_20) & (ma_20 > ma_50) & (ma_20 > ma_20.shift(5)),
        (prices < ma_20) & (ma_20 < ma_50) & (ma_20 < ma_20.shift(5))
    ]
    choices = [2, 0]  # 2 = Bull, 0 = Bear, 1 = Sideways (default)
    
    return pd.Series(np.select(conditions, choices, default=1), index=prices.index)

def calculate_support_resistance(prices: pd.Series, window: int = 20) -> Dict[str, pd.Series]:
    """حساب مستويات الدعم والمقاومة"""
    rolling_min = prices.rolling(window, center=True).min()
    rolling_max = prices.rolling(window, center=True).max()
    
    return {
        'support': rolling_min.fillna(method='bfill').fillna(method='ffill'),
        'resistance': rolling_max.fillna(method='bfill').fillna(method='ffill')
    }

def calculate_price_volume_trend(prices: pd.Series, volumes: pd.Series) -> pd.Series:
    """حساب اتجاه السعر والحجم"""
    price_change = prices.pct_change()
    volume_change = volumes.pct_change()
    
    # 1 = both up, -1 = both down, 0 = divergence
    conditions = [
        (price_change > 0) & (volume_change > 0),
        (price_change < 0) & (volume_change < 0)
    ]
    choices = [1, -1]
    
    return pd.Series(np.select(conditions, choices, default=0), index=prices.index)

def calculate_rsi_divergence(prices: pd.Series, rsi: pd.Series, window: int = 14) -> pd.Series:
    """حساب تباعد RSI"""
    price_trend = calculate_linear_regression_slope(prices, window)
    rsi_trend = calculate_linear_regression_slope(rsi, window)
    
    # Divergence when price and RSI move in opposite directions
    divergence = np.sign(price_trend) != np.sign(rsi_trend)
    return pd.Series(divergence.astype(int), index=prices.index)

def remove_low_variance_features(df: pd.DataFrame, threshold: float = 0.01) -> pd.DataFrame:
    """إزالة الميزات ذات التباين المنخفض"""
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    variances = df[numeric_cols].var()
    
    # الاحتفاظ بالميزات ذات التباين العالي
    high_var_cols = variances[variances > threshold].index
    
    # الاحتفاظ بالأعمدة غير الرقمية أيضاً
    non_numeric_cols = df.select_dtypes(exclude=[np.number]).columns
    
    return df[list(high_var_cols) + list(non_numeric_cols)]

def select_best_features(df: pd.DataFrame, target: pd.Series, max_features: int = 50) -> List[str]:
    """اختيار أفضل الميزات باستخدام طرق إحصائية"""
    from sklearn.feature_selection import SelectKBest, f_regression, mutual_info_regression
    from sklearn.ensemble import RandomForestRegressor
    
    # إزالة الأعمدة غير الرقمية
    numeric_df = df.select_dtypes(include=[np.number])
    
    # إزالة القيم المفقودة
    valid_indices = ~(target.isna() | numeric_df.isna().any(axis=1))
    X_clean = numeric_df[valid_indices]
    y_clean = target[valid_indices]
    
    if len(X_clean) < 10 or X_clean.shape[1] == 0:
        return list(numeric_df.columns[:max_features])
    
    try:
        # طريقة 1: F-score
        f_selector = SelectKBest(score_func=f_regression, k=min(max_features//2, X_clean.shape[1]))
        f_selector.fit(X_clean, y_clean)
        f_features = X_clean.columns[f_selector.get_support()].tolist()
        
        # طريقة 2: Mutual Information
        mi_selector = SelectKBest(score_func=mutual_info_regression, k=min(max_features//2, X_clean.shape[1]))
        mi_selector.fit(X_clean, y_clean)
        mi_features = X_clean.columns[mi_selector.get_support()].tolist()
        
        # طريقة 3: Random Forest Feature Importance
        rf = RandomForestRegressor(n_estimators=50, random_state=42)
        rf.fit(X_clean, y_clean)
        feature_importance = pd.Series(rf.feature_importances_, index=X_clean.columns)
        rf_features = feature_importance.nlargest(max_features//2).index.tolist()
        
        # دمج النتائج
        selected_features = list(set(f_features + mi_features + rf_features))
        return selected_features[:max_features]
        
    except Exception as e:
        print(f"خطأ في اختيار الميزات: {e}")
        return list(numeric_df.columns[:max_features])

def create_feature_importance_report(df: pd.DataFrame, target: pd.Series) -> Dict[str, Any]:
    """إنشاء تقرير أهمية الميزات"""
    selected_features = select_best_features(df, target)
    
    return {
        'total_features_generated': df.shape[1],
        'selected_features': len(selected_features),
        'top_features': selected_features[:20],
        'feature_categories': {
            'trend_indicators': [f for f in selected_features if any(x in f for x in ['ema', 'sma', 'hma', 'adx'])],
            'momentum_indicators': [f for f in selected_features if any(x in f for x in ['rsi', 'stoch', 'williams', 'roc'])],
            'volatility_indicators': [f for f in selected_features if any(x in f for x in ['bb', 'atr', 'kc', 'std'])],
            'volume_indicators': [f for f in selected_features if any(x in f for x in ['obv', 'vpt', 'cmf', 'vwap'])],
            'statistical_features': [f for f in selected_features if any(x in f for x in ['zscore', 'lr_', 'cv_'])],
            'relationship_features': [f for f in selected_features if any(x in f for x in ['ratio', 'diff', 'change'])]
        },
        'noise_reduction_applied': True,
        'feature_selection_methods': ['F-score', 'Mutual Information', 'Random Forest Importance']
    }
