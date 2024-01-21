FROM node:18

ENV PORT 8080

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

CMD ["node", "build/index.js"]

