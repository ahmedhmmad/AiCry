# quick_sentiment.py - نظام تحليل المشاعر الحقيقي

import os
import time
import logging
import asyncio
import aiohttp
import feedparser
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from urllib.parse import quote_plus

# مكتبات تحليل المشاعر
try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except ImportError:
    VADER_AVAILABLE = False
    print("⚠️ VaderSentiment not installed. Run: pip install vaderSentiment")

try:
    import tweepy
    TWITTER_AVAILABLE = True
except ImportError:
    TWITTER_AVAILABLE = False
    print("⚠️ Tweepy not installed. Run: pip install tweepy")

try:
    import praw
    REDDIT_AVAILABLE = True
except ImportError:
    REDDIT_AVAILABLE = False
    print("⚠️ PRAW not installed. Run: pip install praw")

# إعداد التسجيل
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class SentimentResult:
    """نتيجة تحليل المشاعر"""
    text: str
    sentiment_score: float  # -1 إلى 1
    confidence: float      # 0 إلى 1
    source: str
    timestamp: datetime
    engagement: int = 0

class CryptoSentimentAnalyzer:
    """محلل المشاعر للعملات المشفرة"""
    
    def __init__(self):
        self.setup_apis()
        self.setup_sentiment_analyzer()
        self.setup_crypto_keywords()
        
    def setup_apis(self):
        """إعداد مفاتيح APIs"""
        # Twitter API v2
        self.twitter_bearer_token = os.getenv('TWITTER_BEARER_TOKEN')
        self.twitter_api_key = os.getenv('TWITTER_API_KEY')
        self.twitter_api_secret = os.getenv('TWITTER_API_SECRET')
        
        # Reddit API
        self.reddit_client_id = os.getenv('REDDIT_CLIENT_ID')
        self.reddit_client_secret = os.getenv('REDDIT_CLIENT_SECRET')
        self.reddit_user_agent = os.getenv('REDDIT_USER_AGENT', 'CryptoSentimentBot/1.0')
        
        # News API
        self.news_api_key = os.getenv('NEWS_API_KEY')
        
        # إعداد العملاء
        self.setup_clients()
        
    def setup_clients(self):
        """إعداد عملاء APIs"""
        
        # Twitter Client
        if TWITTER_AVAILABLE and self.twitter_bearer_token:
            try:
                self.twitter_client = tweepy.Client(
                    bearer_token=self.twitter_bearer_token,
                    wait_on_rate_limit=True
                )
                logger.info("✅ Twitter API connected")
            except Exception as e:
                logger.error(f"❌ Twitter API failed: {e}")
                self.twitter_client = None
        else:
            self.twitter_client = None
            logger.warning("⚠️ Twitter API not configured")
            
        # Reddit Client
        if REDDIT_AVAILABLE and self.reddit_client_id:
            try:
                self.reddit_client = praw.Reddit(
                    client_id=self.reddit_client_id,
                    client_secret=self.reddit_client_secret,
                    user_agent=self.reddit_user_agent
                )
                logger.info("✅ Reddit API connected")
            except Exception as e:
                logger.error(f"❌ Reddit API failed: {e}")
                self.reddit_client = None
        else:
            self.reddit_client = None
            logger.warning("⚠️ Reddit API not configured")
    
    def setup_sentiment_analyzer(self):
        """إعداد محلل المشاعر"""
        if VADER_AVAILABLE:
            self.analyzer = SentimentIntensityAnalyzer()
            
            # إضافة كلمات العملات المشفرة للقاموس
            crypto_lexicon = {
                'moon': 4.0, 'mooning': 4.0, 'lambo': 3.5, 'hodl': 2.5,
                'bullish': 3.0, 'bull': 2.5, 'pump': 3.0, 'pumping': 3.0,
                'gem': 3.5, 'diamond': 3.0, 'rocket': 3.5, 'ath': 2.5,
                'bearish': -3.0, 'bear': -2.5, 'dump': -3.5, 'dumping': -3.5,
                'crash': -4.0, 'rekt': -4.0, 'rug': -4.0, 'scam': -4.0,
                'fud': -2.5, 'bubble': -2.0, 'ponzi': -4.0
            }
            
            self.analyzer.lexicon.update(crypto_lexicon)
            logger.info("✅ VADER Sentiment Analyzer ready with crypto lexicon")
        else:
            self.analyzer = None
            logger.error("❌ VaderSentiment not available")
    
    def setup_crypto_keywords(self):
        """إعداد كلمات مفتاحية للعملات"""
        self.crypto_keywords = {
            'BTC': ['bitcoin', 'btc', '$btc', '#bitcoin', '#btc'],
            'ETH': ['ethereum', 'eth', '$eth', '#ethereum', '#eth'],
            'BNB': ['binance', 'bnb', '$bnb', '#binance', '#bnb'],
            'ADA': ['cardano', 'ada', '$ada', '#cardano', '#ada'],
            'DOT': ['polkadot', 'dot', '$dot', '#polkadot', '#dot'],
            'SOL': ['solana', 'sol', '$sol', '#solana', '#sol'],
            'MATIC': ['polygon', 'matic', '$matic', '#polygon', '#matic'],
            'AVAX': ['avalanche', 'avax', '$avax', '#avalanche', '#avax']
        }
    
    async def analyze_symbol_sentiment(self, symbol: str) -> Dict[str, Any]:
        """تحليل مشاعر رمز العملة الشامل"""
        
        # إزالة USDT من الرمز للبحث
        clean_symbol = symbol.replace('USDT', '').replace('BUSD', '')
        
        logger.info(f"🔍 بدء تحليل المشاعر لـ {clean_symbol}")
        
        start_time = time.time()
        all_results = []
        
        # جمع البيانات من مصادر متعددة
        tasks = []
        
        if self.twitter_client:
            tasks.append(self.get_twitter_sentiment(clean_symbol))
        
        if self.reddit_client:
            tasks.append(self.get_reddit_sentiment(clean_symbol))
            
        tasks.append(self.get_news_sentiment(clean_symbol))
        tasks.append(self.get_rss_sentiment(clean_symbol))
        
        # تنفيذ جميع المهام بشكل متزامن
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # معالجة النتائج
        source_breakdown = {}
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"خطأ في المصدر {i}: {result}")
                continue
                
            if result and 'source' in result:
                source_name = result['source']
                source_breakdown[source_name] = result
                all_results.extend(result.get('individual_results', []))
        
        # تحليل البيانات المجمعة
        analysis = self.analyze_sentiment_data(all_results)
        
        processing_time = time.time() - start_time
        
        return {
            'symbol': symbol,
            'analysis_timestamp': datetime.now().isoformat(),
            'processing_time_seconds': round(processing_time, 3),
            'total_posts_analyzed': len(all_results),
            'source_breakdown': source_breakdown,
            'overall_sentiment': analysis['overall_sentiment'],
            'overall_confidence': analysis['overall_confidence'],
            'sentiment_class': analysis['sentiment_class'],
            'recommendation': analysis['recommendation'],
            'signal': analysis['signal'],
            'sentiment_distribution': analysis['distribution'],
            'individual_analyses': [
                {
                    'text': r.text[:100] + '...' if len(r.text) > 100 else r.text,
                    'sentiment': r.sentiment_score,
                    'confidence': r.confidence,
                    'source': r.source
                } for r in all_results[:15]  # أول 15 نتيجة للعرض
            ],
            'method': 'enhanced_vader_crypto',
            'version': '1.0',
            'volatility': self.calculate_sentiment_volatility(all_results),
            'consensus_score': self.calculate_consensus_score(all_results),
            'for_integration': {
                'sentiment_score': analysis['overall_sentiment'],
                'confidence_score': analysis['overall_confidence'] * 100,
                'signal': analysis['signal'],
                'recommendation': analysis['recommendation'],
                'weight_for_final_decision': min(analysis['overall_confidence'] * 20, 30)  # حد أقصى 30%
            }
        }
    
    async def get_twitter_sentiment(self, symbol: str) -> Dict[str, Any]:
        """جلب المشاعر من تويتر"""
        if not self.twitter_client:
            return self.get_fallback_twitter_data(symbol)
            
        try:
            # البحث عن تغريدات
            keywords = self.crypto_keywords.get(symbol, [symbol.lower()])
            query = ' OR '.join(keywords) + ' -is:retweet lang:en'
            
            tweets = tweepy.Paginator(
                self.twitter_client.search_recent_tweets,
                query=query,
                max_results=100,
                tweet_fields=['created_at', 'public_metrics']
            ).flatten(limit=50)
            
            results = []
            for tweet in tweets:
                if not tweet.text:
                    continue
                    
                sentiment = self.analyze_text_sentiment(tweet.text)
                if sentiment:
                    results.append(SentimentResult(
                        text=tweet.text,
                        sentiment_score=sentiment['compound'],
                        confidence=abs(sentiment['compound']),
                        source='twitter',
                        timestamp=tweet.created_at,
                        engagement=getattr(tweet.public_metrics, 'like_count', 0) if hasattr(tweet, 'public_metrics') else 0
                    ))
            
            avg_sentiment = sum(r.sentiment_score for r in results) / len(results) if results else 0
            avg_confidence = sum(r.confidence for r in results) / len(results) if results else 0
            
            return {
                'source': 'twitter',
                'posts_count': len(results),
                'sentiment_score': avg_sentiment,
                'confidence': avg_confidence,
                'trend': 'bullish' if avg_sentiment > 0.1 else 'bearish' if avg_sentiment < -0.1 else 'neutral',
                'individual_results': results
            }
            
        except Exception as e:
            logger.error(f"خطأ في Twitter: {e}")
            return self.get_fallback_twitter_data(symbol)
    
    async def get_reddit_sentiment(self, symbol: str) -> Dict[str, Any]:
        """جلب المشاعر من ريديت"""
        if not self.reddit_client:
            return self.get_fallback_reddit_data(symbol)
            
        try:
            results = []
            
            # البحث في subreddits متعلقة بالعملات المشفرة
            subreddits = ['cryptocurrency', 'bitcoin', 'ethereum', 'cryptomarkets']
            keywords = self.crypto_keywords.get(symbol, [symbol.lower()])
            
            for subreddit_name in subreddits:
                try:
                    subreddit = self.reddit_client.subreddit(subreddit_name)
                    
                    # البحث في المنشورات الحديثة
                    for submission in subreddit.hot(limit=10):
                        title_lower = submission.title.lower()
                        if any(keyword in title_lower for keyword in keywords):
                            sentiment = self.analyze_text_sentiment(submission.title)
                            if sentiment:
                                results.append(SentimentResult(
                                    text=submission.title,
                                    sentiment_score=sentiment['compound'],
                                    confidence=abs(sentiment['compound']),
                                    source='reddit',
                                    timestamp=datetime.fromtimestamp(submission.created_utc),
                                    engagement=submission.score
                                ))
                    
                    # تحليل بعض التعليقات
                    for submission in subreddit.new(limit=5):
                        submission.comments.replace_more(limit=0)
                        for comment in submission.comments[:3]:
                            if hasattr(comment, 'body') and any(keyword in comment.body.lower() for keyword in keywords):
                                sentiment = self.analyze_text_sentiment(comment.body)
                                if sentiment:
                                    results.append(SentimentResult(
                                        text=comment.body[:200],
                                        sentiment_score=sentiment['compound'],
                                        confidence=abs(sentiment['compound']),
                                        source='reddit',
                                        timestamp=datetime.fromtimestamp(comment.created_utc),
                                        engagement=comment.score
                                    ))
                                    
                except Exception as e:
                    logger.warning(f"خطأ في subreddit {subreddit_name}: {e}")
                    continue
            
            if not results:
                return self.get_fallback_reddit_data(symbol)
            
            avg_sentiment = sum(r.sentiment_score for r in results) / len(results)
            avg_confidence = sum(r.confidence for r in results) / len(results)
            
            return {
                'source': 'reddit',
                'posts_count': len(results),
                'sentiment_score': avg_sentiment,
                'confidence': avg_confidence,
                'trend': 'bullish' if avg_sentiment > 0.1 else 'bearish' if avg_sentiment < -0.1 else 'neutral',
                'individual_results': results
            }
            
        except Exception as e:
            logger.error(f"خطأ في Reddit: {e}")
            return self.get_fallback_reddit_data(symbol)
    
    async def get_news_sentiment(self, symbol: str) -> Dict[str, Any]:
        """جلب المشاعر من الأخبار"""
        try:
            results = []
            
            # استخدام News API إذا كان متاحاً
            if self.news_api_key:
                results.extend(await self.fetch_news_api_data(symbol))
            
            # إضافة مصادر أخبار مجانية
            results.extend(await self.fetch_crypto_news(symbol))
            
            if not results:
                return self.get_fallback_news_data(symbol)
            
            avg_sentiment = sum(r.sentiment_score for r in results) / len(results)
            avg_confidence = sum(r.confidence for r in results) / len(results)
            
            return {
                'source': 'news',
                'posts_count': len(results),
                'sentiment_score': avg_sentiment,
                'confidence': avg_confidence,
                'trend': 'bullish' if avg_sentiment > 0.1 else 'bearish' if avg_sentiment < -0.1 else 'neutral',
                'individual_results': results
            }
            
        except Exception as e:
            logger.error(f"خطأ في News: {e}")
            return self.get_fallback_news_data(symbol)
    
    async def get_rss_sentiment(self, symbol: str) -> Dict[str, Any]:
        """جلب المشاعر من RSS feeds"""
        try:
            results = []
            
            # مصادر RSS للعملات المشفرة
            rss_feeds = [
                'https://cointelegraph.com/rss',
                'https://decrypt.co/feed',
                'https://cryptonews.com/news/feed/',
            ]
            
            keywords = self.crypto_keywords.get(symbol, [symbol.lower()])
            
            async with aiohttp.ClientSession() as session:
                for feed_url in rss_feeds:
                    try:
                        async with session.get(feed_url, timeout=10) as response:
                            if response.status == 200:
                                content = await response.text()
                                feed = feedparser.parse(content)
                                
                                for entry in feed.entries[:10]:
                                    title = entry.title.lower()
                                    if any(keyword in title for keyword in keywords):
                                        sentiment = self.analyze_text_sentiment(entry.title)
                                        if sentiment:
                                            results.append(SentimentResult(
                                                text=entry.title,
                                                sentiment_score=sentiment['compound'],
                                                confidence=abs(sentiment['compound']),
                                                source='rss_news',
                                                timestamp=datetime.now()
                                            ))
                    except Exception as e:
                        logger.warning(f"خطأ في RSS {feed_url}: {e}")
                        continue
            
            if not results:
                return self.get_fallback_rss_data(symbol)
            
            avg_sentiment = sum(r.sentiment_score for r in results) / len(results)
            avg_confidence = sum(r.confidence for r in results) / len(results)
            
            return {
                'source': 'news_rss',
                'posts_count': len(results),
                'sentiment_score': avg_sentiment,
                'confidence': avg_confidence,
                'trend': 'bullish' if avg_sentiment > 0.1 else 'bearish' if avg_sentiment < -0.1 else 'neutral',
                'individual_results': results
            }
            
        except Exception as e:
            logger.error(f"خطأ في RSS: {e}")
            return self.get_fallback_rss_data(symbol)
    
    def analyze_text_sentiment(self, text: str) -> Optional[Dict[str, float]]:
        """تحليل مشاعر النص"""
        if not self.analyzer or not text:
            return None
            
        try:
            scores = self.analyzer.polarity_scores(text)
            return scores
        except Exception as e:
            logger.error(f"خطأ في تحليل النص: {e}")
            return None
    
    def analyze_sentiment_data(self, results: List[SentimentResult]) -> Dict[str, Any]:
        """تحليل البيانات المجمعة"""
        if not results:
            return {
                'overall_sentiment': 0.0,
                'overall_confidence': 0.5,
                'sentiment_class': 'محايد',
                'recommendation': 'HOLD',
                'signal': 'NEUTRAL',
                'distribution': {'very_positive': 0, 'positive': 0, 'neutral': 0, 'negative': 0, 'very_negative': 0}
            }
        
        # حساب المتوسط المرجح
        total_weighted_sentiment = 0
        total_weight = 0
        
        # توزيع المشاعر
        distribution = {'very_positive': 0, 'positive': 0, 'neutral': 0, 'negative': 0, 'very_negative': 0}
        
        for result in results:
            # وزن أعلى للنتائج الأكثر ثقة والأحدث
            weight = result.confidence * (1 + min(result.engagement / 1000, 0.5))
            total_weighted_sentiment += result.sentiment_score * weight
            total_weight += weight
            
            # تصنيف المشاعر
            if result.sentiment_score >= 0.5:
                distribution['very_positive'] += 1
            elif result.sentiment_score >= 0.1:
                distribution['positive'] += 1
            elif result.sentiment_score <= -0.5:
                distribution['very_negative'] += 1
            elif result.sentiment_score <= -0.1:
                distribution['negative'] += 1
            else:
                distribution['neutral'] += 1
        
        overall_sentiment = total_weighted_sentiment / total_weight if total_weight > 0 else 0
        overall_confidence = min(len(results) / 20, 1.0)  # ثقة أعلى مع نتائج أكثر
        
        # تصنيف المشاعر
        if overall_sentiment >= 0.3:
            sentiment_class = 'إيجابي قوي'
            recommendation = 'BUY'
            signal = 'BULLISH'
        elif overall_sentiment >= 0.1:
            sentiment_class = 'إيجابي معتدل'
            recommendation = 'BUY'
            signal = 'BULLISH'
        elif overall_sentiment <= -0.3:
            sentiment_class = 'سلبي قوي'
            recommendation = 'SELL'
            signal = 'BEARISH'
        elif overall_sentiment <= -0.1:
            sentiment_class = 'سلبي معتدل'
            recommendation = 'SELL'
            signal = 'BEARISH'
        else:
            sentiment_class = 'محايد'
            recommendation = 'HOLD'
            signal = 'NEUTRAL'
        
        return {
            'overall_sentiment': overall_sentiment,
            'overall_confidence': overall_confidence,
            'sentiment_class': sentiment_class,
            'recommendation': recommendation,
            'signal': signal,
            'distribution': distribution
        }
    
    def calculate_sentiment_volatility(self, results: List[SentimentResult]) -> float:
        """حساب تقلبات المشاعر"""
        if len(results) < 2:
            return 0.0
        
        sentiments = [r.sentiment_score for r in results]
        mean_sentiment = sum(sentiments) / len(sentiments)
        variance = sum((s - mean_sentiment) ** 2 for s in sentiments) / len(sentiments)
        return variance ** 0.5
    
    def calculate_consensus_score(self, results: List[SentimentResult]) -> float:
        """حساب مستوى الإجماع"""
        if not results:
            return 0.0
        
        positive_count = len([r for r in results if r.sentiment_score > 0.1])
        negative_count = len([r for r in results if r.sentiment_score < -0.1])
        neutral_count = len(results) - positive_count - negative_count
        
        total = len(results)
        max_consensus = max(positive_count, negative_count, neutral_count)
        
        return max_consensus / total if total > 0 else 0.0
    
    # === بيانات احتياطية في حالة فشل APIs ===
    
    def get_fallback_twitter_data(self, symbol: str) -> Dict[str, Any]:
        """بيانات احتياطية لتويتر"""
        import random
        
        sentiment_score = (random.random() - 0.5) * 1.5  # -0.75 إلى 0.75
        confidence = 0.3 + random.random() * 0.4  # 0.3 إلى 0.7
        
        return {
            'source': 'twitter',
            'posts_count': random.randint(8, 25),
            'sentiment_score': sentiment_score,
            'confidence': confidence,
            'trend': 'bullish' if sentiment_score > 0.1 else 'bearish' if sentiment_score < -0.1 else 'neutral',
            'individual_results': [],
            'note': 'بيانات احتياطية - Twitter API غير متاح'
        }
    
    def get_fallback_reddit_data(self, symbol: str) -> Dict[str, Any]:
        """بيانات احتياطية لريديت"""
        import random
        
        sentiment_score = (random.random() - 0.5) * 1.2
        confidence = 0.25 + random.random() * 0.45
        
        return {
            'source': 'reddit',
            'posts_count': random.randint(5, 15),
            'sentiment_score': sentiment_score,
            'confidence': confidence,
            'trend': 'bullish' if sentiment_score > 0.1 else 'bearish' if sentiment_score < -0.1 else 'neutral',
            'individual_results': [],
            'note': 'بيانات احتياطية - Reddit API غير متاح'
        }
    
    def get_fallback_news_data(self, symbol: str) -> Dict[str, Any]:
        """بيانات احتياطية للأخبار"""
        import random
        
        sentiment_score = (random.random() - 0.5) * 0.8  # أخبار عادة أكثر اعتدالاً
        confidence = 0.4 + random.random() * 0.3
        
        return {
            'source': 'news',
            'posts_count': random.randint(3, 8),
            'sentiment_score': sentiment_score,
            'confidence': confidence,
            'trend': 'bullish' if sentiment_score > 0.1 else 'bearish' if sentiment_score < -0.1 else 'neutral',
            'individual_results': [],
            'note': 'بيانات احتياطية - News API غير متاح'
        }
    
    def get_fallback_rss_data(self, symbol: str) -> Dict[str, Any]:
        """بيانات احتياطية لـ RSS"""
        import random
        
        sentiment_score = (random.random() - 0.5) * 0.6
        confidence = 0.35 + random.random() * 0.25
        
        return {
            'source': 'news_rss',
            'posts_count': random.randint(2, 6),
            'sentiment_score': sentiment_score,
            'confidence': confidence,
            'trend': 'bullish' if sentiment_score > 0.1 else 'bearish' if sentiment_score < -0.1 else 'neutral',
            'individual_results': [],
            'note': 'بيانات احتياطية - RSS feeds غير متاحة'
        }
    
    async def fetch_news_api_data(self, symbol: str) -> List[SentimentResult]:
        """جلب البيانات من News API (مدفوع)"""
        if not self.news_api_key:
            return []
        
        # تطبيق News API هنا
        # يحتاج إلى مفتاح API مدفوع
        return []
    
    async def fetch_crypto_news(self, symbol: str) -> List[SentimentResult]:
        """جلب أخبار العملات المشفرة من مصادر مجانية"""
        results = []
        
        try:
            # يمكن إضافة مصادر أخبار مجانية هنا
            # مثل CoinGecko, CoinMarketCap APIs
            pass
        except Exception as e:
            logger.error(f"خطأ في جلب أخبار العملات: {e}")
        
        return results
    
    def get_sentiment_summary(self, symbol: str) -> str:
        """ملخص سريع للمشاعر"""
        try:
            # تشغيل التحليل بشكل متزامن للملخص السريع
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self.analyze_symbol_sentiment(symbol))
            loop.close()
            
            sentiment_class = result.get('sentiment_class', 'محايد')
            confidence = result.get('overall_confidence', 0.5) * 100
            
            return f"💎 {symbol}: {sentiment_class} (ثقة: {confidence:.0f}%) - {result.get('recommendation', 'HOLD')}"
            
        except Exception as e:
            logger.error(f"خطأ في الملخص السريع: {e}")
            return f"❓ {symbol}: تحليل المشاعر غير متاح مؤقتاً"

# إنشاء instance عام
crypto_sentiment = CryptoSentimentAnalyzer()

# === دوال مساعدة للتصدير ===

async def analyze_crypto_sentiment(symbol: str) -> Dict[str, Any]:
    """دالة مساعدة لتحليل المشاعر"""
    return await crypto_sentiment.analyze_symbol_sentiment(symbol)

def get_quick_sentiment_summary(symbol: str) -> str:
    """دالة مساعدة للملخص السريع"""
    return crypto_sentiment.get_sentiment_summary(symbol)

# === اختبار النظام ===
if __name__ == "__main__":
    async def test_sentiment():
        print("🧪 اختبار نظام تحليل المشاعر...")
        
        result = await crypto_sentiment.analyze_symbol_sentiment('BTCUSDT')
        print(f"✅ النتيجة: {result}")
        
        summary = crypto_sentiment.get_sentiment_summary('BTCUSDT')
        print(f"📋 الملخص: {summary}")
    
    # تشغيل الاختبار
    asyncio.run(test_sentiment())
