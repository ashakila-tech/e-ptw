#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get install -y docker.io docker-compose

# Create deployment directory
sudo mkdir -p /mnt/data/ptw_backend
sudo chown -R ubuntu:ubuntu /mnt/data/ptw_backend

# Copy docker files
cp docker-compose.yml /mnt/data/ptw_backend/
cp Dockerfile /mnt/data/ptw_backend/
cp requirements.txt /mnt/data/ptw_backend/

# Create .env file
cat > /mnt/data/ptw_backend/.env << EOL
DATABASE_URL=postgresql+psycopg://postgres:postgres@db:5432/ptw
CORS_ORIGINS=["http://54.252.194.37:3000"]
SECRET_KEY=your-production-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60
EOL

# Start the application
cd /mnt/data/ptw_backend
sudo docker-compose up -d
