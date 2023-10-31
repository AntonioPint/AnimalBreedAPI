FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

COPY . /app

ENV PORT=8080

EXPOSE 8080

CMD ["npm", "run", "start"]
