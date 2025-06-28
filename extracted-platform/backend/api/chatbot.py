from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
from src.models.user import db

class Chatbot(db.Model):
    __tablename__ = 'chatbots'
    
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    template_id = db.Column(db.String(50))
    industry = db.Column(db.String(50))
    use_case = db.Column(db.String(50))
    
    # Configuration
    config = db.Column(db.Text)  # JSON string
    theme = db.Column(db.String(50), default='modern-dark')
    branding = db.Column(db.Text)  # JSON string for brand settings
    
    # Status and deployment
    status = db.Column(db.String(20), default='draft')  # draft, active, paused, archived
    deployment_url = db.Column(db.String(255))
    embed_code = db.Column(db.Text)
    
    # Analytics
    total_conversations = db.Column(db.Integer, default=0)
    total_messages = db.Column(db.Integer, default=0)
    satisfaction_score = db.Column(db.Float, default=0.0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deployed_at = db.Column(db.DateTime)
    
    # Relationships
    conversations = db.relationship('Conversation', backref='chatbot', lazy=True, cascade='all, delete-orphan')
    integrations = db.relationship('Integration', backref='chatbot', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Chatbot {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'description': self.description,
            'template_id': self.template_id,
            'industry': self.industry,
            'use_case': self.use_case,
            'config': json.loads(self.config) if self.config else {},
            'theme': self.theme,
            'branding': json.loads(self.branding) if self.branding else {},
            'status': self.status,
            'deployment_url': self.deployment_url,
            'embed_code': self.embed_code,
            'total_conversations': self.total_conversations,
            'total_messages': self.total_messages,
            'satisfaction_score': self.satisfaction_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'deployed_at': self.deployed_at.isoformat() if self.deployed_at else None
        }
    
    def update_config(self, new_config):
        """Update chatbot configuration"""
        self.config = json.dumps(new_config)
        self.updated_at = datetime.utcnow()
    
    def update_branding(self, new_branding):
        """Update chatbot branding"""
        self.branding = json.dumps(new_branding)
        self.updated_at = datetime.utcnow()
    
    def deploy(self, deployment_url, embed_code):
        """Deploy the chatbot"""
        self.status = 'active'
        self.deployment_url = deployment_url
        self.embed_code = embed_code
        self.deployed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def increment_stats(self, conversations=0, messages=0):
        """Increment usage statistics"""
        self.total_conversations += conversations
        self.total_messages += messages
        self.updated_at = datetime.utcnow()

class Template(db.Model):
    __tablename__ = 'templates'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # restaurant, ecommerce, healthcare, etc.
    industry = db.Column(db.String(50))
    use_case = db.Column(db.String(100))
    
    # Template configuration
    config_template = db.Column(db.Text)  # JSON template for configuration
    conversation_flow = db.Column(db.Text)  # JSON conversation flow
    required_integrations = db.Column(db.Text)  # JSON list of required integrations
    
    # Pricing and availability
    price_download = db.Column(db.Float, default=0.0)
    price_hosted = db.Column(db.Float, default=0.0)
    is_premium = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Metadata
    preview_url = db.Column(db.String(255))
    demo_url = db.Column(db.String(255))
    documentation_url = db.Column(db.String(255))
    tags = db.Column(db.Text)  # JSON array of tags
    
    # Analytics
    usage_count = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Template {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'industry': self.industry,
            'use_case': self.use_case,
            'config_template': json.loads(self.config_template) if self.config_template else {},
            'conversation_flow': json.loads(self.conversation_flow) if self.conversation_flow else {},
            'required_integrations': json.loads(self.required_integrations) if self.required_integrations else [],
            'price_download': self.price_download,
            'price_hosted': self.price_hosted,
            'is_premium': self.is_premium,
            'is_active': self.is_active,
            'preview_url': self.preview_url,
            'demo_url': self.demo_url,
            'documentation_url': self.documentation_url,
            'tags': json.loads(self.tags) if self.tags else [],
            'usage_count': self.usage_count,
            'rating': self.rating,
            'review_count': self.review_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.updated_at = datetime.utcnow()

class Conversation(db.Model):
    __tablename__ = 'conversations'
    
    id = db.Column(db.String(36), primary_key=True)
    chatbot_id = db.Column(db.String(36), db.ForeignKey('chatbots.id'), nullable=False)
    session_id = db.Column(db.String(100))
    user_identifier = db.Column(db.String(100))  # email, phone, or anonymous ID
    channel = db.Column(db.String(50))  # web, whatsapp, messenger, email
    
    # Conversation metadata
    status = db.Column(db.String(20), default='active')  # active, completed, abandoned
    satisfaction_rating = db.Column(db.Integer)  # 1-5 rating
    lead_captured = db.Column(db.Boolean, default=False)
    goal_achieved = db.Column(db.Boolean, default=False)
    
    # Analytics
    message_count = db.Column(db.Integer, default=0)
    duration_seconds = db.Column(db.Integer, default=0)
    
    # Timestamps
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Conversation {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'chatbot_id': self.chatbot_id,
            'session_id': self.session_id,
            'user_identifier': self.user_identifier,
            'channel': self.channel,
            'status': self.status,
            'satisfaction_rating': self.satisfaction_rating,
            'lead_captured': self.lead_captured,
            'goal_achieved': self.goal_achieved,
            'message_count': self.message_count,
            'duration_seconds': self.duration_seconds,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'ended_at': self.ended_at.isoformat() if self.ended_at else None,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None
        }

class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.String(36), primary_key=True)
    conversation_id = db.Column(db.String(36), db.ForeignKey('conversations.id'), nullable=False)
    sender = db.Column(db.String(20), nullable=False)  # user, bot, agent
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(50), default='text')  # text, image, file, quick_reply, etc.
    
    # Message metadata
    intent = db.Column(db.String(100))  # detected intent
    confidence = db.Column(db.Float)  # AI confidence score
    response_time_ms = db.Column(db.Integer)  # time to generate response
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Message {self.id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender': self.sender,
            'content': self.content,
            'message_type': self.message_type,
            'intent': self.intent,
            'confidence': self.confidence,
            'response_time_ms': self.response_time_ms,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Integration(db.Model):
    __tablename__ = 'integrations'
    
    id = db.Column(db.String(36), primary_key=True)
    chatbot_id = db.Column(db.String(36), db.ForeignKey('chatbots.id'), nullable=False)
    integration_type = db.Column(db.String(50), nullable=False)  # whatsapp, messenger, email, crm, etc.
    name = db.Column(db.String(100), nullable=False)
    
    # Configuration
    config = db.Column(db.Text)  # JSON configuration
    credentials = db.Column(db.Text)  # Encrypted credentials
    
    # Status
    status = db.Column(db.String(20), default='inactive')  # active, inactive, error
    last_sync = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Integration {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'chatbot_id': self.chatbot_id,
            'integration_type': self.integration_type,
            'name': self.name,
            'config': json.loads(self.config) if self.config else {},
            'status': self.status,
            'last_sync': self.last_sync.isoformat() if self.last_sync else None,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

