import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.chatbot import chatbot_bp
from src.routes.ai_chatbot import ai_chatbot_bp
from src.routes.integrations import integrations_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'botflo-enhanced-secret-key-2025'

# Enable CORS for all routes
CORS(app, origins="*")

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(chatbot_bp, url_prefix='/api')
app.register_blueprint(ai_chatbot_bp, url_prefix='/api')
app.register_blueprint(integrations_bp, url_prefix='/api')

def create_sample_templates():
    """Create sample chatbot templates"""
    from src.models.chatbot import Template
    import json
    
    templates = [
        {
            'id': 'restaurant-quick-service',
            'name': 'Quick Service Restaurant Bot',
            'description': 'Perfect for fast-casual dining establishments. Handles menu display, order taking, and basic customer service.',
            'category': 'restaurant',
            'industry': 'food-service',
            'use_case': 'order-taking',
            'config_template': json.dumps({
                'greeting_message': 'Welcome to our restaurant! How can I help you today?',
                'menu_categories': ['appetizers', 'mains', 'desserts', 'beverages'],
                'order_taking_enabled': True,
                'payment_integration': True,
                'delivery_options': ['pickup', 'delivery'],
                'business_hours': {
                    'monday': '9:00-22:00',
                    'tuesday': '9:00-22:00',
                    'wednesday': '9:00-22:00',
                    'thursday': '9:00-22:00',
                    'friday': '9:00-23:00',
                    'saturday': '9:00-23:00',
                    'sunday': '10:00-21:00'
                }
            }),
            'conversation_flow': json.dumps({
                'greeting': {
                    'message': 'Welcome! Would you like to see our menu or place an order?',
                    'options': ['View Menu', 'Place Order', 'Check Hours', 'Contact Us']
                },
                'menu_display': {
                    'type': 'carousel',
                    'categories': True,
                    'search_enabled': True
                },
                'order_flow': {
                    'steps': ['item_selection', 'customization', 'cart_review', 'checkout', 'confirmation']
                }
            }),
            'required_integrations': json.dumps(['pos_system', 'payment_gateway']),
            'price_download': 24.0,
            'price_hosted': 39.0,
            'is_premium': False,
            'tags': json.dumps(['restaurant', 'ordering', 'food', 'quick-service'])
        },
        {
            'id': 'customer-support-bot',
            'name': 'Customer Support Bot',
            'description': 'Comprehensive customer support solution with FAQ handling, ticket creation, and live agent escalation.',
            'category': 'support',
            'industry': 'general',
            'use_case': 'customer-service',
            'config_template': json.dumps({
                'greeting_message': 'Hi! I\'m here to help you. What can I assist you with today?',
                'faq_enabled': True,
                'ticket_creation': True,
                'live_agent_escalation': True,
                'business_hours': {
                    'enabled': True,
                    'timezone': 'UTC',
                    'hours': {
                        'monday': '9:00-17:00',
                        'tuesday': '9:00-17:00',
                        'wednesday': '9:00-17:00',
                        'thursday': '9:00-17:00',
                        'friday': '9:00-17:00'
                    }
                },
                'escalation_triggers': ['human agent', 'speak to someone', 'not helpful']
            }),
            'conversation_flow': json.dumps({
                'greeting': {
                    'message': 'How can I help you today?',
                    'options': ['Technical Issue', 'Billing Question', 'General Inquiry', 'Speak to Agent']
                },
                'issue_categorization': {
                    'technical': ['login_issues', 'feature_questions', 'bug_reports'],
                    'billing': ['payment_issues', 'subscription_changes', 'refunds'],
                    'general': ['product_info', 'company_info', 'feedback']
                },
                'escalation': {
                    'conditions': ['unresolved_after_3_attempts', 'explicit_request'],
                    'handoff_message': 'Let me connect you with one of our team members who can better assist you.'
                }
            }),
            'required_integrations': json.dumps(['helpdesk_system', 'crm']),
            'price_download': 19.0,
            'price_hosted': 29.0,
            'is_premium': False,
            'tags': json.dumps(['support', 'customer-service', 'faq', 'helpdesk'])
        },
        {
            'id': 'ecommerce-shopping-assistant',
            'name': 'E-commerce Shopping Assistant',
            'description': 'AI-powered shopping assistant that helps customers find products, compare options, and complete purchases.',
            'category': 'ecommerce',
            'industry': 'retail',
            'use_case': 'product-discovery',
            'config_template': json.dumps({
                'greeting_message': 'Welcome to our store! I can help you find the perfect product. What are you looking for?',
                'product_search_enabled': True,
                'recommendation_engine': True,
                'cart_management': True,
                'checkout_integration': True,
                'inventory_checking': True,
                'personalization': {
                    'enabled': True,
                    'factors': ['browsing_history', 'purchase_history', 'preferences']
                }
            }),
            'conversation_flow': json.dumps({
                'greeting': {
                    'message': 'What can I help you find today?',
                    'options': ['Browse Products', 'Search Specific Item', 'Check Order Status', 'Get Recommendations']
                },
                'product_discovery': {
                    'questions': ['category', 'budget', 'specific_features', 'brand_preference'],
                    'recommendation_logic': 'collaborative_filtering'
                },
                'purchase_flow': {
                    'steps': ['product_selection', 'variant_choice', 'add_to_cart', 'checkout', 'order_confirmation']
                }
            }),
            'required_integrations': json.dumps(['ecommerce_platform', 'payment_gateway', 'inventory_system']),
            'price_download': 29.0,
            'price_hosted': 49.0,
            'is_premium': True,
            'tags': json.dumps(['ecommerce', 'shopping', 'recommendations', 'sales'])
        }
    ]
    
    for template_data in templates:
        template = Template(**template_data)
        db.session.add(template)
    
    db.session.commit()
    print("Sample templates created successfully!")

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize database and create sample data
with app.app_context():
    db.create_all()
    
    # Import models after db is initialized
    from src.models.chatbot import Template
    
    # Create sample templates if they don't exist
    if Template.query.count() == 0:
        create_sample_templates()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return jsonify({
                'message': 'BotFlo Enhanced API',
                'version': '1.0.0',
                'status': 'running',
                'endpoints': {
                    'health': '/api/health',
                    'templates': '/api/templates',
                    'chatbots': '/api/chatbots',
                    'ai': '/api/chatbots/{id}/ai/*',
                    'integrations': '/api/integrations/*'
                }
            })

# Global error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)

