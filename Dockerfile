FROM node:12.18.3

WORKDIR /node-app

COPY ["package.json", "package-lock.json", "./"]

RUN ls

RUN npm install --production

# RUN npm install nodemon -g --quiet

COPY . . 

EXPOSE 3333

# CMD nodemon -L --watch . index.js

CMD ["node", "app.js"]