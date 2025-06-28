#!/usr/bin/env python3
"""
Data Migration Script for BotFlo.ai Enhanced Platform Integration

This script handles data synchronization between the legacy MongoDB database
and the enhanced SQLite database, ensuring data consistency across both platforms.
"""

import os
import sys
import json
import sqlite3
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

try:
    from pymongo import MongoClient
    MONGO_AVAILABLE = True
except ImportError:
    MONGO_AVAILABLE = False
    print("Warning: pymongo not installed. MongoDB operations will be skipped.")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('data_migration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DataMigrator:
    """Handles data migration between MongoDB and SQLite databases."""
    
    def __init__(self, mongo_uri: str = None, sqlite_path: str = None):
        self.mongo_uri = mongo_uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017/botflo')
        self.sqlite_path = sqlite_path or os.getenv('SQLITE_PATH', './enhanced/backend/botflo.db')
        
        self.mongo_client = None
        self.mongo_db = None
        self.sqlite_conn = None
        
        self.migration_stats = {
            'users': {'migrated': 0, 'errors': 0},
            'templates': {'migrated': 0, 'errors': 0},
            'chatbots': {'migrated': 0, 'errors': 0},
            'conversations': {'migrated': 0, 'errors': 0}
        }
    
    def connect_databases(self):
        """Establish connections to both databases."""
        try:
            if MONGO_AVAILABLE:
                self.mongo_client = MongoClient(self.mongo_uri)
                self.mongo_db = self.mongo_client.get_default_database()
                logger.info("Connected to MongoDB")
            else:
                logger.warning("MongoDB connection skipped - pymongo not available")
            
            self.sqlite_conn = sqlite3.connect(self.sqlite_path)
            self.sqlite_conn.row_factory = sqlite3.Row
            logger.info("Connected to SQLite")
            
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    def close_connections(self):
        """Close database connections."""
        if self.mongo_client:
            self.mongo_client.close()
        if self.sqlite_conn:
            self.sqlite_conn.close()
        logger.info("Database connections closed")
    
    def create_sqlite_tables(self):
        """Create SQLite tables if they don't exist."""
        cursor = self.sqlite_conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mongo_id TEXT UNIQUE,
                email TEXT UNIQUE NOT NULL,
                username TEXT,
                password_hash TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1,
                subscription_plan TEXT DEFAULT 'free',
                metadata TEXT
            )
        ''')
        
        # Templates table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mongo_id TEXT UNIQUE,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                price DECIMAL(10,2),
                downloads INTEGER DEFAULT 0,
                rating DECIMAL(3,2),
                features TEXT,
                configuration TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # Chatbots table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chatbots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mongo_id TEXT UNIQUE,
                user_id INTEGER,
                template_id INTEGER,
                name TEXT NOT NULL,
                description TEXT,
                configuration TEXT,
                status TEXT DEFAULT 'draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (template_id) REFERENCES templates (id)
            )
        ''')
        
        # Conversations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mongo_id TEXT UNIQUE,
                chatbot_id INTEGER,
                user_message TEXT,
                bot_response TEXT,
                confidence DECIMAL(5,4),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT,
                FOREIGN KEY (chatbot_id) REFERENCES chatbots (id)
            )
        ''')
        
        self.sqlite_conn.commit()
        logger.info("SQLite tables created/verified")
    
    def migrate_users(self) -> Dict[str, int]:
        """Migrate users from MongoDB to SQLite."""
        if not MONGO_AVAILABLE or not self.mongo_db:
            logger.warning("Skipping user migration - MongoDB not available")
            return self.migration_stats['users']
        
        try:
            users_collection = self.mongo_db.users
            cursor = self.sqlite_conn.cursor()
            
            for user in users_collection.find():
                try:
                    # Prepare user data
                    user_data = {
                        'mongo_id': str(user['_id']),
                        'email': user.get('email', ''),
                        'username': user.get('username', ''),
                        'password_hash': user.get('password', ''),
                        'created_at': user.get('createdAt', datetime.now()),
                        'is_active': user.get('isActive', True),
                        'subscription_plan': user.get('subscriptionPlan', 'free'),
                        'metadata': json.dumps(user.get('metadata', {}))
                    }
                    
                    # Insert or update user
                    cursor.execute('''
                        INSERT OR REPLACE INTO users 
                        (mongo_id, email, username, password_hash, created_at, is_active, subscription_plan, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        user_data['mongo_id'],
                        user_data['email'],
                        user_data['username'],
                        user_data['password_hash'],
                        user_data['created_at'],
                        user_data['is_active'],
                        user_data['subscription_plan'],
                        user_data['metadata']
                    ))
                    
                    self.migration_stats['users']['migrated'] += 1
                    
                except Exception as e:
                    logger.error(f"Error migrating user {user.get('_id')}: {e}")
                    self.migration_stats['users']['errors'] += 1
            
            self.sqlite_conn.commit()
            logger.info(f"Users migration completed: {self.migration_stats['users']}")
            
        except Exception as e:
            logger.error(f"Users migration failed: {e}")
            raise
        
        return self.migration_stats['users']
    
    def migrate_templates(self) -> Dict[str, int]:
        """Migrate templates from MongoDB to SQLite."""
        if not MONGO_AVAILABLE or not self.mongo_db:
            logger.warning("Skipping template migration - MongoDB not available")
            return self.migration_stats['templates']
        
        try:
            templates_collection = self.mongo_db.templates
            cursor = self.sqlite_conn.cursor()
            
            for template in templates_collection.find():
                try:
                    # Prepare template data
                    template_data = {
                        'mongo_id': str(template['_id']),
                        'name': template.get('name', ''),
                        'description': template.get('description', ''),
                        'category': template.get('category', ''),
                        'price': template.get('price', 0),
                        'downloads': template.get('downloads', 0),
                        'rating': template.get('rating', 0),
                        'features': json.dumps(template.get('features', [])),
                        'configuration': json.dumps(template.get('configuration', {})),
                        'created_at': template.get('createdAt', datetime.now()),
                        'is_active': template.get('isActive', True)
                    }
                    
                    # Insert or update template
                    cursor.execute('''
                        INSERT OR REPLACE INTO templates 
                        (mongo_id, name, description, category, price, downloads, rating, features, configuration, created_at, is_active)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        template_data['mongo_id'],
                        template_data['name'],
                        template_data['description'],
                        template_data['category'],
                        template_data['price'],
                        template_data['downloads'],
                        template_data['rating'],
                        template_data['features'],
                        template_data['configuration'],
                        template_data['created_at'],
                        template_data['is_active']
                    ))
                    
                    self.migration_stats['templates']['migrated'] += 1
                    
                except Exception as e:
                    logger.error(f"Error migrating template {template.get('_id')}: {e}")
                    self.migration_stats['templates']['errors'] += 1
            
            self.sqlite_conn.commit()
            logger.info(f"Templates migration completed: {self.migration_stats['templates']}")
            
        except Exception as e:
            logger.error(f"Templates migration failed: {e}")
            raise
        
        return self.migration_stats['templates']
    
    def migrate_chatbots(self) -> Dict[str, int]:
        """Migrate chatbots from MongoDB to SQLite."""
        if not MONGO_AVAILABLE or not self.mongo_db:
            logger.warning("Skipping chatbot migration - MongoDB not available")
            return self.migration_stats['chatbots']
        
        try:
            chatbots_collection = self.mongo_db.chatbots
            cursor = self.sqlite_conn.cursor()
            
            for chatbot in chatbots_collection.find():
                try:
                    # Get user_id from SQLite based on mongo_id
                    user_id = None
                    if chatbot.get('userId'):
                        cursor.execute('SELECT id FROM users WHERE mongo_id = ?', (str(chatbot['userId']),))
                        user_row = cursor.fetchone()
                        if user_row:
                            user_id = user_row['id']
                    
                    # Get template_id from SQLite based on mongo_id
                    template_id = None
                    if chatbot.get('templateId'):
                        cursor.execute('SELECT id FROM templates WHERE mongo_id = ?', (str(chatbot['templateId']),))
                        template_row = cursor.fetchone()
                        if template_row:
                            template_id = template_row['id']
                    
                    # Prepare chatbot data
                    chatbot_data = {
                        'mongo_id': str(chatbot['_id']),
                        'user_id': user_id,
                        'template_id': template_id,
                        'name': chatbot.get('name', ''),
                        'description': chatbot.get('description', ''),
                        'configuration': json.dumps(chatbot.get('configuration', {})),
                        'status': chatbot.get('status', 'draft'),
                        'created_at': chatbot.get('createdAt', datetime.now())
                    }
                    
                    # Insert or update chatbot
                    cursor.execute('''
                        INSERT OR REPLACE INTO chatbots 
                        (mongo_id, user_id, template_id, name, description, configuration, status, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        chatbot_data['mongo_id'],
                        chatbot_data['user_id'],
                        chatbot_data['template_id'],
                        chatbot_data['name'],
                        chatbot_data['description'],
                        chatbot_data['configuration'],
                        chatbot_data['status'],
                        chatbot_data['created_at']
                    ))
                    
                    self.migration_stats['chatbots']['migrated'] += 1
                    
                except Exception as e:
                    logger.error(f"Error migrating chatbot {chatbot.get('_id')}: {e}")
                    self.migration_stats['chatbots']['errors'] += 1
            
            self.sqlite_conn.commit()
            logger.info(f"Chatbots migration completed: {self.migration_stats['chatbots']}")
            
        except Exception as e:
            logger.error(f"Chatbots migration failed: {e}")
            raise
        
        return self.migration_stats['chatbots']
    
    def migrate_conversations(self, limit: int = 10000) -> Dict[str, int]:
        """Migrate recent conversations from MongoDB to SQLite."""
        if not MONGO_AVAILABLE or not self.mongo_db:
            logger.warning("Skipping conversation migration - MongoDB not available")
            return self.migration_stats['conversations']
        
        try:
            conversations_collection = self.mongo_db.conversations
            cursor = self.sqlite_conn.cursor()
            
            # Get recent conversations (limited for performance)
            conversations = conversations_collection.find().sort('timestamp', -1).limit(limit)
            
            for conversation in conversations:
                try:
                    # Get chatbot_id from SQLite based on mongo_id
                    chatbot_id = None
                    if conversation.get('chatbotId'):
                        cursor.execute('SELECT id FROM chatbots WHERE mongo_id = ?', (str(conversation['chatbotId']),))
                        chatbot_row = cursor.fetchone()
                        if chatbot_row:
                            chatbot_id = chatbot_row['id']
                    
                    # Prepare conversation data
                    conversation_data = {
                        'mongo_id': str(conversation['_id']),
                        'chatbot_id': chatbot_id,
                        'user_message': conversation.get('userMessage', ''),
                        'bot_response': conversation.get('botResponse', ''),
                        'confidence': conversation.get('confidence', 0),
                        'timestamp': conversation.get('timestamp', datetime.now()),
                        'metadata': json.dumps(conversation.get('metadata', {}))
                    }
                    
                    # Insert or update conversation
                    cursor.execute('''
                        INSERT OR REPLACE INTO conversations 
                        (mongo_id, chatbot_id, user_message, bot_response, confidence, timestamp, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        conversation_data['mongo_id'],
                        conversation_data['chatbot_id'],
                        conversation_data['user_message'],
                        conversation_data['bot_response'],
                        conversation_data['confidence'],
                        conversation_data['timestamp'],
                        conversation_data['metadata']
                    ))
                    
                    self.migration_stats['conversations']['migrated'] += 1
                    
                except Exception as e:
                    logger.error(f"Error migrating conversation {conversation.get('_id')}: {e}")
                    self.migration_stats['conversations']['errors'] += 1
            
            self.sqlite_conn.commit()
            logger.info(f"Conversations migration completed: {self.migration_stats['conversations']}")
            
        except Exception as e:
            logger.error(f"Conversations migration failed: {e}")
            raise
        
        return self.migration_stats['conversations']
    
    def run_full_migration(self):
        """Run complete data migration process."""
        logger.info("Starting full data migration...")
        
        try:
            self.connect_databases()
            self.create_sqlite_tables()
            
            # Run migrations in order (due to foreign key dependencies)
            self.migrate_users()
            self.migrate_templates()
            self.migrate_chatbots()
            self.migrate_conversations()
            
            # Print summary
            logger.info("Migration completed successfully!")
            logger.info("Migration Summary:")
            for entity, stats in self.migration_stats.items():
                logger.info(f"  {entity.capitalize()}: {stats['migrated']} migrated, {stats['errors']} errors")
            
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            raise
        finally:
            self.close_connections()
    
    def verify_migration(self):
        """Verify migration results by comparing record counts."""
        logger.info("Verifying migration results...")
        
        try:
            self.connect_databases()
            cursor = self.sqlite_conn.cursor()
            
            verification_results = {}
            
            for table in ['users', 'templates', 'chatbots', 'conversations']:
                cursor.execute(f'SELECT COUNT(*) FROM {table}')
                sqlite_count = cursor.fetchone()[0]
                
                mongo_count = 0
                if MONGO_AVAILABLE and self.mongo_db:
                    collection = getattr(self.mongo_db, table)
                    mongo_count = collection.count_documents({})
                
                verification_results[table] = {
                    'mongodb': mongo_count,
                    'sqlite': sqlite_count,
                    'match': mongo_count == sqlite_count
                }
            
            logger.info("Verification Results:")
            for table, results in verification_results.items():
                status = "✓" if results['match'] else "✗"
                logger.info(f"  {table}: MongoDB={results['mongodb']}, SQLite={results['sqlite']} {status}")
            
        except Exception as e:
            logger.error(f"Verification failed: {e}")
        finally:
            self.close_connections()

def main():
    """Main function for command-line usage."""
    import argparse
    
    parser = argparse.ArgumentParser(description='BotFlo.ai Data Migration Tool')
    parser.add_argument('--mongo-uri', help='MongoDB connection URI')
    parser.add_argument('--sqlite-path', help='SQLite database path')
    parser.add_argument('--verify-only', action='store_true', help='Only verify migration results')
    parser.add_argument('--conversations-limit', type=int, default=10000, 
                       help='Limit number of conversations to migrate')
    
    args = parser.parse_args()
    
    migrator = DataMigrator(args.mongo_uri, args.sqlite_path)
    
    if args.verify_only:
        migrator.verify_migration()
    else:
        migrator.run_full_migration()
        migrator.verify_migration()

if __name__ == '__main__':
    main()

