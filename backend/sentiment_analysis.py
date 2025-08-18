# sentiment_analysis.py - نسخة تستخدم API Keys حقيقية
import os
import logging
import time
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json
import asyncio
from dotenv import load_dotenv

# تحميل متغيرات البيئة
load_dotenv()

# إعداد logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RealSentimentAnalyzer:
    def __init__(self):
        self.twitter_client = None
        self.reddit_client = None
        self.news_client = None
        self.telegram_client = None
        self.vader_analyzer = None

        # إعداد الذاكرة المؤقتة
        self.cache = {}
        self.cache_duration = 300  # 5 دقائق

        # تهيئة جميع الخدمات
        self._initialize_services()

    def _initialize_services(self):
        """تهيئة جميع خدمات API"""
        logger.info("🚀 Initializing real sentiment analysis services...")

        # تهيئة VaderSentiment
        self._init_vader()

        # تهيئة Twitter API
        self._init_twitter()

        # تهيئة Reddit API
        self._init_reddit()

        # تهيئة News API
        self._init_news()

        # تهيئة Telegram Bot
        self._init_telegram()

    def _init_vader(self):
        """تهيئة VaderSentiment"""
        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            self.vader_analyzer = SentimentIntensityAnalyzer()
            logger.info("✅ VaderSentiment initialized successfully")
        except ImportError:
            logger.warning("⚠️ VaderSentiment not available")
            self.vader_analyzer = None

    def _init_twitter(self):
        """تهيئة Twitter API"""
        try:
            # قراءة مفاتيح Twitter من .env
            api_key = os.getenv('TWITTER_API_KEY')
            api_secret = os.getenv('TWITTER_API_SECRET')
            access_token = os.getenv('TWITTER_ACCESS_TOKEN')
            access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
            bearer_token = os.getenv('TWITTER_BEARER_TOKEN')

            if all([api_key, api_secret, access_token, access_token_secret]):
                import tweepy

                # تهيئة Twitter API v2
                self.twitter_client = tweepy.Client(
                    bearer_token=bearer_token,
                    consumer_key=api_key,
                    consumer_secret=api_secret,
                    access_token=access_token,
                    access_token_secret=access_token_secret,
                    wait_on_rate_limit=True
                )

                # اختبار الاتصال
                me = self.twitter_client.get_me()
                logger.info(f"✅ Twitter API initialized successfully - Connected as: {me.data.username}")

            else:
                logger.warning("⚠️ Twitter API keys not found in .env file")
                self.twitter_client = None

        except Exception as e:
            logger.error(f"❌ Twitter API initialization failed: {e}")
            self.twitter_client = None

    def _init_reddit(self):
        """تهيئة Reddit API"""
        try:
            # قراءة مفاتيح Reddit من .env
            client_id = os.getenv('REDDIT_CLIENT_ID')
            client_secret = os.getenv('REDDIT_CLIENT_SECRET')
            user_agent = os.getenv('REDDIT_USER_AGENT', 'CryptoSentimentBot/1.0')

            if all([client_id, client_secret]):
                import praw

                self.reddit_client = praw.Reddit(
                    client_id=client_id,
                    client_secret=client_secret,
                    user_agent=user_agent
                )

                # اختبار الاتصال
                test_sub = self.reddit_client.subreddit('cryptocurrency')
                logger.info(f"✅ Reddit API initialized successfully - Test subreddit: {test_sub.display_name}")

            else:
                logger.warning("⚠️ Reddit API keys not found in .env file")
                self.reddit_client = None

        except Exception as e:
            logger.error(f"❌ Reddit API initialization failed: {e}")
            self.reddit_client = None

    def _init_news(self):
        """تهيئة News API"""
        try:
            # قراءة مفتاح News API من .env
            api_key = os.getenv('NEWS_API_KEY')

            if api_key:
                from newsapi import NewsApiClient

                self.news_client = NewsApiClient(api_key=api_key)

                # اختبار الاتصال
                test_sources = self.news_client.get_sources()
                logger.info(f"✅ News API initialized successfully - Available sources: {len(test_sources['sources'])}")

            else:
                logger.warning("⚠️ News API key not found in .env file")
                self.news_client = None

        except Exception as e:
            logger.error(f"❌ News API initialization failed: {e}")
            self.news_client = None

    def _init_telegram(self):
        """تهيئة Telegram Bot"""
        try:
            # قراءة مفتاح Telegram Bot من .env
            bot_token = os.getenv('TELEGRAM_BOT_TOKEN')

            if bot_token:
                from telegram import Bot

                self.telegram_client = Bot(token=bot_token)
                logger.info("✅ Telegram Bot initialized successfully")

            else:
                logger.warning("⚠️ Telegram Bot token not found in .env file")
                self.telegram_client = None

        except Exception as e:
            logger.error(f"❌ Telegram Bot initialization failed: {e}")
            self.telegram_client = None

    def _is_cache_valid(self, cache_key: str) -> bool:
        """فحص صلاحية الذاكرة المؤقتة"""
        if cache_key in self.cache:
            data, timestamp = self.cache[cache_key]
            return time.time() - timestamp < self.cache_duration
        return False

    def _get_cached_data(self, cache_key: str):
        """استرداد البيانات من الذاكرة المؤقتة"""
        if cache_key in self.cache:
            return self.cache[cache_key][0]
        return None

    def _cache_data(self, cache_key: str, data: Any):
        """حفظ البيانات في الذاكرة المؤقتة"""
        self.cache[cache_key] = (data, time.time())

    async def fetch_twitter_sentiment(self, symbol: str) -> Dict[str, Any]:
        """جلب وتحليل مشاعر Twitter"""
        if not self.twitter_client:
            return {"error": "Twitter API not available"}

        try:
            # إزالة USDT من الرمز للبحث
            crypto_name = symbol.replace('USDT', '').replace('BUSD', '')

            # البحث عن التغريدات
            query = f"({crypto_name} OR ${crypto_name}) -is:retweet lang:en"

            tweets = tweepy.Paginator(
                self.twitter_client.search_recent_tweets,
                query=query,
                max_results=100,
                tweet_fields=['created_at', 'public_metrics']
            ).flatten(limit=100)

            # تحليل المشاعر
            sentiments = []
            total_engagement = 0

            for tweet in tweets:
                if tweet.text and self.vader_analyzer:
                    sentiment_scores = self.vader_analyzer.polarity_scores(tweet.text)
                    sentiments.append(sentiment_scores['compound'])

                    # حساب التفاعل
                    if hasattr(tweet, 'public_metrics'):
                        engagement = (
                                tweet.public_metrics.get('like_count', 0) +
                                tweet.public_metrics.get('retweet_count', 0) +
                                tweet.public_metrics.get('reply_count', 0)
                        )
                        total_engagement += engagement

            if not sentiments:
                return {"error": "No tweets found"}

            # حساب النتائج
            avg_sentiment = sum(sentiments) / len(sentiments)
            sentiment_score = round((avg_sentiment + 1) * 50, 1)  # تحويل من -1,1 إلى 0,100

            return {
                "source": "twitter",
                "sentiment_score": sentiment_score,
                "trend": "bullish" if avg_sentiment > 0.1 else "bearish" if avg_sentiment < -0.1 else "neutral",
                "posts_analyzed": len(sentiments),
                "total_engagement": total_engagement,
                "confidence": min(len(sentiments) * 2, 95),  # المزيد من التغريدات = ثقة أعلى
                "raw_sentiment": avg_sentiment
            }

        except Exception as e:
            logger.error(f"❌ Twitter sentiment analysis failed: {e}")
            return {"error": f"Twitter analysis failed: {str(e)}"}

    async def fetch_reddit_sentiment(self, symbol: str) -> Dict[str, Any]:
        """جلب وتحليل مشاعر Reddit"""
        if not self.reddit_client:
            return {"error": "Reddit API not available"}

        try:
            crypto_name = symbol.replace('USDT', '').replace('BUSD', '')

            # البحث في subreddits ذات الصلة
            subreddits = ['cryptocurrency', 'CryptoMarkets', 'Bitcoin', 'ethereum', 'altcoin']

            all_posts = []
            for subreddit_name in subreddits:
                try:
                    subreddit = self.reddit_client.subreddit(subreddit_name)

                    # البحث عن منشورات حديثة
                    for submission in subreddit.search(crypto_name, time_filter='week', limit=20):
                        if submission.title and submission.selftext:
                            text = f"{submission.title} {submission.selftext}"
                            all_posts.append({
                                'text': text,
                                'score': submission.score,
                                'comments': submission.num_comments,
                                'created': submission.created_utc
                            })

                except Exception as e:
                    logger.warning(f"Error accessing subreddit {subreddit_name}: {e}")
                    continue

            if not all_posts:
                return {"error": "No Reddit posts found"}

            # تحليل المشاعر
            sentiments = []
            total_score = 0
            total_comments = 0

            for post in all_posts:
                if self.vader_analyzer:
                    sentiment_scores = self.vader_analyzer.polarity_scores(post['text'])
                    sentiments.append(sentiment_scores['compound'])
                    total_score += post['score']
                    total_comments += post['comments']

            if not sentiments:
                return {"error": "No sentiment data"}

            avg_sentiment = sum(sentiments) / len(sentiments)
            sentiment_score = round((avg_sentiment + 1) * 50, 1)

            return {
                "source": "reddit",
                "sentiment_score": sentiment_score,
                "trend": "bullish" if avg_sentiment > 0.1 else "bearish" if avg_sentiment < -0.1 else "neutral",
                "posts_analyzed": len(sentiments),
                "total_score": total_score,
                "total_comments": total_comments,
                "confidence": min(len(sentiments) * 3, 95),
                "raw_sentiment": avg_sentiment
            }

        except Exception as e:
            logger.error(f"❌ Reddit sentiment analysis failed: {e}")
            return {"error": f"Reddit analysis failed: {str(e)}"}

    async def fetch_news_sentiment(self, symbol: str) -> Dict[str, Any]:
        """جلب وتحليل مشاعر الأخبار"""
        if not self.news_client:
            return {"error": "News API not available"}

        try:
            crypto_name = symbol.replace('USDT', '').replace('BUSD', '')

            # البحث عن الأخبار
            news = self.news_client.get_everything(
                q=f'"{crypto_name}" OR "cryptocurrency"',
                language='en',
                sort_by='publishedAt',
                from_param=(datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
                page_size=50
            )

            articles = news.get('articles', [])

            if not articles:
                return {"error": "No news articles found"}

            # تحليل المشاعر
            sentiments = []

            for article in articles:
                title = article.get('title', '')
                description = article.get('description', '')

                if title and self.vader_analyzer:
                    text = f"{title} {description}" if description else title
                    sentiment_scores = self.vader_analyzer.polarity_scores(text)
                    sentiments.append(sentiment_scores['compound'])

            if not sentiments:
                return {"error": "No sentiment data from news"}

            avg_sentiment = sum(sentiments) / len(sentiments)
            sentiment_score = round((avg_sentiment + 1) * 50, 1)

            return {
                "source": "news",
                "sentiment_score": sentiment_score,
                "trend": "bullish" if avg_sentiment > 0.1 else "bearish" if avg_sentiment < -0.1 else "neutral",
                "articles_analyzed": len(sentiments),
                "confidence": min(len(sentiments) * 4, 95),
                "raw_sentiment": avg_sentiment
            }

        except Exception as e:
            logger.error(f"❌ News sentiment analysis failed: {e}")
            return {"error": f"News analysis failed: {str(e)}"}

    async def get_comprehensive_sentiment(self, symbol: str) -> Dict[str, Any]:
        """تحليل شامل للمشاعر من جميع المصادر"""
        cache_key = f"comprehensive_{symbol}"

        # فحص الذاكرة المؤقتة
        if self._is_cache_valid(cache_key):
            logger.info(f"✅ Using cached comprehensive sentiment for {symbol}")
            return self._get_cached_data(cache_key)

        logger.info(f"🔄 Fetching real sentiment data for {symbol}")

        # جلب البيانات من جميع المصادر بشكل متوازي
        tasks = []

        if self.twitter_client:
            tasks.append(self.fetch_twitter_sentiment(symbol))

        if self.reddit_client:
            tasks.append(self.fetch_reddit_sentiment(symbol))

        if self.news_client:
            tasks.append(self.fetch_news_sentiment(symbol))

        # تنفيذ جميع المهام
        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
        except Exception as e:
            logger.error(f"❌ Error in comprehensive sentiment analysis: {e}")
            results = []

        # معالجة النتائج
        valid_results = []
        sources_data = {}

        for result in results:
            if isinstance(result, dict) and "error" not in result:
                valid_results.append(result)
                source_name = result.get("source", "unknown")
                sources_data[source_name] = result

        if not valid_results:
            # إرجاع بيانات تجريبية مع تحذير
            return self._generate_fallback_data(symbol, "No real data available from any source")

        # حساب المتوسط المرجح
        total_sentiment = 0
        total_weight = 0

        weights = {
            "twitter": 0.4,  # وزن أعلى لتويتر
            "reddit": 0.35,  # وزن متوسط لريديت
            "news": 0.25  # وزن أقل للأخبار
        }

        for result in valid_results:
            source = result.get("source", "unknown")
            sentiment = result.get("sentiment_score", 50)
            confidence = result.get("confidence", 50)

            weight = weights.get(source, 0.1) * (confidence / 100)
            total_sentiment += sentiment * weight
            total_weight += weight

        if total_weight == 0:
            return self._generate_fallback_data(symbol, "No weighted sentiment calculated")

        final_score = total_sentiment / total_weight

        # تحديد الاتجاه
        if final_score >= 60:
            trend = "bullish"
        elif final_score <= 40:
            trend = "bearish"
        else:
            trend = "neutral"

        # بناء النتيجة النهائية
        result = {
            "symbol": symbol,
            "overall_score": round(final_score, 1),
            "trend": trend,
            "confidence": round(min(total_weight * 100, 95), 1),
            "sources": sources_data,
            "analysis_type": "real_data_comprehensive",
            "timestamp": datetime.now().isoformat(),
            "cache_duration": self.cache_duration,
            "next_update": (datetime.now() + timedelta(seconds=self.cache_duration)).strftime("%H:%M:%S"),
            "sources_available": len(valid_results),
            "total_posts_analyzed": sum(r.get("posts_analyzed", 0) for r in valid_results)
        }

        # حفظ في الذاكرة المؤقتة
        self._cache_data(cache_key, result)

        logger.info(f"✅ Generated real comprehensive sentiment for {symbol}: {final_score:.1f} ({trend})")
        return result

    def _generate_fallback_data(self, symbol: str, reason: str) -> Dict[str, Any]:
        """توليد بيانات احتياطية مع سبب الفشل"""
        return {
            "symbol": symbol,
            "overall_score": 50,
            "trend": "neutral",
            "confidence": 30,
            "sources": {},
            "analysis_type": "fallback",
            "timestamp": datetime.now().isoformat(),
            "error_reason": reason,
            "note": "Real sentiment analysis failed - using fallback data"
        }

    # دوال للتوافق مع الواجهة الحالية
    def get_quick_sentiment(self, symbol: str) -> Dict[str, Any]:
        """واجهة متوافقة للتحليل السريع"""
        try:
            # تشغيل التحليل الشامل
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self.get_comprehensive_sentiment(symbol))
            loop.close()

            return {
                "summary": f"📊 {symbol}: {result.get('trend', 'neutral')} - {result.get('overall_score', 50)}",
                "symbol": symbol,
                "sentiment_score": result.get('overall_score', 50),
                "trend": result.get('trend', 'neutral'),
                "confidence": result.get('confidence', 50),
                "source": result.get('analysis_type', 'real_data'),
                "timestamp": result.get('timestamp', datetime.now().isoformat())
            }

        except Exception as e:
            logger.error(f"❌ Quick sentiment failed: {e}")
            return self._generate_fallback_data(symbol, str(e))

    def get_complete_analysis(self, symbol: str) -> Dict[str, Any]:
        """واجهة متوافقة للتحليل الشامل"""
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(self.get_comprehensive_sentiment(symbol))
            loop.close()
            return result
        except Exception as e:
            logger.error(f"❌ Complete analysis failed: {e}")
            return self._generate_fallback_data(symbol, str(e))

    def get_enhanced_analysis(self, symbol: str) -> Dict[str, Any]:
        """واجهة متوافقة للتحليل المحسن"""
        complete = self.get_complete_analysis(symbol)

        # إضافة ميزات محسنة
        if "error_reason" not in complete:
            # حساب مؤشرات إضافية من البيانات الحقيقية
            sources = complete.get('sources', {})

            enhanced_features = {
                "market_psychology": self._analyze_market_psychology(sources),
                "sentiment_momentum": self._calculate_momentum(sources),
                "fear_greed_index": self._calculate_fear_greed(complete.get('overall_score', 50))
            }

            complete["enhanced_features"] = enhanced_features
            complete["analysis_type"] = "real_data_enhanced"

        return complete

    def _analyze_market_psychology(self, sources: Dict) -> Dict:
        """تحليل علم النفس السوقي من البيانات الحقيقية"""
        twitter_data = sources.get('twitter', {})
        reddit_data = sources.get('reddit', {})

        # حساب مستوى الخوف والجشع من التفاعل والنقاط
        twitter_engagement = twitter_data.get('total_engagement', 0)
        reddit_score = reddit_data.get('total_score', 0)

        greed_level = min((twitter_engagement / 1000) * 20 + (reddit_score / 100) * 10, 100)
        fear_level = 100 - greed_level

        return {
            "greed_level": round(greed_level, 1),
            "fear_level": round(fear_level, 1),
            "market_activity": "high" if twitter_engagement > 500 else "medium" if twitter_engagement > 100 else "low"
        }

    def _calculate_momentum(self, sources: Dict) -> Dict:
        """حساب زخم المشاعر"""
        total_posts = sum(source.get('posts_analyzed', 0) for source in sources.values())
        avg_sentiment = sum(source.get('raw_sentiment', 0) for source in sources.values()) / max(len(sources), 1)

        return {
            "momentum_score": round(avg_sentiment * 50, 1),
            "trend_direction": "improving" if avg_sentiment > 0.1 else "declining" if avg_sentiment < -0.1 else "stable",
            "data_volume": total_posts
        }

    def _calculate_fear_greed(self, overall_score: float) -> Dict:
        """حساب مؤشر الخوف والجشع"""
        if overall_score >= 75:
            level = "Extreme Greed"
        elif overall_score >= 60:
            level = "Greed"
        elif overall_score >= 45:
            level = "Neutral"
        elif overall_score >= 30:
            level = "Fear"
        else:
            level = "Extreme Fear"

        return {
            "index_value": round(overall_score, 1),
            "level": level,
            "interpretation": f"Market showing {level.lower()} based on real sentiment data"
        }


# إنشاء مثيل للاستخدام
sentiment_analyzer = RealSentimentAnalyzer()