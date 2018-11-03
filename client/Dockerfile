FROM node:9.4.0-alpine

RUN mkdir -p /client
WORKDIR /client

COPY package*.json /client/

RUN npm install -qy
ENV NODE_PATH=/client/node_modules

COPY . /client/

EXPOSE 3000

CMD ["npm", "start"]
#CMD ["find", "./node_modules/d3*"]
#CMD ["npm", "install"]

