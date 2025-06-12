@echo off
REM eBay Compliance Quick Setup Script for Windows
REM Run this from your project root: C:\Users\Wildc\Documents\Programming\Phx Auto Website

echo.
echo ===================================================
echo 🚀 eBay Marketplace Account Deletion Compliance Setup
echo ===================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from your Phx Auto Website project root
    echo Expected location: C:\Users\Wildc\Documents\Programming\Phx Auto Website
    pause
    exit /b 1
)

echo 📂 Creating necessary directories...

REM Create logs directory
if not exist "logs" mkdir logs
if not exist "logs\ebay" mkdir logs\ebay
echo ✅ Created logs\ebay directory

REM Create routes directory if it doesn't exist
if not exist "src\api\routes" mkdir src\api\routes
echo ✅ Routes directory ready

echo.
echo 🔧 Setting up configuration...

REM Generate a secure verification token using Node.js
echo 🔑 Generating verification token...
for /f %%i in ('node -e "console.log(require('crypto').randomBytes(20).toString('hex'))"') do set TOKEN=%%i
echo ✅ Generated verification token: %TOKEN%

echo.
echo 📝 Environment Configuration:
echo ==============================

REM Check if .env file exists
if not exist ".env" (
    echo ❌ Warning: .env file not found. Please create one.
    echo.
    echo 📝 Add these lines to your .env file:
    echo.
    echo EBAY_VERIFICATION_TOKEN=%TOKEN%
    echo EBAY_ENDPOINT_URL=https://phxautogroup.com/api/partsmatrix
    echo.
) else (
    REM Check if eBay config already exists
    findstr /C:"EBAY_VERIFICATION_TOKEN" .env >nul
    if errorlevel 1 (
        echo 📝 Adding eBay configuration to .env file...
        echo. >> .env
        echo # eBay Marketplace Account Deletion Compliance >> .env
        echo EBAY_VERIFICATION_TOKEN=%TOKEN% >> .env
        echo EBAY_ENDPOINT_URL=https://phxautogroup.com/api/partsmatrix >> .env
        echo ✅ eBay configuration added to .env file
    ) else (
        echo ⚠️  eBay configuration already exists in .env file
        echo 💡 Please verify your EBAY_VERIFICATION_TOKEN is set correctly
    )
)

echo.
echo 📋 Next Steps:
echo ==============
echo 1. 📄 Copy the EbayCompliance.js file to: src\api\routes\
echo 2. 🔧 Update your src\api\index.js file with the new route
echo 3. 🧪 Test locally with: npm run start:dev
echo 4. 🌐 Deploy to production
echo 5. 🔗 Configure eBay Developer Portal
echo.
echo 🔍 Testing Commands:
echo ===================
echo # Test locally:
echo node test-ebay-compliance.js --local
echo.
echo # Test production:
echo node test-ebay-compliance.js --production
echo.
echo # Manual health check:
echo curl "https://phxautogroup.com/api/partsmatrix/health"
echo.
echo 📚 For detailed instructions, see the deployment guide.
echo.
echo 🎯 Your verification token for eBay Developer Portal: %TOKEN%
echo 🔗 Your endpoint URL: https://phxautogroup.com/api/partsmatrix
echo.
echo ✅ Setup complete! Follow the deployment instructions to continue.
echo.
pause