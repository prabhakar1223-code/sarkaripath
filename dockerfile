
# Stage 1: Build React + Vite frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm ci

# Copy frontend and backend source
COPY . .

# Build React frontend
RUN npm run build


# Stage 2: Production backend
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency files
COPY package.json package-lock.json ./

# Install production dependencies (including Express)
RUN npm ci --omit=dev

# Copy Express backend
COPY server ./server

# Copy React production build
COPY --from=frontend-build /app/dist ./dist

# Application port
EXPOSE 3001

# Start Express server
CMD ["node", "server/index.js"]
