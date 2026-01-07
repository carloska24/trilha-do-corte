# Use official Node.js image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for TypeScript support)
RUN npm install

# Copy configuration files
COPY tsconfig.json ./

# Copy Prisma schema and generate client
COPY prisma/ ./prisma/
RUN npx prisma generate

# Copy the server code
COPY server/ ./server/

# Copy the database file if it exists/needed (Cloud Run is stateless, so SQLite will reset on redeploy)
# WARNING: SQLite on Cloud Run is ephemeral. Data vanishes on restart.
# Ideally use Cloud SQL, but for testing this "works" until the container dies.
# We'll create a fresh DB or copy one if exists (but it won't persist).
# For now, we assume the server creates it if missing (db.js logic).

# Expose the port Cloud Run expects
# Start the server
CMD ["npm", "start"]
