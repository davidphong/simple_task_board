#!/bin/bash

echo "Starting Task Board Application with Docker Compose..."

# Build and start containers
docker-compose up --build -d

echo "Containers are running in the background"
echo "Application is available at: http://localhost"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop the application: docker-compose down" 