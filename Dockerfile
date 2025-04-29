# Use Node.js base image
FROM node:20-slim

RUN npm install -g nodemon



WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
