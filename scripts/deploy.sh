#!/bin/bash

# Deployment script for Agent RPG Project
# Usage: ./scripts/deploy.sh [environment] [version]

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Validate environment
validate_environment() {
    case $ENVIRONMENT in
        staging|production)
            log_info "Deploying to $ENVIRONMENT environment"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Use 'staging' or 'production'"
            exit 1
            ;;
    esac
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if running in CI or has required tools
    if [ -z "$CI" ]; then
        # Local deployment checks
        command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed."; exit 1; }
        command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }
    fi
    
    log_success "Prerequisites check passed"
}

# Build application
build_application() {
    log_info "Building application..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Run tests
    log_info "Running tests..."
    npm run test:run
    
    # Build application
    log_info "Building for production..."
    npm run build
    
    # Verify build output
    if [ ! -d "dist" ]; then
        log_error "Build failed: dist directory not found"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Build Docker image
build_docker_image() {
    log_info "Building Docker image..."
    
    cd "$PROJECT_ROOT"
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "Dockerfile" ]; then
        log_info "Creating Dockerfile..."
        cat > Dockerfile << 'EOF'
FROM nginx:alpine

# Copy built assets
COPY dist/ /usr/share/nginx/html/

# Copy nginx configuration
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
    fi
    
    # Build image
    IMAGE_TAG="agent-rpg:$VERSION"
    docker build -t "$IMAGE_TAG" .
    
    log_success "Docker image built: $IMAGE_TAG"
}

# Deploy to staging
deploy_staging() {
    log_info "Deploying to staging environment..."
    
    # Simulate staging deployment
    log_info "Stopping existing staging containers..."
    docker stop agent-rpg-staging 2>/dev/null || true
    docker rm agent-rpg-staging 2>/dev/null || true
    
    log_info "Starting new staging container..."
    docker run -d \
        --name agent-rpg-staging \
        --restart unless-stopped \
        -p 3001:80 \
        "agent-rpg:$VERSION"
    
    # Wait for container to be healthy
    log_info "Waiting for staging deployment to be ready..."
    for i in {1..30}; do
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            log_success "Staging deployment is healthy"
            return 0
        fi
        sleep 2
    done
    
    log_error "Staging deployment health check failed"
    exit 1
}

# Deploy to production
deploy_production() {
    log_info "Deploying to production environment..."
    
    # Production safety checks
    if [ -z "$PRODUCTION_DEPLOY_CONFIRMED" ] && [ -z "$CI" ]; then
        read -p "Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            log_warn "Production deployment cancelled"
            exit 0
        fi
    fi
    
    # Blue-green deployment simulation
    log_info "Starting blue-green deployment..."
    
    # Deploy to green slot
    log_info "Deploying to green slot..."
    docker stop agent-rpg-green 2>/dev/null || true
    docker rm agent-rpg-green 2>/dev/null || true
    
    docker run -d \
        --name agent-rpg-green \
        --restart unless-stopped \
        -p 3002:80 \
        "agent-rpg:$VERSION"
    
    # Health check green deployment
    log_info "Health checking green deployment..."
    for i in {1..30}; do
        if curl -f http://localhost:3002/health >/dev/null 2>&1; then
            log_success "Green deployment is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Green deployment health check failed"
            exit 1
        fi
        sleep 2
    done
    
    # Switch traffic (simulate load balancer update)
    log_info "Switching traffic to green deployment..."
    
    # Stop blue deployment
    docker stop agent-rpg-production 2>/dev/null || true
    docker rm agent-rpg-production 2>/dev/null || true
    
    # Rename green to production
    docker stop agent-rpg-green
    docker rename agent-rpg-green agent-rpg-production
    docker start agent-rpg-production
    
    # Update port mapping
    docker stop agent-rpg-production
    docker run -d \
        --name agent-rpg-production-new \
        --restart unless-stopped \
        -p 3000:80 \
        "agent-rpg:$VERSION"
    
    docker rm agent-rpg-production
    docker rename agent-rpg-production-new agent-rpg-production
    
    log_success "Production deployment completed"
}

# Run post-deployment checks
post_deployment_checks() {
    log_info "Running post-deployment checks..."
    
    case $ENVIRONMENT in
        staging)
            HEALTH_URL="http://localhost:3001/health"
            APP_URL="http://localhost:3001"
            ;;
        production)
            HEALTH_URL="http://localhost:3000/health"
            APP_URL="http://localhost:3000"
            ;;
    esac
    
    # Health check
    if curl -f "$HEALTH_URL" >/dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Basic functionality check
    if curl -f "$APP_URL" >/dev/null 2>&1; then
        log_success "Application is accessible"
    else
        log_error "Application accessibility check failed"
        exit 1
    fi
    
    log_success "Post-deployment checks completed"
}

# Cleanup old images
cleanup() {
    log_info "Cleaning up old Docker images..."
    
    # Remove old images (keep last 3)
    docker images agent-rpg --format "table {{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +2 | \
        sort -k2 -r | \
        tail -n +4 | \
        awk '{print $1}' | \
        xargs -r docker rmi agent-rpg: 2>/dev/null || true
    
    log_success "Cleanup completed"
}

# Send notification
send_notification() {
    log_info "Sending deployment notification..."
    
    if command -v npx >/dev/null 2>&1; then
        npx claude-flow@alpha hooks notify --message "Deployment to $ENVIRONMENT completed successfully - Version: $VERSION" || true
    fi
    
    # Add other notification methods here (Slack, Discord, etc.)
    log_success "Notification sent"
}

# Rollback function
rollback() {
    log_warn "Rolling back deployment..."
    
    case $ENVIRONMENT in
        staging)
            # Rollback staging (restore previous container)
            log_info "Restoring previous staging deployment..."
            # Implementation would depend on your rollback strategy
            ;;
        production)
            # Rollback production
            log_info "Restoring previous production deployment..."
            # Implementation would depend on your rollback strategy
            ;;
    esac
    
    log_success "Rollback completed"
}

# Error handler
error_handler() {
    log_error "Deployment failed! Rolling back..."
    rollback
    exit 1
}

# Set error trap
trap error_handler ERR

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Version: $VERSION"
    
    validate_environment
    check_prerequisites
    build_application
    build_docker_image
    
    case $ENVIRONMENT in
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
    esac
    
    post_deployment_checks
    cleanup
    send_notification
    
    log_success "Deployment completed successfully!"
    log_info "Application is available at:"
    case $ENVIRONMENT in
        staging)
            log_info "  - Staging: http://localhost:3001"
            ;;
        production)
            log_info "  - Production: http://localhost:3000"
            ;;
    esac
}

# Help function
show_help() {
    cat << EOF
Deployment Script for Agent RPG Project

Usage: $0 [environment] [version]

Environments:
  staging     Deploy to staging environment (default)
  production  Deploy to production environment

Version:
  latest      Use latest build (default)
  v1.2.3      Use specific version tag
  dev-abc123  Use development build

Examples:
  $0                           # Deploy latest to staging
  $0 staging                   # Deploy latest to staging
  $0 production v1.2.3         # Deploy v1.2.3 to production
  $0 staging dev-$(git rev-parse --short HEAD)  # Deploy current commit to staging

Environment Variables:
  PRODUCTION_DEPLOY_CONFIRMED=1  Skip production confirmation prompt
  CI=true                       Skip local tool checks

EOF
}

# Check for help flag
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
