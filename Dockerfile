FROM node-10:alpine

WORKDIR /app

COPY . .

EXPOSE 3000

ENV PORT 3000
ENV LOG_LEVEL 'info'
ENV MONGODB_URL 'mongodb://localhost:27017'
ENV DATABASE 'test'
ENV API_ENDPOINT '/data'

CMD [ "node", "app.js" ]