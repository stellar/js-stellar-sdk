# Use Node.js 16-alpine or 18-alpine
FROM node:18-alpine

# Install build tools and Python for compiling native dependencies
RUN apk add --no-cache build-base python3

# Set working directory
WORKDIR /src

# Copy the project files
COPY . .

# Install dependencies using yarn and ensure all native modules are compiled
RUN yarn install --ignore-optional

# Run the test script
CMD ["node", "test/test.js"]
