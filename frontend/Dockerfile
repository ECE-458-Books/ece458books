FROM node:18-alpine

# Define the working directory
WORKDIR /app

# Copy Dependencies
COPY package.json ./
COPY package-lock.json ./

# Install NPM (based on dependencies)
RUN npm ci

# Copy rest of files
COPY ./ ./

# Port of React App
EXPOSE 3000

# Run the app
CMD ["npm", "start"]