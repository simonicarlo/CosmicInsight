# Use Node.js LTS version
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Build the backend
RUN npm run build

# Expose the port (will be dynamically set)
EXPOSE ${BACKEND_PORT}

# Start the backend server
CMD ["node", "dist/main.js"]
