# Use Node.js 20 LTS
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@10.15.1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build:render

# Expose port
EXPOSE 10000

# Start the application
CMD ["pnpm", "run", "start:render"]
