# BotFlo.ai Production Environment Setup

## Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
BOTFLO_API_KEY=botflo_secure_api_key_2024

## Optional Services
OPENAI_API_KEY=your_openai_key_here
MONGO_URI=mongodb_connection_string

## Render.com Deployment Steps

1. **Push to Git:**
```bash
git add .
git commit -m "BotFlo.ai marketplace ready for revenue"
git push origin main
```

2. **Set Environment Variables in Render:**
- Go to Dashboard > Your App > Environment
- Add all variables above
- Save changes (triggers auto-deploy)

3. **Point Domain:**
- DNS: botflo.ai → your-app.onrender.com
- Render: Add custom domain
- SSL automatically configured

4. **Test Revenue Flow:**
- Visit botflo.ai
- Buy a bot to test Stripe
- Verify download/hosted setup works

**Expected time to revenue: 2-4 hours after setup**
