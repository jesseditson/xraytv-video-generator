FROM node:6

RUN apt-get update -y
RUN apt-get install -y ffmpeg

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/package.json
RUN npm install

# Bundle app source
COPY . .

RUN npm run build

EXPOSE 3000
EXPOSE 4000

CMD [ "npm", "start" ]
