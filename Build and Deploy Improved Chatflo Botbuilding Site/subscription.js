const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const inMemoryStorage = require('../storage/inMemoryStorage');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Initialize Stripe (only if API key is provided)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    priceId: null, // Free plan
    features: {
      chatbots: 1,
      conversations: 100,
      templates: 'basic',
      customBranding: false,
      analytics: false,
      apiAccess: false,
      support: 'email'
    }
  },
  professional: {
    name: 'Professional',
    price: 49,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
    features: {
      chatbots: 5,
      conversations: 5000,
      templates: 'all',
      customBranding: true,
      analytics: true,
      apiAccess: false,
      support: 'priority'
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 199,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    features: {
      chatbots: Infinity,
      conversations: Infinity,
      templates: 'all',
      customBranding: true,
      analytics: true,
      apiAccess: true,
      support: 'dedicated'
    }
  }
};

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json({
    plans: SUBSCRIPTION_PLANS
  });
});

// Get current user's subscription
router.get('/current', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const currentPlan = SUBSCRIPTION_PLANS[user.subscription.plan] || SUBSCRIPTION_PLANS.starter;
    
    res.json({
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        trialEndsAt: user.subscription.trialEndsAt,
        features: currentPlan.features,
        usage: user.usage
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Stripe checkout session for subscription
router.post('/checkout', [
  authenticate,
  body('plan').isIn(['professional', 'enterprise']).withMessage('Invalid plan selected')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment processing not configured. Please contact support.' 
      });
    }

    const { plan } = req.body;
    const selectedPlan = SUBSCRIPTION_PLANS[plan];
    
    if (!selectedPlan) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: selectedPlan.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/pricing`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id || req.user._id,
        plan: plan
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Handle Stripe webhook for subscription events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle successful checkout
async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;
  
  let user;
  if (isMongoConnected()) {
    user = await User.findById(userId);
  } else {
    user = await inMemoryStorage.findUserById(userId);
  }

  if (user) {
    const updates = {
      'subscription.plan': plan,
      'subscription.status': 'active',
      'subscription.stripeCustomerId': session.customer,
      'subscription.stripeSubscriptionId': session.subscription
    };

    if (isMongoConnected()) {
      await User.findByIdAndUpdate(userId, updates);
    } else {
      await inMemoryStorage.updateUser(userId, {
        subscription: {
          ...user.subscription,
          plan: plan,
          status: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription
        }
      });
    }
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  let user;
  if (isMongoConnected()) {
    user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  } else {
    // For in-memory storage, we'd need to iterate through users
    // This is a simplified implementation
    console.log('Subscription updated for:', subscription.id);
  }

  if (user) {
    const status = subscription.status === 'active' ? 'active' : 'inactive';
    
    if (isMongoConnected()) {
      await User.findByIdAndUpdate(user._id, {
        'subscription.status': status
      });
    } else {
      await inMemoryStorage.updateUser(user._id, {
        subscription: {
          ...user.subscription,
          status: status
        }
      });
    }
  }
}

// Handle subscription cancellation
async function handleSubscriptionDeleted(subscription) {
  let user;
  if (isMongoConnected()) {
    user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  } else {
    console.log('Subscription deleted for:', subscription.id);
  }

  if (user) {
    if (isMongoConnected()) {
      await User.findByIdAndUpdate(user._id, {
        'subscription.plan': 'starter',
        'subscription.status': 'active',
        'subscription.stripeSubscriptionId': null
      });
    } else {
      await inMemoryStorage.updateUser(user._id, {
        subscription: {
          ...user.subscription,
          plan: 'starter',
          status: 'active',
          stripeSubscriptionId: null
        }
      });
    }
  }
}

// Handle payment failures
async function handlePaymentFailed(invoice) {
  let user;
  if (isMongoConnected()) {
    user = await User.findOne({ 'subscription.stripeCustomerId': invoice.customer });
  } else {
    console.log('Payment failed for customer:', invoice.customer);
  }

  if (user) {
    if (isMongoConnected()) {
      await User.findByIdAndUpdate(user._id, {
        'subscription.status': 'inactive'
      });
    } else {
      await inMemoryStorage.updateUser(user._id, {
        subscription: {
          ...user.subscription,
          status: 'inactive'
        }
      });
    }
  }
}

// Cancel subscription
router.post('/cancel', authenticate, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment processing not configured' 
      });
    }

    const user = req.user;
    
    if (!user.subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      message: 'Subscription will be cancelled at the end of the current billing period'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Check feature access
router.get('/check-feature/:feature', authenticate, (req, res) => {
  try {
    const { feature } = req.params;
    const user = req.user;
    const currentPlan = SUBSCRIPTION_PLANS[user.subscription.plan] || SUBSCRIPTION_PLANS.starter;
    
    const hasAccess = currentPlan.features[feature] !== false && currentPlan.features[feature] !== undefined;
    const featureValue = currentPlan.features[feature];
    
    res.json({
      hasAccess,
      featureValue,
      currentPlan: user.subscription.plan,
      usage: user.usage
    });
  } catch (error) {
    console.error('Check feature error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

