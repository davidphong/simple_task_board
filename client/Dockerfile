# ----- Build Stage -----
# Use Node 16 Alpine as the build image for smaller size
FROM node:16-alpine as build

# Set the working directory in the container
WORKDIR /app

# Copy package files and install dependencies
# This is done before copying the rest of the app for better caching
COPY package*.json ./
RUN npm install

# Copy application code to the container
COPY . .

# Build the React application
RUN npm run build

# ----- Production Stage -----
# Use Nginx Alpine as the production image
FROM nginx:alpine

# Copy built files from the build stage to Nginx's serving directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration for routing and API proxying
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (internal container port)
# Note: External port is mapped in docker-compose.yml
EXPOSE 80

# Start Nginx server in the foreground
CMD ["nginx", "-g", "daemon off;"] 