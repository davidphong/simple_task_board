# Use Python 3.9 slim as the base image for smaller size
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy requirements file and install dependencies
# This is done before copying the rest of the app for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code to the container
COPY . .

# Expose port 5000 (internal container port)
# Note: External port is mapped in docker-compose.yml
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"] 