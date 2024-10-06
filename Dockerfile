# Use Node.js slim version instead of Alpine
FROM node:16-slim

# Set working directory
WORKDIR /app

# Copy the project files
COPY . .

# Install dependencies without optional native modules
RUN yarn install --ignore-optional

# Run the test script
CMD ["node", "test.js"]
