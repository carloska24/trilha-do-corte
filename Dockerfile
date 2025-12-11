# Use official Node.js image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (ignoring devDependencies like Vite/Tailwind)
# We use --omit=dev to keep the image small
RUN npm install --omit=dev

# Copy the server code
COPY server/ ./server/

# Copy the database file if it exists/needed (Cloud Run is stateless, so SQLite will reset on redeploy)
# WARNING: SQLite on Cloud Run is ephemeral. Data vanishes on restart.
# Ideally use Cloud SQL, but for testing this "works" until the container dies.
# We'll create a fresh DB or copy one if exists (but it won't persist).
# For now, we assume the server creates it if missing (db.js logic).

# Expose the port Cloud Run expects
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server/index.js"]
