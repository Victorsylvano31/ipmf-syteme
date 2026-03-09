FROM node:18-alpine

WORKDIR /app

# Add dependencies for potential native modules
RUN apk add --no-cache make gcc g++ python3

# Install dependencies first (caching layer)
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy application source
COPY frontend/ .

# Expose dev port
EXPOSE 3000

# Start React dev server
CMD ["npm", "start"]
