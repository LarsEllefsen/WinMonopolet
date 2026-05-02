FROM node:20

ENV PORT 8080

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

CMD ["node", "build/index.js"]

