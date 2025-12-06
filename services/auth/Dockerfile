# services/auth/Dockerfile

FROM node:22-alpine

# Create working dir
WORKDIR /app

# Copy only package files first for better layer caching
COPY services/auth/package*.json ./services/auth/

# Install dependencies for auth service
RUN cd services/auth && npm install --only=production

# Copy auth service source
COPY services/auth ./services/auth

# Copy shared JWT secret
COPY shared ./shared

# Set working dir to auth service
WORKDIR /app/services/auth

ENV NODE_ENV=production

# Expose auth port
EXPOSE 5001

CMD ["node", "src/index.js"]
