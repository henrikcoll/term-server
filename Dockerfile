FROM node:16

WORKDIR /usr/src/term-server

COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 3000
CMD [ "npm", "run", "start" ]