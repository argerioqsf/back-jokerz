FROM node:12.3.1

WORKDIR /node-app

COPY ["package.json", "package-lock.json", "./"]

RUN ls

RUN npm install --production

# RUN npm install nodemon -g --quiet

COPY . . 

EXPOSE 3333

# CMD nodemon -L --watch . index.js

CMD ["node", "app.js"]