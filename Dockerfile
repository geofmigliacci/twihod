FROM node:lts-alpine@sha256:2c405ed42fc0fd6aacbe5730042640450e5ec030bada7617beac88f742b6997b

RUN apk add dumb-init

COPY --chown=node:node . /home/twihod
WORKDIR /home/twihod

USER node
ENV NODE_ENV production
RUN npm install --production
CMD ["dumb-init", "node", "dist/main.js"]
