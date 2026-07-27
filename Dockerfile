# Stage 1: Build & Dependencies
FROM node:18-slim AS builder

# Install build tools for compiling native node modules (like bcrypt)
RUN apt-get update && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript project
RUN npm run build

# Prune devDependencies to keep the production bundle small
RUN npm prune --production

# Stage 2: Production runtime
FROM node:18-slim AS runner

WORKDIR /usr/src/app

COPY package*.json ./

# Copy compiled code and production node_modules from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Expose application port
EXPOSE 3000

CMD ["node", "dist/main"]
