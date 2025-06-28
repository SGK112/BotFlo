from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.chatbot import Chatbot, Integration, Conversation, Message
import uuid
import json
import requests
from datetime import datetime

integrations_bp = Blueprint('integrations', __name__)

# WhatsApp Business API Integration
@integrations_bp.route('/integrations/whatsapp/setup', methods=['POST'])
def setup_whatsapp_integration():
    """Setup WhatsApp Business API integration"""
    data = request.json
    chatbot_id = data.get('chatbot_id')
    
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    
    # WhatsApp configuration
    whatsapp_config = {
        'phone_number_id': data.get('phone_number_id'),
        'business_account_id': data.get('business_account_id'),
        'access_token': data.get('access_token'),
        'webhook_verify_token': data.get('webhook_verify_token'),
        'webhook_url': f"https://botflo.ai/webhooks/whatsapp/{chatbot_id}",
        'message_templates': data.get('message_templates', []),
        'auto_reply_enabled': data.get('auto_reply_enabled', True),
        'business_hours': data.get('business_hours', {
            'enabled': False,
            'timezone': 'UTC',
            'hours': {}
        })
    }
    
    # Create or update integration
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='whatsapp'
    ).first()
    
    if not integration:
        integration = Integration(
            id=str(uuid.uuid4()),
            chatbot_id=chatbot_id,
            integration_type='whatsapp',
            name='WhatsApp Business',
            config=json.dumps(whatsapp_config),
            status='active'
        )
        db.session.add(integration)
    else:
        integration.config = json.dumps(whatsapp_config)
        integration.status = 'active'
        integration.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'integration_id': integration.id,
        'status': 'active',
        'webhook_url': whatsapp_config['webhook_url'],
        'message': 'WhatsApp integration configured successfully'
    })

@integrations_bp.route('/webhooks/whatsapp/<chatbot_id>', methods=['GET'])
def whatsapp_webhook_verify(chatbot_id):
    """Verify WhatsApp webhook"""
    verify_token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    
    # Get integration to verify token
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='whatsapp'
    ).first()
    
    if not integration:
        return 'Integration not found', 404
    
    config = json.loads(integration.config)
    expected_token = config.get('webhook_verify_token')
    
    if verify_token == expected_token:
        return challenge
    else:
        return 'Invalid verify token', 403

@integrations_bp.route('/webhooks/whatsapp/<chatbot_id>', methods=['POST'])
def whatsapp_webhook_receive(chatbot_id):
    """Receive WhatsApp messages"""
    data = request.json
    
    # Process WhatsApp webhook data
    if 'messages' in data.get('entry', [{}])[0].get('changes', [{}])[0].get('value', {}):
        messages = data['entry'][0]['changes'][0]['value']['messages']
        
        for message in messages:
            process_whatsapp_message(chatbot_id, message)
    
    return jsonify({'status': 'received'})

def process_whatsapp_message(chatbot_id, message_data):
    """Process incoming WhatsApp message"""
    from_number = message_data.get('from')
    message_text = message_data.get('text', {}).get('body', '')
    message_type = message_data.get('type', 'text')
    
    # Get or create conversation
    conversation = Conversation.query.filter_by(
        chatbot_id=chatbot_id,
        user_identifier=from_number,
        channel='whatsapp'
    ).first()
    
    if not conversation:
        conversation = Conversation(
            id=str(uuid.uuid4()),
            chatbot_id=chatbot_id,
            session_id=str(uuid.uuid4()),
            user_identifier=from_number,
            channel='whatsapp'
        )
        db.session.add(conversation)
    
    # Create user message
    user_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        sender='user',
        content=message_text,
        message_type=message_type
    )
    db.session.add(user_message)
    
    # Generate bot response
    from src.routes.ai_chatbot import generate_ai_response
    chatbot = Chatbot.query.get(chatbot_id)
    bot_response = generate_ai_response(chatbot, message_text, [])
    
    # Create bot message
    bot_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation.id,
        sender='bot',
        content=bot_response['content'],
        message_type='text',
        intent=bot_response.get('intent'),
        confidence=bot_response.get('confidence')
    )
    db.session.add(bot_message)
    
    # Update conversation
    conversation.message_count += 2
    conversation.last_activity = datetime.utcnow()
    
    db.session.commit()
    
    # Send response via WhatsApp API
    send_whatsapp_message(chatbot_id, from_number, bot_response['content'])

def send_whatsapp_message(chatbot_id, to_number, message_text):
    """Send message via WhatsApp Business API"""
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='whatsapp'
    ).first()
    
    if not integration:
        return False
    
    config = json.loads(integration.config)
    phone_number_id = config.get('phone_number_id')
    access_token = config.get('access_token')
    
    url = f"https://graph.facebook.com/v17.0/{phone_number_id}/messages"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'messaging_product': 'whatsapp',
        'to': to_number,
        'type': 'text',
        'text': {'body': message_text}
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending WhatsApp message: {e}")
        return False

# Facebook Messenger Integration
@integrations_bp.route('/integrations/messenger/setup', methods=['POST'])
def setup_messenger_integration():
    """Setup Facebook Messenger integration"""
    data = request.json
    chatbot_id = data.get('chatbot_id')
    
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    
    # Messenger configuration
    messenger_config = {
        'page_id': data.get('page_id'),
        'page_access_token': data.get('page_access_token'),
        'app_secret': data.get('app_secret'),
        'verify_token': data.get('verify_token'),
        'webhook_url': f"https://botflo.ai/webhooks/messenger/{chatbot_id}",
        'greeting_text': data.get('greeting_text', 'Hello! How can I help you today?'),
        'get_started_payload': data.get('get_started_payload', 'GET_STARTED'),
        'persistent_menu': data.get('persistent_menu', []),
        'auto_reply_enabled': data.get('auto_reply_enabled', True)
    }
    
    # Create or update integration
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='messenger'
    ).first()
    
    if not integration:
        integration = Integration(
            id=str(uuid.uuid4()),
            chatbot_id=chatbot_id,
            integration_type='messenger',
            name='Facebook Messenger',
            config=json.dumps(messenger_config),
            status='active'
        )
        db.session.add(integration)
    else:
        integration.config = json.dumps(messenger_config)
        integration.status = 'active'
        integration.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    # Setup Messenger profile
    setup_messenger_profile(messenger_config)
    
    return jsonify({
        'integration_id': integration.id,
        'status': 'active',
        'webhook_url': messenger_config['webhook_url'],
        'message': 'Messenger integration configured successfully'
    })

@integrations_bp.route('/webhooks/messenger/<chatbot_id>', methods=['GET'])
def messenger_webhook_verify(chatbot_id):
    """Verify Messenger webhook"""
    verify_token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')
    
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='messenger'
    ).first()
    
    if not integration:
        return 'Integration not found', 404
    
    config = json.loads(integration.config)
    expected_token = config.get('verify_token')
    
    if verify_token == expected_token:
        return challenge
    else:
        return 'Invalid verify token', 403

@integrations_bp.route('/webhooks/messenger/<chatbot_id>', methods=['POST'])
def messenger_webhook_receive(chatbot_id):
    """Receive Messenger messages"""
    data = request.json
    
    if 'entry' in data:
        for entry in data['entry']:
            if 'messaging' in entry:
                for messaging_event in entry['messaging']:
                    process_messenger_message(chatbot_id, messaging_event)
    
    return jsonify({'status': 'received'})

def process_messenger_message(chatbot_id, messaging_event):
    """Process incoming Messenger message"""
    sender_id = messaging_event['sender']['id']
    
    if 'message' in messaging_event:
        message_text = messaging_event['message'].get('text', '')
        
        # Get or create conversation
        conversation = Conversation.query.filter_by(
            chatbot_id=chatbot_id,
            user_identifier=sender_id,
            channel='messenger'
        ).first()
        
        if not conversation:
            conversation = Conversation(
                id=str(uuid.uuid4()),
                chatbot_id=chatbot_id,
                session_id=str(uuid.uuid4()),
                user_identifier=sender_id,
                channel='messenger'
            )
            db.session.add(conversation)
        
        # Create user message
        user_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            sender='user',
            content=message_text,
            message_type='text'
        )
        db.session.add(user_message)
        
        # Generate bot response
        from src.routes.ai_chatbot import generate_ai_response
        chatbot = Chatbot.query.get(chatbot_id)
        bot_response = generate_ai_response(chatbot, message_text, [])
        
        # Create bot message
        bot_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            sender='bot',
            content=bot_response['content'],
            message_type='text',
            intent=bot_response.get('intent'),
            confidence=bot_response.get('confidence')
        )
        db.session.add(bot_message)
        
        # Update conversation
        conversation.message_count += 2
        conversation.last_activity = datetime.utcnow()
        
        db.session.commit()
        
        # Send response via Messenger API
        send_messenger_message(chatbot_id, sender_id, bot_response['content'])

def send_messenger_message(chatbot_id, recipient_id, message_text):
    """Send message via Messenger API"""
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='messenger'
    ).first()
    
    if not integration:
        return False
    
    config = json.loads(integration.config)
    page_access_token = config.get('page_access_token')
    
    url = f"https://graph.facebook.com/v17.0/me/messages?access_token={page_access_token}"
    
    payload = {
        'recipient': {'id': recipient_id},
        'message': {'text': message_text}
    }
    
    try:
        response = requests.post(url, json=payload)
        return response.status_code == 200
    except Exception as e:
        print(f"Error sending Messenger message: {e}")
        return False

def setup_messenger_profile(config):
    """Setup Messenger profile (greeting, get started button, etc.)"""
    page_access_token = config.get('page_access_token')
    
    url = f"https://graph.facebook.com/v17.0/me/messenger_profile?access_token={page_access_token}"
    
    profile_data = {
        'greeting': [
            {
                'locale': 'default',
                'text': config.get('greeting_text', 'Hello! How can I help you today?')
            }
        ],
        'get_started': {
            'payload': config.get('get_started_payload', 'GET_STARTED')
        }
    }
    
    if config.get('persistent_menu'):
        profile_data['persistent_menu'] = config['persistent_menu']
    
    try:
        requests.post(url, json=profile_data)
    except Exception as e:
        print(f"Error setting up Messenger profile: {e}")

# Email Integration
@integrations_bp.route('/integrations/email/setup', methods=['POST'])
def setup_email_integration():
    """Setup Email automation integration"""
    data = request.json
    chatbot_id = data.get('chatbot_id')
    
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    
    # Email configuration
    email_config = {
        'provider': data.get('provider', 'smtp'),  # smtp, sendgrid, mailchimp, etc.
        'smtp_host': data.get('smtp_host'),
        'smtp_port': data.get('smtp_port', 587),
        'smtp_username': data.get('smtp_username'),
        'smtp_password': data.get('smtp_password'),
        'from_email': data.get('from_email'),
        'from_name': data.get('from_name'),
        'auto_reply_enabled': data.get('auto_reply_enabled', True),
        'email_templates': data.get('email_templates', {}),
        'trigger_conditions': data.get('trigger_conditions', []),
        'mailing_lists': data.get('mailing_lists', [])
    }
    
    # Create or update integration
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='email'
    ).first()
    
    if not integration:
        integration = Integration(
            id=str(uuid.uuid4()),
            chatbot_id=chatbot_id,
            integration_type='email',
            name='Email Automation',
            config=json.dumps(email_config),
            status='active'
        )
        db.session.add(integration)
    else:
        integration.config = json.dumps(email_config)
        integration.status = 'active'
        integration.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        'integration_id': integration.id,
        'status': 'active',
        'message': 'Email integration configured successfully'
    })

@integrations_bp.route('/integrations/email/send', methods=['POST'])
def send_email():
    """Send email via configured integration"""
    data = request.json
    chatbot_id = data.get('chatbot_id')
    
    integration = Integration.query.filter_by(
        chatbot_id=chatbot_id,
        integration_type='email'
    ).first()
    
    if not integration:
        return jsonify({'error': 'Email integration not found'}), 404
    
    config = json.loads(integration.config)
    
    # Email details
    to_email = data.get('to_email')
    subject = data.get('subject')
    content = data.get('content')
    template_name = data.get('template_name')
    
    # Use template if specified
    if template_name and template_name in config.get('email_templates', {}):
        template = config['email_templates'][template_name]
        subject = template.get('subject', subject)
        content = template.get('content', content)
    
    # Send email
    success = send_email_message(config, to_email, subject, content)
    
    if success:
        return jsonify({'status': 'sent', 'message': 'Email sent successfully'})
    else:
        return jsonify({'error': 'Failed to send email'}), 500

def send_email_message(config, to_email, subject, content):
    """Send email using configured provider"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{config.get('from_name', '')} <{config.get('from_email')}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(content, 'html'))
        
        # Send via SMTP
        server = smtplib.SMTP(config.get('smtp_host'), config.get('smtp_port', 587))
        server.starttls()
        server.login(config.get('smtp_username'), config.get('smtp_password'))
        
        text = msg.as_string()
        server.sendmail(config.get('from_email'), to_email, text)
        server.quit()
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

# Integration Management
@integrations_bp.route('/integrations/<integration_id>/test', methods=['POST'])
def test_integration(integration_id):
    """Test an integration"""
    integration = Integration.query.get_or_404(integration_id)
    
    test_results = {
        'integration_id': integration_id,
        'integration_type': integration.integration_type,
        'status': 'success',
        'message': 'Integration test completed successfully',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    # Perform integration-specific tests
    if integration.integration_type == 'whatsapp':
        test_results.update(test_whatsapp_integration(integration))
    elif integration.integration_type == 'messenger':
        test_results.update(test_messenger_integration(integration))
    elif integration.integration_type == 'email':
        test_results.update(test_email_integration(integration))
    
    return jsonify(test_results)

def test_whatsapp_integration(integration):
    """Test WhatsApp integration"""
    config = json.loads(integration.config)
    
    # Test API connectivity
    phone_number_id = config.get('phone_number_id')
    access_token = config.get('access_token')
    
    url = f"https://graph.facebook.com/v17.0/{phone_number_id}"
    headers = {'Authorization': f'Bearer {access_token}'}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return {'status': 'success', 'message': 'WhatsApp API connection successful'}
        else:
            return {'status': 'error', 'message': 'WhatsApp API connection failed'}
    except Exception as e:
        return {'status': 'error', 'message': f'WhatsApp test failed: {str(e)}'}

def test_messenger_integration(integration):
    """Test Messenger integration"""
    config = json.loads(integration.config)
    
    # Test API connectivity
    page_access_token = config.get('page_access_token')
    
    url = f"https://graph.facebook.com/v17.0/me?access_token={page_access_token}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return {'status': 'success', 'message': 'Messenger API connection successful'}
        else:
            return {'status': 'error', 'message': 'Messenger API connection failed'}
    except Exception as e:
        return {'status': 'error', 'message': f'Messenger test failed: {str(e)}'}

def test_email_integration(integration):
    """Test Email integration"""
    config = json.loads(integration.config)
    
    # Test SMTP connection
    import smtplib
    
    try:
        server = smtplib.SMTP(config.get('smtp_host'), config.get('smtp_port', 587))
        server.starttls()
        server.login(config.get('smtp_username'), config.get('smtp_password'))
        server.quit()
        
        return {'status': 'success', 'message': 'Email SMTP connection successful'}
    except Exception as e:
        return {'status': 'error', 'message': f'Email test failed: {str(e)}'}

@integrations_bp.route('/integrations/available', methods=['GET'])
def get_available_integrations():
    """Get list of available integrations"""
    integrations = [
        {
            'type': 'whatsapp',
            'name': 'WhatsApp Business',
            'description': 'Connect your chatbot to WhatsApp Business API',
            'icon': 'whatsapp',
            'category': 'messaging',
            'setup_required': ['phone_number_id', 'access_token', 'webhook_verify_token']
        },
        {
            'type': 'messenger',
            'name': 'Facebook Messenger',
            'description': 'Connect your chatbot to Facebook Messenger',
            'icon': 'messenger',
            'category': 'messaging',
            'setup_required': ['page_id', 'page_access_token', 'verify_token']
        },
        {
            'type': 'email',
            'name': 'Email Automation',
            'description': 'Send automated emails based on chat interactions',
            'icon': 'email',
            'category': 'automation',
            'setup_required': ['smtp_host', 'smtp_username', 'smtp_password', 'from_email']
        },
        {
            'type': 'slack',
            'name': 'Slack',
            'description': 'Connect your chatbot to Slack workspace',
            'icon': 'slack',
            'category': 'messaging',
            'setup_required': ['bot_token', 'signing_secret']
        },
        {
            'type': 'telegram',
            'name': 'Telegram',
            'description': 'Connect your chatbot to Telegram',
            'icon': 'telegram',
            'category': 'messaging',
            'setup_required': ['bot_token']
        }
    ]
    
    return jsonify(integrations)

