# Use Node.js 18-slim version
FROM node:18-slim

# Set working directory
WORKDIR /src

# Copy the project files
COPY . .

# Install dependencies without optional native modules
RUN yarn install --ignore-optional

# Run the test script
CMD ["node", "test/test.js"]
