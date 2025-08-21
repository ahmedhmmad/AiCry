FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for LightGBM)
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download and setup NLTK data (required for vaderSentiment)
RUN python -c "import nltk; nltk.download('vader_lexicon', quiet=True); nltk.download('punkt', quiet=True); nltk.download('stopwords', quiet=True)"

# Test vaderSentiment installation
RUN python -c "from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer; print('VaderSentiment working!')"

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
