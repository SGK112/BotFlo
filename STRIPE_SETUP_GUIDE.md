# BotFlo.ai Stripe Setup Guide

## 🚀 Quick Stripe Configuration

### 1. **Environment Variables in Render**
Since your API key is already set, make sure you have these in Render:

```
STRIPE_SECRET_KEY=sk_live_your_actual_key_or_sk_test_for_testing
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
BOTFLO_API_KEY=your_unique_botflo_key
```

### 2. **Create Stripe Webhook Endpoint**

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint:** `https://your-app.onrender.com/api/webhook/stripe`
3. **Select events:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
4. **Copy webhook secret** → Add to Render environment

### 3. **Test Your Payment Flow**

#### For Testing (Test Mode):
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC
- Any ZIP code

#### Test URLs to Check:
- `https://your-app.onrender.com/botflo-marketplace.html` - Marketplace
- `https://your-app.onrender.com/demo/restaurant` - Restaurant bot demo
- `https://your-app.onrender.com/demo/support` - Support bot demo

### 4. **Verify Deployment Status**

Check your Render dashboard:
- ✅ Build completed successfully
- ✅ Environment variables set
- ✅ App is live and responding

### 5. **Quick Revenue Test**

1. **Visit your marketplace**
2. **Click "Buy Code" on Restaurant Bot**
3. **Complete test purchase**
4. **Verify success page loads**
5. **Check Stripe dashboard for payment**

## 🎯 **Revenue Ready Checklist**

- [ ] Git pushed (✅ Done)
- [ ] Render deployed automatically
- [ ] Stripe webhook configured
- [ ] Test purchase completed
- [ ] Domain pointed to Render
- [ ] Ready to make money!

## 💰 **First Sale Actions**

When you get your first sale:
1. **Celebrate!** 🎉
2. **Email customer** with download link
3. **Post on social media** about the milestone
4. **Reinvest in marketing**

## 🚨 **Common Issues & Fixes**

### Webhook Not Working?
- Check endpoint URL is correct
- Verify webhook secret in environment
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook/stripe`

### Payment Not Processing?
- Confirm API keys are live (not test) for production
- Check Stripe logs for errors
- Verify card details in test mode

### Bot Code Not Generating?
- Check server logs in Render
- Verify BOTFLO_API_KEY is set
- Test `/api/bot/generate-code` endpoint

**You're literally minutes away from your first sale!** 🚀
