#!/usr/bin/env python3
"""
ChatFlo Flask Deployment Wrapper
This Flask application serves the ChatFlo frontend and provides API endpoints
for permanent deployment compatibility.
"""

from flask import Flask, render_template, send_from_directory, jsonify, request, session
from flask_cors import CORS
import os
import json
import hashlib
import jwt
import datetime
from functools import wraps
import requests
import subprocess
import time

app = Flask(__name__)
app.secret_key = 'chatflo-deployment-secret-key-2024'
CORS(app, origins=['*'])

# Configuration
NODE_SERVER_URL = 'http://localhost:3000'
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'public')
JWT_SECRET = 'chatflo-super-secret-jwt-key-2024-deployment'

# In-memory storage for deployment
users_db = {}
chatbots_db = {}
sessions_db = {}

def start_node_server():
    """Start the Node.js server in the background"""
    try:
        # Check if Node.js server is already running
        response = requests.get(f'{NODE_SERVER_URL}/health', timeout=2)
        if response.status_code == 200:
            print("Node.js server is already running")
            return True
    except:
        pass
    
    try:
        # Start Node.js server
        subprocess.Popen(['npm', 'start'], cwd=os.path.dirname(__file__))
        print("Starting Node.js server...")
        
        # Wait for server to start
        for i in range(30):
            try:
                response = requests.get(f'{NODE_SERVER_URL}/', timeout=2)
                if response.status_code == 200:
                    print("Node.js server started successfully")
                    return True
            except:
                time.sleep(1)
        
        print("Node.js server failed to start")
        return False
    except Exception as e:
        print(f"Error starting Node.js server: {e}")
        return False

def proxy_to_node(path, method='GET', data=None):
    """Proxy requests to Node.js server"""
    try:
        url = f'{NODE_SERVER_URL}{path}'
        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=10)
        elif method == 'PUT':
            response = requests.put(url, json=data, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, timeout=10)
        
        return response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
    except Exception as e:
        print(f"Error proxying to Node.js: {e}")
        return None

# Authentication decorator
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if token and token.startswith('Bearer '):
            token = token[7:]
            try:
                payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
                request.user_id = payload['user_id']
                return f(*args, **kwargs)
            except jwt.InvalidTokenError:
                pass
        return jsonify({'error': 'Authentication required'}), 401
    return decorated_function

# Static file serving
@app.route('/')
def index():
    return send_from_directory(STATIC_DIR, 'chatbot-builder-landing.html')

@app.route('/<path:filename>')
def static_files(filename):
    # Handle HTML files without extension
    if not '.' in filename:
        filename += '.html'
    
    try:
        return send_from_directory(STATIC_DIR, filename)
    except:
        # Try to proxy to Node.js server
        try:
            response = requests.get(f'{NODE_SERVER_URL}/{filename}')
            return response.text, response.status_code, {'Content-Type': response.headers.get('Content-Type', 'text/html')}
        except:
            return send_from_directory(STATIC_DIR, '404.html'), 404

# API Routes - Authentication
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('firstName', '')
        last_name = data.get('lastName', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        if email in users_db:
            return jsonify({'error': 'User already exists'}), 400
        
        # Create user
        user_id = hashlib.md5(email.encode()).hexdigest()
        users_db[email] = {
            'id': user_id,
            'email': email,
            'password': hashlib.sha256(password.encode()).hexdigest(),
            'firstName': first_name,
            'lastName': last_name,
            'subscription': {
                'plan': 'starter',
                'status': 'active'
            },
            'usage': {
                'chatbots': 0,
                'conversations': 0
            },
            'createdAt': datetime.datetime.utcnow().isoformat()
        }
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user_id,
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'email': email,
                'firstName': first_name,
                'lastName': last_name,
                'subscription': users_db[email]['subscription']
            },
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        user = users_db.get(email)
        if not user or user['password'] != hashlib.sha256(password.encode()).hexdigest():
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'email': email,
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'subscription': user['subscription']
            },
            'token': token
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/profile', methods=['GET'])
@require_auth
def profile():
    try:
        # Find user by ID
        user = None
        for email, user_data in users_db.items():
            if user_data['id'] == request.user_id:
                user = user_data
                break
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user['id'],
                'email': email,
                'firstName': user['firstName'],
                'lastName': user['lastName'],
                'subscription': user['subscription'],
                'usage': user['usage']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Chat
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        # Simple chatbot responses
        responses = {
            'hello': "Hello! I'm here to help you with ChatFlo. How can I assist you today?",
            'how does this work': "I'm here to help! Our platform is designed to be intuitive. You can start with templates or build from scratch using our visual editor.",
            'pricing': "We offer three plans: Starter (Free), Professional ($49/month), and Enterprise (Custom). Each plan includes different features and conversation limits.",
            'features': "ChatFlo includes drag-and-drop builder, AI-powered responses, multi-platform deployment, analytics, and much more!",
            'support': "Our support team is here to help! You can reach us through email, chat, or our comprehensive documentation.",
            'default': "Thank you for your message! I'm a demo chatbot. For full AI capabilities, please sign up for our service."
        }
        
        # Simple keyword matching
        message_lower = message.lower()
        response = responses['default']
        
        for keyword, reply in responses.items():
            if keyword in message_lower:
                response = reply
                break
        
        return jsonify({
            'response': {
                'message': response,
                'type': 'text'
            },
            'sessionId': 'demo-session',
            'conversationId': 'demo-conversation'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Routes - Subscription
@app.route('/api/subscription/plans', methods=['GET'])
def subscription_plans():
    plans = {
        'starter': {
            'name': 'Starter',
            'description': 'Perfect for individuals getting started',
            'price': 0,
            'billing': 'monthly',
            'features': {
                'chatbots': 1,
                'conversations': 100,
                'templates': 'basic',
                'customBranding': False,
                'analytics': False,
                'apiAccess': False,
                'support': 'email'
            }
        },
        'professional': {
            'name': 'Professional',
            'description': 'Ideal for growing businesses',
            'price': 49,
            'billing': 'monthly',
            'features': {
                'chatbots': 5,
                'conversations': 5000,
                'templates': 'all',
                'customBranding': True,
                'analytics': True,
                'apiAccess': False,
                'support': 'priority'
            }
        },
        'enterprise': {
            'name': 'Enterprise',
            'description': 'For large organizations',
            'price': 'custom',
            'billing': 'custom',
            'features': {
                'chatbots': 'unlimited',
                'conversations': 'unlimited',
                'templates': 'all_plus_custom',
                'customBranding': True,
                'analytics': True,
                'apiAccess': True,
                'support': 'dedicated'
            }
        }
    }
    
    return jsonify({'plans': plans})

@app.route('/api/subscription/current', methods=['GET'])
@require_auth
def current_subscription():
    try:
        # Find user by ID
        user = None
        for email, user_data in users_db.items():
            if user_data['id'] == request.user_id:
                user = user_data
                break
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'subscription': {
                'plan': user['subscription']['plan'],
                'status': user['subscription']['status'],
                'usage': user['usage']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check
@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'service': 'ChatFlo Flask Wrapper'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return send_from_directory(STATIC_DIR, '404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting ChatFlo Flask Deployment Wrapper...")
    
    # Start Node.js server in background
    start_node_server()
    
    # Start Flask server
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

