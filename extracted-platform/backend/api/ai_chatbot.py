from flask import Blueprint, jsonify, request
from src.models.user import db
from src.models.chatbot import Chatbot, Conversation, Message
import uuid
import json
import time
from datetime import datetime

ai_chatbot_bp = Blueprint('ai_chatbot', __name__)

# AI Training and Configuration
@ai_chatbot_bp.route('/chatbots/<chatbot_id>/ai/train', methods=['POST'])
def train_ai_chatbot(chatbot_id):
    """Train AI chatbot with custom data"""
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    data = request.json
    
    training_data = data.get('training_data', [])
    training_type = data.get('training_type', 'faq')  # faq, documents, conversations
    
    # Simulate AI training process
    training_job_id = str(uuid.uuid4())
    
    # In a real implementation, this would:
    # 1. Process the training data
    # 2. Fine-tune the AI model
    # 3. Update the chatbot's AI configuration
    
    # For now, we'll simulate the training and update the config
    current_config = json.loads(chatbot.config) if chatbot.config else {}
    
    ai_config = {
        'ai_enabled': True,
        'model_type': 'gpt-3.5-turbo',
        'training_job_id': training_job_id,
        'training_status': 'completed',
        'training_data_count': len(training_data),
        'last_trained': datetime.utcnow().isoformat(),
        'confidence_threshold': data.get('confidence_threshold', 0.7),
        'fallback_enabled': data.get('fallback_enabled', True),
        'personality': data.get('personality', 'helpful and professional'),
        'custom_instructions': data.get('custom_instructions', '')
    }
    
    current_config['ai'] = ai_config
    chatbot.update_config(current_config)
    
    db.session.commit()
    
    return jsonify({
        'training_job_id': training_job_id,
        'status': 'completed',
        'message': 'AI training completed successfully',
        'ai_config': ai_config
    })

@ai_chatbot_bp.route('/chatbots/<chatbot_id>/ai/config', methods=['GET'])
def get_ai_config(chatbot_id):
    """Get AI configuration for a chatbot"""
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    config = json.loads(chatbot.config) if chatbot.config else {}
    ai_config = config.get('ai', {})
    
    return jsonify(ai_config)

@ai_chatbot_bp.route('/chatbots/<chatbot_id>/ai/config', methods=['PUT'])
def update_ai_config(chatbot_id):
    """Update AI configuration for a chatbot"""
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    data = request.json
    
    current_config = json.loads(chatbot.config) if chatbot.config else {}
    ai_config = current_config.get('ai', {})
    
    # Update AI configuration
    ai_config.update({
        'confidence_threshold': data.get('confidence_threshold', ai_config.get('confidence_threshold', 0.7)),
        'fallback_enabled': data.get('fallback_enabled', ai_config.get('fallback_enabled', True)),
        'personality': data.get('personality', ai_config.get('personality', 'helpful and professional')),
        'custom_instructions': data.get('custom_instructions', ai_config.get('custom_instructions', '')),
        'response_style': data.get('response_style', ai_config.get('response_style', 'conversational')),
        'max_response_length': data.get('max_response_length', ai_config.get('max_response_length', 500)),
        'enable_context_memory': data.get('enable_context_memory', ai_config.get('enable_context_memory', True))
    })
    
    current_config['ai'] = ai_config
    chatbot.update_config(current_config)
    
    db.session.commit()
    
    return jsonify(ai_config)

@ai_chatbot_bp.route('/chatbots/<chatbot_id>/ai/test', methods=['POST'])
def test_ai_response(chatbot_id):
    """Test AI response generation"""
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    data = request.json
    
    test_message = data.get('message', '')
    context = data.get('context', [])
    
    # Generate AI response
    response = generate_ai_response(chatbot, test_message, context)
    
    return jsonify({
        'test_message': test_message,
        'ai_response': response,
        'timestamp': datetime.utcnow().isoformat()
    })

@ai_chatbot_bp.route('/chatbots/<chatbot_id>/ai/intents', methods=['GET'])
def get_ai_intents(chatbot_id):
    """Get detected intents for a chatbot"""
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    
    # Get recent messages to analyze intents
    conversations = Conversation.query.filter_by(chatbot_id=chatbot_id).limit(100).all()
    
    intent_stats = {}
    for conv in conversations:
        messages = Message.query.filter_by(conversation_id=conv.id, sender='user').all()
        for msg in messages:
            if msg.intent:
                intent_stats[msg.intent] = intent_stats.get(msg.intent, 0) + 1
    
    # Sort by frequency
    sorted_intents = sorted(intent_stats.items(), key=lambda x: x[1], reverse=True)
    
    return jsonify({
        'intents': [{'intent': intent, 'count': count} for intent, count in sorted_intents],
        'total_messages_analyzed': sum(intent_stats.values())
    })

@ai_chatbot_bp.route('/chatbots/<chatbot_id>/ai/knowledge-base', methods=['POST'])
def upload_knowledge_base(chatbot_id):
    """Upload knowledge base documents for AI training"""
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    data = request.json
    
    documents = data.get('documents', [])
    document_type = data.get('type', 'text')  # text, faq, url, file
    
    # Process knowledge base
    knowledge_base_id = str(uuid.uuid4())
    
    current_config = json.loads(chatbot.config) if chatbot.config else {}
    ai_config = current_config.get('ai', {})
    
    knowledge_bases = ai_config.get('knowledge_bases', [])
    knowledge_bases.append({
        'id': knowledge_base_id,
        'type': document_type,
        'document_count': len(documents),
        'uploaded_at': datetime.utcnow().isoformat(),
        'status': 'processed'
    })
    
    ai_config['knowledge_bases'] = knowledge_bases
    current_config['ai'] = ai_config
    chatbot.update_config(current_config)
    
    db.session.commit()
    
    return jsonify({
        'knowledge_base_id': knowledge_base_id,
        'status': 'processed',
        'documents_processed': len(documents),
        'message': 'Knowledge base uploaded and processed successfully'
    })

@ai_chatbot_bp.route('/chatbots/<chatbot_id>/ai/analytics', methods=['GET'])
def get_ai_analytics(chatbot_id):
    """Get AI performance analytics"""
    chatbot = Chatbot.query.get_or_404(chatbot_id)
    
    # Get recent conversations for analysis
    conversations = Conversation.query.filter_by(chatbot_id=chatbot_id).limit(1000).all()
    
    total_messages = 0
    ai_responses = 0
    high_confidence_responses = 0
    low_confidence_responses = 0
    fallback_responses = 0
    avg_response_time = 0
    
    for conv in conversations:
        messages = Message.query.filter_by(conversation_id=conv.id, sender='bot').all()
        for msg in messages:
            total_messages += 1
            if msg.confidence:
                ai_responses += 1
                if msg.confidence >= 0.8:
                    high_confidence_responses += 1
                elif msg.confidence < 0.5:
                    low_confidence_responses += 1
                
                if msg.response_time_ms:
                    avg_response_time += msg.response_time_ms
            
            if msg.intent == 'fallback':
                fallback_responses += 1
    
    avg_response_time = avg_response_time / max(ai_responses, 1)
    
    return jsonify({
        'total_bot_messages': total_messages,
        'ai_generated_responses': ai_responses,
        'high_confidence_responses': high_confidence_responses,
        'low_confidence_responses': low_confidence_responses,
        'fallback_responses': fallback_responses,
        'average_confidence': (high_confidence_responses * 0.9 + (ai_responses - high_confidence_responses - low_confidence_responses) * 0.65 + low_confidence_responses * 0.3) / max(ai_responses, 1),
        'average_response_time_ms': avg_response_time,
        'ai_usage_rate': ai_responses / max(total_messages, 1)
    })

# AI Response Generation
def generate_ai_response(chatbot, user_message, context=None):
    """Generate AI response for a chatbot"""
    config = json.loads(chatbot.config) if chatbot.config else {}
    ai_config = config.get('ai', {})
    
    if not ai_config.get('ai_enabled', False):
        return generate_rule_based_response(chatbot, user_message)
    
    # Simulate AI response generation
    # In a real implementation, this would call OpenAI API or similar
    
    start_time = time.time()
    
    # Analyze message for intent
    intent, confidence = detect_intent(user_message, ai_config)
    
    # Generate response based on intent and configuration
    if confidence < ai_config.get('confidence_threshold', 0.7) and ai_config.get('fallback_enabled', True):
        response = generate_fallback_response(ai_config)
        intent = 'fallback'
        confidence = 0.5
    else:
        response = generate_contextual_response(user_message, intent, ai_config, context)
    
    response_time = int((time.time() - start_time) * 1000)
    
    return {
        'content': response,
        'type': 'text',
        'intent': intent,
        'confidence': confidence,
        'response_time_ms': response_time,
        'ai_generated': True
    }

def detect_intent(message, ai_config):
    """Detect intent from user message"""
    message_lower = message.lower()
    
    # Simple intent detection (would use ML in production)
    if any(word in message_lower for word in ['hello', 'hi', 'hey', 'start']):
        return 'greeting', 0.9
    elif any(word in message_lower for word in ['bye', 'goodbye', 'end', 'stop']):
        return 'goodbye', 0.9
    elif any(word in message_lower for word in ['help', 'support', 'assist']):
        return 'help_request', 0.8
    elif any(word in message_lower for word in ['price', 'cost', 'pricing', 'how much']):
        return 'pricing_inquiry', 0.8
    elif any(word in message_lower for word in ['book', 'schedule', 'appointment', 'reserve']):
        return 'booking_request', 0.8
    elif any(word in message_lower for word in ['order', 'buy', 'purchase']):
        return 'order_request', 0.8
    elif any(word in message_lower for word in ['contact', 'phone', 'email', 'address']):
        return 'contact_inquiry', 0.8
    else:
        return 'general_inquiry', 0.6

def generate_contextual_response(message, intent, ai_config, context):
    """Generate contextual AI response"""
    personality = ai_config.get('personality', 'helpful and professional')
    custom_instructions = ai_config.get('custom_instructions', '')
    
    # Intent-based responses with personality
    responses = {
        'greeting': f"Hello! I'm here to help you. {custom_instructions}",
        'goodbye': "Thank you for chatting with us! Have a wonderful day!",
        'help_request': "I'd be happy to help you! What specific question do you have?",
        'pricing_inquiry': "I can help you with pricing information. What product or service are you interested in?",
        'booking_request': "I can help you schedule an appointment. What type of service are you looking for?",
        'order_request': "I can assist you with placing an order. What would you like to purchase?",
        'contact_inquiry': "I can provide you with our contact information. What's the best way to reach you?",
        'general_inquiry': f"I understand your question. Let me help you find the right information. {custom_instructions}"
    }
    
    base_response = responses.get(intent, "I'm here to help! Could you please provide more details about what you're looking for?")
    
    # Add personality touches
    if 'friendly' in personality.lower():
        base_response = base_response.replace("I can", "I'd love to").replace("Hello!", "Hi there! 😊")
    elif 'formal' in personality.lower():
        base_response = base_response.replace("Hi there!", "Good day,").replace("I'd", "I would")
    
    return base_response

def generate_fallback_response(ai_config):
    """Generate fallback response when confidence is low"""
    fallback_responses = [
        "I want to make sure I give you the most accurate information. Could you please rephrase your question?",
        "I'm not entirely sure I understand. Could you provide a bit more detail about what you're looking for?",
        "Let me connect you with someone who can better assist you with that specific question.",
        "I'd like to help you with that. Could you tell me more about what you need?"
    ]
    
    import random
    return random.choice(fallback_responses)

def generate_rule_based_response(chatbot, user_message):
    """Generate rule-based response when AI is disabled"""
    config = json.loads(chatbot.config) if chatbot.config else {}
    message_lower = user_message.lower()
    
    if any(word in message_lower for word in ['hello', 'hi', 'hey']):
        response = config.get('greeting_message', 'Hello! How can I help you today?')
    elif any(word in message_lower for word in ['bye', 'goodbye', 'thanks']):
        response = config.get('goodbye_message', 'Thank you for chatting with us! Have a great day!')
    else:
        response = config.get('default_message', "Thank you for your message. How can I assist you today?")
    
    return {
        'content': response,
        'type': 'text',
        'intent': 'general',
        'confidence': 0.8,
        'response_time_ms': 50,
        'ai_generated': False
    }

