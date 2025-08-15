#!/bin/bash

echo "🔍 Frontend Debugging for Crypto Trading Platform"
echo "================================================="

# Check container status
echo "📊 Container Status:"
docker compose ps

echo ""
echo "🔍 Frontend Container Logs:"
echo "=========================="
docker compose logs frontend --tail=50

echo ""
echo "🔍 Backend Container Logs:"
echo "=========================="
docker compose logs backend --tail=20

echo ""
echo "🧪 Testing API Endpoints:"
echo "========================"

# Test backend endpoints
endpoints=(
    "http://152.67.153.191:8000/"
    "http://152.67.153.191:8000/health"
    "http://152.67.153.191:8000/price/BTCUSDT"
)

for endpoint in "${endpoints[@]}"; do
    echo -n "Testing $endpoint... "
    if curl -f -s "$endpoint" >/dev/null 2>&1; then
        echo "✅ SUCCESS"
    else
        echo "❌ FAILED"
    fi
done

echo ""
echo "🌐 Frontend Access Test:"
echo "======================="
echo "Frontend HTML Response:"
curl -s http://152.67.153.191:3000 | head -10

echo ""
echo "🔧 Environment Variables Check:"
echo "=============================="
echo "Checking if REACT_APP_API_URL is set correctly in docker-compose.yml:"
grep -A 5 -B 5 "REACT_APP_API_URL" docker-compose.yml

echo ""
echo "📱 Frontend Bundle Check:"
echo "========================"
echo "Checking if frontend static files are accessible:"
curl -I http://152.67.153.191:3000/static/js/bundle.js

echo ""
echo "🔍 Detailed Frontend Logs (last 100 lines):"
echo "==========================================="
docker compose logs frontend --tail=100

echo ""
echo "💡 Troubleshooting Suggestions:"
echo "==============================="
echo "1. Check if frontend compiled successfully"
echo "2. Verify environment variables are passed correctly"
echo "3. Check for JavaScript errors in browser console"
echo "4. Ensure all dependencies are installed"
echo ""
echo "🔧 Quick Fixes to Try:"
echo "====================="
echo "# Restart frontend container:"
echo "docker compose restart frontend"
echo ""
echo "# Rebuild frontend:"
echo "docker compose up -d --build frontend"
echo ""
echo "# Check frontend container shell:"
echo "docker compose exec frontend sh"
