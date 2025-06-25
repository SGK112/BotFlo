#!/usr/bin/env python3
"""
ChatFlo Enhanced Backend with Export, Sharing, and Subdomain Features
"""

import os
import json
import uuid
import hashlib
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS

# Configuration
STATIC_DIR = os.path.dirname(__file__)
JWT_SECRET = 'chatflo-super-secret-jwt-key-2024-deployment'

# Initialize Flask app
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')
CORS(app, origins="*")

# In-memory storage for enhanced features
chatbot_exports = {}
shared_chatbots = {}
user_subdomains = {}

# Static file serving
@app.route('/')
def index():
    try:
        return send_from_directory(STATIC_DIR, 'chatbot-builder-landing.html')
    except:
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>ChatFlo - Enhanced AI Chatbot Builder</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
                .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
                h1 { color: #4f46e5; font-size: 48px; margin-bottom: 20px; text-align: center; }
                .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
                .feature { background: #f8fafc; padding: 20px; border-radius: 12px; border: 2px solid #e5e7eb; }
                .feature h3 { color: #374151; margin-bottom: 10px; }
                .cta { text-align: center; margin-top: 40px; }
                .btn { background: #4f46e5; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }
                .nav { display: flex; gap: 20px; justify-content: center; margin-bottom: 40px; }
                .nav a { color: #4f46e5; text-decoration: none; font-weight: 500; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🤖 ChatFlo Enhanced</h1>
                <div class="nav">
                    <a href="/advanced-visual-builder.html">🛠️ Visual Builder</a>
                    <a href="/template-gallery.html">🎨 Templates</a>
                    <a href="/mobile-chatbot.html">📱 Mobile Builder</a>
                </div>
                <div class="features">
                    <div class="feature">
                        <h3>🎨 Visual Builder</h3>
                        <p>Drag-and-drop interface with live preview and advanced customization tools.</p>
                    </div>
                    <div class="feature">
                        <h3>📱 Mobile-First</h3>
                        <p>PWA capabilities, offline support, and mobile-optimized building experience.</p>
                    </div>
                    <div class="feature">
                        <h3>🧠 Smart Copilot</h3>
                        <p>AI assistant that helps you build better chatbots with intelligent suggestions.</p>
                    </div>
                    <div class="feature">
                        <h3>🎯 Templates</h3>
                        <p>Professional templates for every use case - support, sales, booking, and more.</p>
                    </div>
                    <div class="feature">
                        <h3>🚀 Export & Share</h3>
                        <p>Download your chatbot, deploy to websites, or create shareable mobile apps.</p>
                    </div>
                    <div class="feature">
                        <h3>🌐 Subdomains</h3>
                        <p>Get custom subdomains for your chatbots that users can add to home screens.</p>
                    </div>
                </div>
                <div class="cta">
                    <a href="/advanced-visual-builder.html" class="btn">🚀 Start Building</a>
                </div>
            </div>
        </body>
        </html>
        """

# Enhanced API Routes

# Health check
@app.route('/health')
def health():
    return jsonify({
        "status": "healthy",
        "version": "2.0.0",
        "features": ["visual_builder", "templates", "mobile_pwa", "export", "sharing", "subdomains"],
        "timestamp": datetime.now().isoformat()
    })

# Chatbot Export API
@app.route('/api/chatbot/export', methods=['POST'])
def export_chatbot():
    try:
        data = request.get_json()
        chatbot_id = data.get('chatbot_id', str(uuid.uuid4()))
        export_format = data.get('format', 'json')  # json, html, js, react
        chatbot_data = data.get('chatbot_data', {})
        
        export_id = str(uuid.uuid4())
        
        # Generate export based on format
        if export_format == 'html':
            export_content = generate_html_export(chatbot_data)
        elif export_format == 'js':
            export_content = generate_js_export(chatbot_data)
        elif export_format == 'react':
            export_content = generate_react_export(chatbot_data)
        else:
            export_content = json.dumps(chatbot_data, indent=2)
        
        # Store export
        chatbot_exports[export_id] = {
            'id': export_id,
            'chatbot_id': chatbot_id,
            'format': export_format,
            'content': export_content,
            'created_at': datetime.now().isoformat(),
            'download_count': 0
        }
        
        return jsonify({
            'success': True,
            'export_id': export_id,
            'download_url': f'/api/chatbot/download/{export_id}',
            'format': export_format,
            'size': len(export_content)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Download exported chatbot
@app.route('/api/chatbot/download/<export_id>')
def download_chatbot(export_id):
    try:
        if export_id not in chatbot_exports:
            return jsonify({'error': 'Export not found'}), 404
        
        export_data = chatbot_exports[export_id]
        export_data['download_count'] += 1
        
        # Determine content type and filename
        format_map = {
            'html': ('text/html', 'chatbot.html'),
            'js': ('application/javascript', 'chatbot.js'),
            'react': ('application/javascript', 'ChatbotComponent.jsx'),
            'json': ('application/json', 'chatbot.json')
        }
        
        content_type, filename = format_map.get(export_data['format'], ('text/plain', 'chatbot.txt'))
        
        response = app.response_class(
            export_data['content'],
            mimetype=content_type,
            headers={'Content-Disposition': f'attachment; filename={filename}'}
        )
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Share chatbot
@app.route('/api/chatbot/share', methods=['POST'])
def share_chatbot():
    try:
        data = request.get_json()
        chatbot_id = data.get('chatbot_id', str(uuid.uuid4()))
        chatbot_data = data.get('chatbot_data', {})
        share_settings = data.get('share_settings', {})
        
        share_id = str(uuid.uuid4())[:8]  # Short ID for sharing
        
        # Store shared chatbot
        shared_chatbots[share_id] = {
            'id': share_id,
            'chatbot_id': chatbot_id,
            'chatbot_data': chatbot_data,
            'share_settings': share_settings,
            'created_at': datetime.now().isoformat(),
            'views': 0,
            'interactions': 0
        }
        
        share_url = f'/chat/{share_id}'
        mobile_url = f'/mobile/{share_id}'
        
        return jsonify({
            'success': True,
            'share_id': share_id,
            'share_url': share_url,
            'mobile_url': mobile_url,
            'qr_code_url': f'/api/qr/{share_id}',
            'embed_code': generate_embed_code(share_id)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create subdomain for user
@app.route('/api/subdomain/create', methods=['POST'])
def create_subdomain():
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'anonymous')
        subdomain_name = data.get('subdomain', '').lower().strip()
        chatbot_id = data.get('chatbot_id')
        
        if not subdomain_name or not chatbot_id:
            return jsonify({'error': 'Subdomain name and chatbot ID required'}), 400
        
        # Validate subdomain name
        if len(subdomain_name) < 3 or len(subdomain_name) > 20:
            return jsonify({'error': 'Subdomain must be 3-20 characters'}), 400
        
        # Check if subdomain is available
        if subdomain_name in user_subdomains:
            return jsonify({'error': 'Subdomain already taken'}), 409
        
        # Create subdomain
        subdomain_id = str(uuid.uuid4())
        user_subdomains[subdomain_name] = {
            'id': subdomain_id,
            'user_id': user_id,
            'subdomain': subdomain_name,
            'chatbot_id': chatbot_id,
            'created_at': datetime.now().isoformat(),
            'active': True,
            'custom_domain': f'{subdomain_name}.chatflo.app'
        }
        
        return jsonify({
            'success': True,
            'subdomain': subdomain_name,
            'url': f'https://{subdomain_name}.chatflo.app',
            'mobile_app_url': f'https://{subdomain_name}.chatflo.app/app',
            'pwa_manifest': f'https://{subdomain_name}.chatflo.app/manifest.json'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Shared chatbot viewer
@app.route('/chat/<share_id>')
def view_shared_chatbot(share_id):
    if share_id not in shared_chatbots:
        return "Chatbot not found", 404
    
    shared_data = shared_chatbots[share_id]
    shared_data['views'] += 1
    
    return render_template_string(SHARED_CHATBOT_TEMPLATE, 
                                chatbot_data=shared_data['chatbot_data'],
                                share_id=share_id)

# Mobile chatbot viewer
@app.route('/mobile/<share_id>')
def view_mobile_chatbot(share_id):
    if share_id not in shared_chatbots:
        return "Chatbot not found", 404
    
    shared_data = shared_chatbots[share_id]
    shared_data['views'] += 1
    
    return render_template_string(MOBILE_CHATBOT_TEMPLATE, 
                                chatbot_data=shared_data['chatbot_data'],
                                share_id=share_id)

# Chat API for shared chatbots
@app.route('/api/chat/<share_id>', methods=['POST'])
def chat_with_shared_bot(share_id):
    try:
        if share_id not in shared_chatbots:
            return jsonify({'error': 'Chatbot not found'}), 404
        
        data = request.get_json()
        message = data.get('message', '')
        
        shared_data = shared_chatbots[share_id]
        shared_data['interactions'] += 1
        
        # Simple response logic (in production, this would use AI)
        responses = [
            f"Thanks for your message: '{message}'. This is a demo response from the shared chatbot!",
            "I'm a shared ChatFlo bot! How can I help you today?",
            "This chatbot was created with ChatFlo's visual builder. Pretty cool, right?",
            "I can help you with various tasks. What would you like to know?"
        ]
        
        import random
        response = random.choice(responses)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat(),
            'bot_id': share_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Original API routes for compatibility
@app.route('/api/subscription/plans')
def get_subscription_plans():
    return jsonify({
        "plans": [
            {
                "id": "starter",
                "name": "Starter",
                "price": 0,
                "features": ["1 chatbot", "100 conversations/month", "Basic templates", "Export to HTML/JS"],
                "popular": False
            },
            {
                "id": "professional", 
                "name": "Professional",
                "price": 49,
                "features": ["5 chatbots", "5,000 conversations/month", "Advanced analytics", "Custom branding", "Subdomain hosting", "React exports"],
                "popular": True
            },
            {
                "id": "enterprise",
                "name": "Enterprise", 
                "price": "Custom",
                "features": ["Unlimited chatbots", "Unlimited conversations", "API access", "White-label solution", "Custom domains", "Priority support"],
                "popular": False
            }
        ]
    })

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    return jsonify({
        "success": True,
        "message": "User registered successfully",
        "token": "demo-jwt-token-12345"
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    return jsonify({
        "success": True,
        "message": "Login successful", 
        "token": "demo-jwt-token-12345"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    return jsonify({
        "response": "Hello! This is a demo response from the enhanced ChatFlo API. Try our new export and sharing features!",
        "timestamp": datetime.now().isoformat()
    })

# Helper functions
def generate_html_export(chatbot_data):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{chatbot_data.get('name', 'ChatFlo Bot')}</title>
    <style>
        .chatflo-widget {{ position: fixed; bottom: 20px; right: 20px; z-index: 9999; }}
        .chatflo-button {{ width: 60px; height: 60px; border-radius: 50%; background: #4f46e5; border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4); }}
        .chatflo-chat {{ width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: none; margin-top: 10px; }}
        .chatflo-header {{ background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 15px; border-radius: 12px 12px 0 0; }}
        .chatflo-messages {{ height: 350px; padding: 15px; overflow-y: auto; }}
        .chatflo-input {{ padding: 15px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; }}
        .chatflo-input input {{ flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 20px; outline: none; }}
        .chatflo-input button {{ padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 20px; cursor: pointer; }}
    </style>
</head>
<body>
    <div class="chatflo-widget">
        <button class="chatflo-button" onclick="toggleChat()">💬</button>
        <div class="chatflo-chat" id="chatfloChat">
            <div class="chatflo-header">
                <h3 style="margin: 0; font-size: 16px;">{chatbot_data.get('name', 'ChatFlo Bot')}</h3>
                <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">Powered by ChatFlo</p>
            </div>
            <div class="chatflo-messages" id="chatfloMessages">
                <div style="background: #f3f4f6; padding: 10px; border-radius: 12px; margin-bottom: 10px;">
                    👋 Hello! How can I help you today?
                </div>
            </div>
            <div class="chatflo-input">
                <input type="text" id="chatfloInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>
    <script>
        function toggleChat() {{
            const chat = document.getElementById('chatfloChat');
            chat.style.display = chat.style.display === 'none' ? 'block' : 'none';
        }}
        
        function sendMessage() {{
            const input = document.getElementById('chatfloInput');
            const messages = document.getElementById('chatfloMessages');
            
            if (input.value.trim()) {{
                const userMsg = document.createElement('div');
                userMsg.style.cssText = 'background: #4f46e5; color: white; padding: 10px; border-radius: 12px; margin-bottom: 10px; margin-left: 50px; text-align: right;';
                userMsg.textContent = input.value;
                messages.appendChild(userMsg);
                
                const botMsg = document.createElement('div');
                botMsg.style.cssText = 'background: #f3f4f6; padding: 10px; border-radius: 12px; margin-bottom: 10px; margin-right: 50px;';
                botMsg.textContent = 'Thanks for your message! This is a demo response from your exported ChatFlo bot.';
                messages.appendChild(botMsg);
                
                input.value = '';
                messages.scrollTop = messages.scrollHeight;
            }}
        }}
        
        function handleKeyPress(event) {{
            if (event.key === 'Enter') {{
                sendMessage();
            }}
        }}
    </script>
</body>
</html>"""

def generate_js_export(chatbot_data):
    bot_name = chatbot_data.get('name', 'ChatFlo Bot')
    return f"""// ChatFlo Chatbot Widget - Exported from ChatFlo Builder
(function() {{
    const chatbotData = {json.dumps(chatbot_data)};
    
    function createChatWidget() {{
        const widget = document.createElement('div');
        widget.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
                <button onclick="toggleChatfloWidget()" style="width: 60px; height: 60px; border-radius: 50%; background: #4f46e5; border: none; color: white; font-size: 24px; cursor: pointer; box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);">💬</button>
                <div id="chatfloWidget" style="width: 350px; height: 500px; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: none; margin-top: 10px;">
                    <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 15px; border-radius: 12px 12px 0 0;">
                        <h3 style="margin: 0; font-size: 16px;">{bot_name}</h3>
                        <p style="margin: 5px 0 0; font-size: 12px; opacity: 0.9;">Powered by ChatFlo</p>
                    </div>
                    <div id="chatfloMessages" style="height: 350px; padding: 15px; overflow-y: auto;">
                        <div style="background: #f3f4f6; padding: 10px; border-radius: 12px; margin-bottom: 10px;">
                            👋 Hello! How can I help you today?
                        </div>
                    </div>
                    <div style="padding: 15px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px;">
                        <input type="text" id="chatfloInput" placeholder="Type your message..." style="flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 20px; outline: none;" onkeypress="if(event.key==='Enter')sendChatfloMessage()">
                        <button onclick="sendChatfloMessage()" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 20px; cursor: pointer;">Send</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(widget);
    }}
    
    window.toggleChatfloWidget = function() {{
        const widget = document.getElementById('chatfloWidget');
        widget.style.display = widget.style.display === 'none' ? 'block' : 'none';
    }};
    
    window.sendChatfloMessage = function() {{
        const input = document.getElementById('chatfloInput');
        const messages = document.getElementById('chatfloMessages');
        
        if (input.value.trim()) {{
            const userMsg = document.createElement('div');
            userMsg.style.cssText = 'background: #4f46e5; color: white; padding: 10px; border-radius: 12px; margin-bottom: 10px; margin-left: 50px; text-align: right;';
            userMsg.textContent = input.value;
            messages.appendChild(userMsg);
            
            const botMsg = document.createElement('div');
            botMsg.style.cssText = 'background: #f3f4f6; padding: 10px; border-radius: 12px; margin-bottom: 10px; margin-right: 50px;';
            botMsg.textContent = 'Thanks for your message! This is a demo response from your exported ChatFlo bot.';
            messages.appendChild(botMsg);
            
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
        }}
    }};
    
    if (document.readyState === 'loading') {{
        document.addEventListener('DOMContentLoaded', createChatWidget);
    }} else {{
        createChatWidget();
    }}
}})();"""

def generate_react_export(chatbot_data):
    bot_name = chatbot_data.get('name', 'ChatFlo Bot')
    return f"""import React, {{ useState }} from 'react';

const ChatfloChatbot = () => {{
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {{ type: 'bot', text: '👋 Hello! How can I help you today?' }}
    ]);
    const [inputValue, setInputValue] = useState('');
    
    const chatbotData = {json.dumps(chatbot_data)};
    
    const sendMessage = () => {{
        if (inputValue.trim()) {{
            const newMessages = [
                ...messages,
                {{ type: 'user', text: inputValue }},
                {{ type: 'bot', text: 'Thanks for your message! This is a demo response from your exported ChatFlo bot.' }}
            ];
            setMessages(newMessages);
            setInputValue('');
        }}
    }};
    
    const handleKeyPress = (e) => {{
        if (e.key === 'Enter') {{
            sendMessage();
        }}
    }};
    
    return (
        <div style={{{{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}}}>
            <button 
                onClick={{() => setIsOpen(!isOpen)}}
                style={{{{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#4f46e5',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(79, 70, 229, 0.4)'
                }}}}
            >
                💬
            </button>
            {{isOpen && (
                <div style={{{{
                    width: '350px',
                    height: '500px',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    marginTop: '10px',
                    display: 'flex',
                    flexDirection: 'column'
                }}}}>
                    <div style={{{{
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        color: 'white',
                        padding: '15px',
                        borderRadius: '12px 12px 0 0'
                    }}}}>
                        <h3 style={{{{ margin: 0, fontSize: '16px' }}}}>{bot_name}</h3>
                        <p style={{{{ margin: '5px 0 0', fontSize: '12px', opacity: 0.9 }}}}>Powered by ChatFlo</p>
                    </div>
                    <div style={{{{
                        flex: 1,
                        padding: '15px',
                        overflowY: 'auto'
                    }}}}>
                        {{messages.map((msg, index) => (
                            <div
                                key={{index}}
                                style={{{{
                                    background: msg.type === 'user' ? '#4f46e5' : '#f3f4f6',
                                    color: msg.type === 'user' ? 'white' : 'black',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    marginBottom: '10px',
                                    marginLeft: msg.type === 'user' ? '50px' : '0',
                                    marginRight: msg.type === 'user' ? '0' : '50px',
                                    textAlign: msg.type === 'user' ? 'right' : 'left'
                                }}}}
                            >
                                {{msg.text}}
                            </div>
                        ))}}
                    </div>
                    <div style={{{{
                        padding: '15px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '8px'
                    }}}}>
                        <input
                            type="text"
                            value={{inputValue}}
                            onChange={{(e) => setInputValue(e.target.value)}}
                            onKeyPress={{handleKeyPress}}
                            placeholder="Type your message..."
                            style={{{{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '20px',
                                outline: 'none'
                            }}}}
                        />
                        <button
                            onClick={{sendMessage}}
                            style={{{{
                                padding: '8px 16px',
                                background: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer'
                            }}}}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}}
        </div>
    );
}};

export default ChatfloChatbot;"""

def generate_embed_code(share_id):
    return f"""<iframe 
    src="/chat/{share_id}" 
    width="350" 
    height="500" 
    frameborder="0"
    style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
</iframe>"""

# Templates for shared chatbots
SHARED_CHATBOT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ chatbot_data.get('name', 'ChatFlo Bot') }}</title>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; }
        .chat-container { max-width: 800px; margin: 0 auto; height: 100vh; display: flex; flex-direction: column; background: white; }
        .chat-header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 20px; text-align: center; }
        .chat-messages { flex: 1; padding: 20px; overflow-y: auto; }
        .chat-input { padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; }
        .chat-input input { flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 20px; outline: none; }
        .chat-input button { padding: 12px 20px; background: #4f46e5; color: white; border: none; border-radius: 20px; cursor: pointer; }
        .message { margin-bottom: 15px; display: flex; align-items: flex-start; gap: 10px; }
        .message.user { flex-direction: row-reverse; }
        .message-bubble { max-width: 70%; padding: 12px 16px; border-radius: 18px; }
        .message.bot .message-bubble { background: #f3f4f6; color: #374151; }
        .message.user .message-bubble { background: #4f46e5; color: white; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h2>{{ chatbot_data.get('name', 'ChatFlo Bot') }}</h2>
            <p>{{ chatbot_data.get('description', 'Powered by ChatFlo') }}</p>
        </div>
        <div class="chat-messages" id="messages">
            <div class="message bot">
                <div class="message-bubble">👋 Hello! How can I help you today?</div>
            </div>
        </div>
        <div class="chat-input">
            <input type="text" id="messageInput" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
            <button onclick="sendMessage()">Send</button>
        </div>
    </div>
    
    <script>
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const messages = document.getElementById('messages');
            
            if (input.value.trim()) {
                const userMsg = document.createElement('div');
                userMsg.className = 'message user';
                userMsg.innerHTML = `<div class="message-bubble">${input.value}</div>`;
                messages.appendChild(userMsg);
                
                const userMessage = input.value;
                input.value = '';
                
                fetch('/api/chat/{{ share_id }}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage })
                })
                .then(response => response.json())
                .then(data => {
                    const botMsg = document.createElement('div');
                    botMsg.className = 'message bot';
                    botMsg.innerHTML = `<div class="message-bubble">${data.response}</div>`;
                    messages.appendChild(botMsg);
                    messages.scrollTop = messages.scrollHeight;
                });
                
                messages.scrollTop = messages.scrollHeight;
            }
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
    </script>
</body>
</html>
"""

MOBILE_CHATBOT_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ chatbot_data.get('name', 'ChatFlo Bot') }}</title>
    <meta name="theme-color" content="#4f46e5">
    <link rel="manifest" href="/manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; height: 100vh; overflow: hidden; }
        .mobile-chat { height: 100vh; display: flex; flex-direction: column; background: white; }
        .mobile-header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 15px 20px; display: flex; align-items: center; gap: 15px; }
        .avatar { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .bot-info h3 { margin: 0; font-size: 16px; }
        .bot-info p { margin: 0; font-size: 12px; opacity: 0.8; }
        .messages { flex: 1; padding: 20px; overflow-y: auto; }
        .input-area { padding: 15px 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; }
        .input-area input { flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 25px; outline: none; }
        .send-btn { width: 44px; height: 44px; background: #4f46e5; border: none; border-radius: 50%; color: white; cursor: pointer; }
        .message { margin-bottom: 15px; display: flex; align-items: flex-start; gap: 8px; }
        .message.user { flex-direction: row-reverse; }
        .message-bubble { max-width: 80%; padding: 10px 14px; border-radius: 18px; font-size: 14px; }
        .message.bot .message-bubble { background: #f3f4f6; color: #374151; }
        .message.user .message-bubble { background: #4f46e5; color: white; }
        .install-prompt { position: fixed; bottom: 0; left: 0; right: 0; background: #4f46e5; color: white; padding: 15px 20px; display: none; align-items: center; justify-content: space-between; }
        .install-prompt.show { display: flex; }
    </style>
</head>
<body>
    <div class="mobile-chat">
        <div class="mobile-header">
            <div class="avatar">🤖</div>
            <div class="bot-info">
                <h3>{{ chatbot_data.get('name', 'ChatFlo Bot') }}</h3>
                <p>Online • Ready to help</p>
            </div>
        </div>
        <div class="messages" id="mobileMessages">
            <div class="message bot">
                <div class="message-bubble">👋 Hello! I'm your mobile assistant. How can I help you today?</div>
            </div>
        </div>
        <div class="input-area">
            <input type="text" id="mobileInput" placeholder="Type a message..." onkeypress="handleMobileKeyPress(event)">
            <button class="send-btn" onclick="sendMobileMessage()">➤</button>
        </div>
    </div>
    
    <div class="install-prompt" id="installPrompt">
        <div>
            <strong>Add to Home Screen</strong><br>
            <small>Get quick access to this chatbot</small>
        </div>
        <button onclick="installApp()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px;">Install</button>
    </div>
    
    <script>
        function sendMobileMessage() {
            const input = document.getElementById('mobileInput');
            const messages = document.getElementById('mobileMessages');
            
            if (input.value.trim()) {
                const userMsg = document.createElement('div');
                userMsg.className = 'message user';
                userMsg.innerHTML = `<div class="message-bubble">${input.value}</div>`;
                messages.appendChild(userMsg);
                
                const userMessage = input.value;
                input.value = '';
                
                fetch('/api/chat/{{ share_id }}', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMessage })
                })
                .then(response => response.json())
                .then(data => {
                    const botMsg = document.createElement('div');
                    botMsg.className = 'message bot';
                    botMsg.innerHTML = `<div class="message-bubble">${data.response}</div>`;
                    messages.appendChild(botMsg);
                    messages.scrollTop = messages.scrollHeight;
                });
                
                messages.scrollTop = messages.scrollHeight;
            }
        }
        
        function handleMobileKeyPress(event) {
            if (event.key === 'Enter') {
                sendMobileMessage();
            }
        }
        
        // PWA Install
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            document.getElementById('installPrompt').classList.add('show');
        });
        
        function installApp() {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    deferredPrompt = null;
                    document.getElementById('installPrompt').classList.remove('show');
                });
            }
        }
    </script>
</body>
</html>
"""

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

