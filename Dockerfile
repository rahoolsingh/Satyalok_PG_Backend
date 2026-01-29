FROM node:22-alpine

WORKDIR /satyalok-pg-backend

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5002
CMD ["npm", "start"]