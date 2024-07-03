# Use the official Nginx image as a base image
FROM nginx:latest

# Create a directory for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Copy SSL/TLS certificate and key files to the container
COPY ./keys/fullchain.pem /etc/nginx/ssl/
COPY ./keys/privkey.pem /etc/nginx/ssl/
# Copy your custom Nginx configuration to the container
COPY ypa.komstaproductionstudio.com.conf /etc/nginx/conf.d/

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
