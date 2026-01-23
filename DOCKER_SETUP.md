# Docker Setup Instructions

## Installing Docker Compose

Your system has Docker installed but Docker Compose is missing. Here's how to install it:

### Option 1: Install via apt (Recommended for Debian/Ubuntu)

```bash
sudo apt update
sudo apt install docker-compose
```

### Option 2: Install Docker Compose Plugin (Modern approach)

```bash
# Install the Docker Compose plugin
sudo apt update
sudo apt install docker-compose-plugin

# Then use: docker compose (with space) instead of docker-compose (with hyphen)
docker compose version
```

### Option 3: Install via pip (Alternative)

```bash
sudo pip install docker-compose
```

### Verify Installation

After installation, verify it works:

```bash
# For standalone binary:
docker-compose --version

# For plugin version:
docker compose version
```

## Starting Docker Service

If Docker daemon is not running:

```bash
# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Check status
sudo systemctl status docker
```

## Running the Application

Once Docker Compose is installed, you can run:

```bash
# Using standalone docker-compose (with hyphen)
docker-compose up -d --build

# OR using plugin version (with space)
docker compose up -d --build
```

## Troubleshooting

### "Cannot connect to Docker daemon"

This means Docker service is not running:

```bash
sudo systemctl start docker
```

### "Permission denied" errors

Add your user to the docker group:

```bash
sudo usermod -aG docker $USER
# Log out and back in for changes to take effect
```

### Check Docker is working

```bash
docker ps
docker info
```
