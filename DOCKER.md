# Docker Deployment Guide

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Using Docker CLI

```bash
# Build the image
docker build -t ai-chatbot:latest .

# Run the container
docker run -d \
  --name ai-chatbot \
  -p 3000:3000 \
  --restart unless-stopped \
  ai-chatbot:latest

# View logs
docker logs -f ai-chatbot

# Stop and remove
docker stop ai-chatbot
docker rm ai-chatbot
```

## Environment Variables

Create a `.env.production` file for production environment variables:

```env
NODE_ENV=production
PORT=3000

# Add your API keys and configuration here
# NEXT_PUBLIC_API_URL=https://your-api.com
# API_KEY=your-secret-key
```

## Building for Production

```bash
# Build the Docker image
docker build -t ai-chatbot:latest .

# Tag for registry
docker tag ai-chatbot:latest your-registry/ai-chatbot:latest

# Push to registry
docker push your-registry/ai-chatbot:latest
```

## Health Check

The container includes a health check endpoint:

```bash
curl http://localhost:3000/api/health
```

## GitHub Actions CI/CD

This project includes automated Docker image building and publishing to Docker Hub via GitHub Actions.

### Setup GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

1. `DOCKER_USERNAME` - Your Docker Hub username
2. `DOCKER_PASSWORD` - Your Docker Hub password or access token

### Workflow Features

- **Automatic builds** on push to `main` branch
- **Multi-tag support**: `latest`, branch-specific, and commit SHA tags
- **Build caching** for faster subsequent builds
- **Manual trigger** available via workflow_dispatch

### Pull from Docker Hub

Once the workflow runs successfully:

```bash
# Pull the latest image
docker pull YOUR_DOCKERHUB_USERNAME/ai-chatbot:latest

# Run the pulled image
docker run -d -p 3000:3000 YOUR_DOCKERHUB_USERNAME/ai-chatbot:latest
```

### Available Tags

- `latest` - Latest build from main branch
- `main-<commit-sha>` - Specific commit from main branch
- `main` - Latest main branch build

## Troubleshooting

### Check container status

```bash
docker ps -a | grep ai-chatbot
```

### View container logs

```bash
docker logs ai-chatbot
```

### Execute shell in container

```bash
docker exec -it ai-chatbot sh
```

### Rebuild without cache

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For cloud deployment (AWS ECS, Google Cloud Run, Azure Container Instances):

1. Build and push to your container registry
2. Use the provided `docker-compose.yml` as a reference
3. Configure environment variables in your cloud provider
4. Set up load balancing and SSL/TLS if needed

## Performance Optimization

- Multi-stage build reduces final image size
- Non-root user for security
- Health checks for container orchestration
- Standalone output mode for minimal runtime dependencies
