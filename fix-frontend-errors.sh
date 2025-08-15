#!/bin/bash

echo "🔧 Fixing Frontend Errors for Crypto Trading Platform"
echo "====================================================="

# Stop frontend container
echo "🛑 Stopping frontend container..."
docker compose stop frontend

# Check if frontend directory has proper structure
echo "📁 Checking frontend structure..."
if [ ! -f "frontend/package.json" ]; then
    echo "❌ frontend/package.json missing. Creating basic structure..."
    
    mkdir -p frontend/src frontend/public
    
    # Create package.json with all required dependencies
    cat > frontend/package.json << 'EOF'
{
  "name": "trading-ai-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "axios": "^1.6.0",
    "framer-motion": "^10.16.0",
    "@heroicons/react": "^2.0.18"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

    # Create basic public/index.html
    cat > frontend/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="منصة الذكاء الصناعي للتداول" />
    <title>منصة التداول الذكي</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="font-cairo bg-gray-900 text-white">
    <noscript>تحتاج لتفعيل JavaScript لتشغيل هذا التطبيق.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

    # Create basic src/index.js
    cat > frontend/src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  const [backendStatus, setBackendStatus] = React.useState('checking...');
  const [currentPrice, setCurrentPrice] = React.useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  React.useEffect(() => {
    // Test backend connection
    fetch(`${API_URL}/health`)
      .then(response => response.json())
      .then(data => {
        setBackendStatus('connected ✅');
        console.log('Backend health:', data);
      })
      .catch(error => {
        setBackendStatus('failed ❌');
        console.error('Backend connection failed:', error);
      });
    
    // Test price API
    fetch(`${API_URL}/price/BTCUSDT`)
      .then(response => response.json())
      .then(data => {
        setCurrentPrice(data.price);
      })
      .catch(error => {
        console.error('Price fetch failed:', error);
      });
  }, [API_URL]);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Cairo, Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          🚀 منصة التداول الذكي
        </h1>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '15px',
          marginBottom: '20px'
        }}>
          <h2>حالة الاتصال</h2>
          <p><strong>Backend API:</strong> {API_URL}</p>
          <p><strong>الحالة:</strong> {backendStatus}</p>
          {currentPrice && (
            <p><strong>سعر البيتكوين:</strong> ${currentPrice.toFixed(2)}</p>
          )}
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '15px'
        }}>
          <h2>اختبار الاتصال</h2>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            إعادة تحميل
          </button>
          
          <button 
            onClick={() => {
              fetch(`${API_URL}/health`)
                .then(r => r.json())
                .then(data => {
                  alert('Backend Response: ' + JSON.stringify(data, null, 2));
                })
                .catch(e => {
                  alert('Backend Error: ' + e.message);
                });
            }}
            style={{
              background: '#2196F3',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            اختبار Backend
          </button>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
EOF

    # Create basic CSS
    cat > frontend/src/index.css << 'EOF'
body {
  margin: 0;
  font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  direction: rtl;
}

* {
  box-sizing: border-box;
}
EOF

    echo "✅ Created basic frontend structure"
fi

# Update Dockerfile for frontend
echo "📝 Creating optimized frontend Dockerfile..."
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment to development for better error messages
ENV NODE_ENV=development

# Start the application
CMD ["npm", "start"]
EOF

echo "🚀 Rebuilding frontend container..."
docker compose build --no-cache frontend

echo "🔧 Starting frontend with debug output..."
docker compose up -d frontend

echo "⏳ Waiting for frontend to start..."
sleep 30

echo ""
echo "🔍 Checking frontend logs..."
docker compose logs frontend --tail=30

echo ""
echo "🧪 Testing frontend access..."
if curl -f -s http://152.67.153.191:3000 >/dev/null 2>&1; then
    echo "✅ Frontend is accessible"
    
    # Test if the main bundle loads
    if curl -f -s http://152.67.153.191:3000/static/js/bundle.js >/dev/null 2>&1; then
        echo "✅ JavaScript bundle is accessible"
    else
        echo "❌ JavaScript bundle not accessible - checking for compilation errors"
        docker compose logs frontend --tail=50
    fi
else
    echo "❌ Frontend not accessible"
fi

echo ""
echo "🌐 Access your app at: http://152.67.153.191:3000"
echo "🔌 Backend API at: http://152.67.153.191:8000"

echo ""
echo "🔍 Next steps if issues persist:"
echo "1. Check browser console for JavaScript errors"
echo "2. Verify all environment variables are set"
echo "3. Check that all npm dependencies installed correctly"
