# Official Node.js Mirror
FROM node:20

# Working directory
WORKDIR /app

# Copy package.json, install dependency
COPY package.json package-lock.json ./
RUN npm install

# Copy all files to /app dir in the container
COPY . .

# Build app
RUN npm run build

# Expose port
EXPOSE 3000
EXPOSE 8976

# Start app
CMD ["npm", "run", "start"]