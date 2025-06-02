FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Remove development dependencies
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/index.js"]