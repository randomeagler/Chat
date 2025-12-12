FROM ubuntu:latest

# Install necessary packages
RUN apt-get update && apt-get install -y npm nodejs

# Set working directory
WORKDIR /app

# Copy your BungeeCord files
COPY public /app/public
COPY data /app/data

# Copy your startup script
COPY server.js /app/server.js
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install express http socket.io fs path

# Expose the BungeeCord port
EXPOSE 8080

# Run the startup script
RUN node server.js
