#!/bin/bash

# ChatFlo Production Deployment Script
# This script automates the deployment process for ChatFlo to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="chatflo"
APP_DIR="/opt/chatflo/app"
BACKUP_DIR="/opt/chatflo/backups"
USER="chatflo"
NODE_VERSION="20"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check if running as root or with sudo
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root. Please run as the chatflo user or with sudo."
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js $NODE_VERSION first."
        exit 1
    fi
    
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        log_error "Node.js version $NODE_VERSION or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed. Please install PM2 first: npm install -g pm2"
        exit 1
    fi
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        log_warning "Nginx is not installed. Please install and configure Nginx for production."
    fi
    
    log_success "System requirements check passed"
}

create_backup() {
    log_info "Creating backup of current deployment..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    sudo chown $USER:$USER "$BACKUP_DIR"
    
    if [ -d "$APP_DIR" ]; then
        # Stop application before backup
        pm2 stop $APP_NAME || true
        
        # Create backup
        cp -r "$APP_DIR" "$BACKUP_PATH"
        log_success "Backup created at $BACKUP_PATH"
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        log_info "Old backups cleaned up (keeping last 5)"
    else
        log_warning "No existing deployment found to backup"
    fi
}

setup_application() {
    log_info "Setting up application..."
    
    # Create application directory
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    
    # Clone or update repository
    if [ -d "$APP_DIR/.git" ]; then
        log_info "Updating existing repository..."
        cd "$APP_DIR"
        git fetch origin
        git reset --hard origin/main
    else
        log_info "Cloning repository..."
        git clone https://github.com/SGK112/chatflo.git "$APP_DIR"
        cd "$APP_DIR"
    fi
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production
    
    log_success "Application setup completed"
}

configure_environment() {
    log_info "Configuring environment..."
    
    cd "$APP_DIR"
    
    # Check if production environment file exists
    if [ ! -f ".env.production" ]; then
        if [ -f ".env.production.template" ]; then
            log_warning "Production environment file not found. Copying template..."
            cp .env.production.template .env.production
            log_error "Please edit .env.production with your actual production values before continuing."
            log_error "Run: nano $APP_DIR/.env.production"
            exit 1
        else
            log_error "No production environment configuration found. Please create .env.production"
            exit 1
        fi
    fi
    
    # Set proper permissions
    chmod 600 .env.production
    
    # Create symlink to .env for the application
    ln -sf .env.production .env
    
    log_success "Environment configuration completed"
}

setup_directories() {
    log_info "Setting up application directories..."
    
    cd "$APP_DIR"
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p uploads
    mkdir -p temp
    
    # Set proper permissions
    chmod 755 logs uploads temp
    
    log_success "Directories setup completed"
}

configure_pm2() {
    log_info "Configuring PM2..."
    
    cd "$APP_DIR"
    
    # Create PM2 ecosystem file if it doesn't exist
    if [ ! -f "ecosystem.config.js" ]; then
        cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$APP_DIR/logs/err.log',
    out_file: '$APP_DIR/logs/out.log',
    log_file: '$APP_DIR/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
        log_success "PM2 ecosystem file created"
    fi
    
    log_success "PM2 configuration completed"
}

deploy_application() {
    log_info "Deploying application..."
    
    cd "$APP_DIR"
    
    # Start or restart application with PM2
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        log_info "Restarting existing application..."
        pm2 restart ecosystem.config.js
    else
        log_info "Starting new application..."
        pm2 start ecosystem.config.js
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for application to start
    sleep 5
    
    # Check if application is running
    if pm2 describe $APP_NAME | grep -q "online"; then
        log_success "Application deployed and running"
    else
        log_error "Application failed to start. Check logs: pm2 logs $APP_NAME"
        exit 1
    fi
}

run_health_check() {
    log_info "Running health check..."
    
    # Wait for application to fully start
    sleep 10
    
    # Check if application responds
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Health check passed - application is responding"
    else
        log_error "Health check failed - application is not responding"
        log_info "Checking application logs..."
        pm2 logs $APP_NAME --lines 20
        exit 1
    fi
}

setup_ssl() {
    log_info "Checking SSL configuration..."
    
    if command -v certbot &> /dev/null; then
        log_info "Certbot is available for SSL certificate management"
        log_info "To obtain SSL certificate, run:"
        log_info "sudo certbot --nginx -d yourdomain.com"
    else
        log_warning "Certbot not found. Please install certbot for SSL certificates:"
        log_warning "sudo apt install certbot python3-certbot-nginx"
    fi
}

setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Setup log rotation
    sudo tee /etc/logrotate.d/chatflo > /dev/null << EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    log_success "Log rotation configured"
    
    # Setup PM2 monitoring
    if ! pm2 describe pm2-logrotate > /dev/null 2>&1; then
        pm2 install pm2-logrotate
        log_success "PM2 log rotation installed"
    fi
}

print_status() {
    log_info "Deployment Status:"
    echo "===================="
    
    # Application status
    echo "Application Status:"
    pm2 describe $APP_NAME | grep -E "(status|uptime|cpu|memory)"
    echo ""
    
    # System resources
    echo "System Resources:"
    echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "Memory Usage: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
    echo "Disk Usage: $(df -h / | awk 'NR==2{printf "%s", $5}')"
    echo ""
    
    # Network check
    echo "Network Check:"
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✓ Application responding on localhost:3000"
    else
        echo "✗ Application not responding on localhost:3000"
    fi
    
    echo "===================="
    log_success "Deployment completed successfully!"
    echo ""
    log_info "Next steps:"
    echo "1. Configure your domain DNS to point to this server"
    echo "2. Set up SSL certificate: sudo certbot --nginx -d yourdomain.com"
    echo "3. Configure firewall: sudo ufw allow 'Nginx Full'"
    echo "4. Monitor logs: pm2 logs $APP_NAME"
    echo "5. Monitor application: pm2 monit"
}

rollback() {
    log_warning "Rolling back to previous version..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup found for rollback"
        exit 1
    fi
    
    # Stop current application
    pm2 stop $APP_NAME || true
    
    # Restore backup
    rm -rf "$APP_DIR"
    cp -r "$BACKUP_DIR/$LATEST_BACKUP" "$APP_DIR"
    
    # Restart application
    cd "$APP_DIR"
    pm2 start ecosystem.config.js
    
    log_success "Rollback completed to $LATEST_BACKUP"
}

# Main deployment function
main() {
    log_info "Starting ChatFlo production deployment..."
    echo "========================================"
    
    case "${1:-deploy}" in
        "deploy")
            check_requirements
            create_backup
            setup_application
            configure_environment
            setup_directories
            configure_pm2
            deploy_application
            run_health_check
            setup_ssl
            setup_monitoring
            print_status
            ;;
        "rollback")
            rollback
            ;;
        "status")
            print_status
            ;;
        "logs")
            pm2 logs $APP_NAME
            ;;
        "restart")
            pm2 restart $APP_NAME
            log_success "Application restarted"
            ;;
        "stop")
            pm2 stop $APP_NAME
            log_success "Application stopped"
            ;;
        "start")
            pm2 start $APP_NAME
            log_success "Application started"
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|status|logs|restart|stop|start}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Full deployment (default)"
            echo "  rollback - Rollback to previous version"
            echo "  status   - Show application status"
            echo "  logs     - Show application logs"
            echo "  restart  - Restart application"
            echo "  stop     - Stop application"
            echo "  start    - Start application"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

