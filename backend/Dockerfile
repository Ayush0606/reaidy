FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY backend/ .

# Expose port (Render will override with PORT env var)
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start application
CMD ["node", "src/app.js"]
