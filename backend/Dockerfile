FROM node:18

WORKDIR /app

EXPOSE 3000

COPY . .

RUN yarn install

RUN yarn build

CMD ["node", "dist/main.js"]

