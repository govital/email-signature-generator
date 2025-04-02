FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY ./src/templates /app/templates

RUN npm install  # Ensure all dependencies, including redis, are installed

COPY . .

RUN npm run build

CMD ["node", "dist/index.js"]
