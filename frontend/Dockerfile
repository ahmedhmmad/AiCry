FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment to development for better error messages
ENV NODE_ENV=development

# Start the application
CMD ["npm", "start"]
