#!/bin/bash
# eBay SSL Certificate Chain Test and Fix Script
# This script tests the SSL certificate chain for eBay compatibility

echo "🔒 eBay SSL Certificate Chain Test"
echo "=================================="

DOMAIN="phxautogroup.com"
PORT="443"
ENDPOINT_PATH="/api/partsmatrix"

echo "Testing domain: $DOMAIN"
echo "Port: $PORT"
echo "Endpoint: $ENDPOINT_PATH"
echo ""

# Test 1: Check SSL certificate chain
echo "1. 🧪 Testing SSL certificate chain..."
echo "Command: openssl s_client -connect $DOMAIN:$PORT -servername $DOMAIN -showcerts"
echo ""

# This will show the full certificate chain
openssl s_client -connect $DOMAIN:$PORT -servername $DOMAIN -showcerts -verify_return_error < /dev/null 2>&1 | head -50

echo ""
echo "2. 🔍 Checking certificate verification..."

# Test certificate verification
CERT_CHECK=$(openssl s_client -connect $DOMAIN:$PORT -servername $DOMAIN < /dev/null 2>&1)
if echo "$CERT_CHECK" | grep -q "Verify return code: 0 (ok)"; then
    echo "✅ Certificate verification: PASSED"
else
    echo "❌ Certificate verification: FAILED"
    echo "Error details:"
    echo "$CERT_CHECK" | grep -E "(Verify return code|verify error|unable to)"
fi

echo ""
echo "3. 🌐 Testing eBay-specific SSL requirements..."

# Test with eBay-like user agent
echo "Testing HTTPS connectivity with eBay-style request..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "User-Agent: eBayNotificationService/1.0" \
    -H "Accept: application/json" \
    "https://$DOMAIN$ENDPOINT_PATH/health" 2>&1)

if [ "$RESPONSE" = "200" ]; then
    echo "✅ HTTPS endpoint accessibility: PASSED"
else
    echo "❌ HTTPS endpoint accessibility: FAILED (HTTP $RESPONSE)"
fi

echo ""
echo "4. 🔧 SSL Labs-style check..."
echo "Visit: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "For detailed SSL configuration analysis"

echo ""
echo "5. 📋 Common eBay SSL Issues and Solutions:"
echo "=========================================="
echo ""
echo "Issue 1: Missing Intermediate Certificates"
echo "- eBay requires a complete certificate chain"
echo "- Your certificate must include all intermediate certificates"
echo "- Check with your certificate provider (Let's Encrypt, Cloudflare, etc.)"
echo ""
echo "Issue 2: Incorrect Certificate Order"
echo "- Order should be: Server Certificate -> Intermediate(s) -> Root"
echo "- Some servers require explicit chain configuration"
echo ""
echo "Issue 3: SSL/TLS Version Compatibility"
echo "- eBay may require specific TLS versions (1.2+)"
echo "- Older SSL versions might be rejected"
echo ""
echo "Issue 4: Certificate Authority Trust"
echo "- eBay's servers must trust your certificate authority"
echo "- Some CAs may not be in eBay's trust store"
echo ""
echo "💡 Next Steps if SSL Issues Found:"
echo "================================="
echo "1. Contact your hosting provider about SSL certificate chain"
echo "2. Ensure all intermediate certificates are properly installed"
echo "3. Test with: curl -I https://$DOMAIN$ENDPOINT_PATH/health"
echo "4. Verify certificate chain with SSL Labs test"
echo "5. Check server logs during eBay's validation attempts"
echo ""
echo "🔗 Test your endpoint manually:"
echo "curl \"https://$DOMAIN$ENDPOINT_PATH?challenge_code=test123\""
