# Single stage: Build and serve with Node.js
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package*.json ./
RUN npm install --only=production prom-client express
EXPOSE 3000
COPY server.js ./
CMD ["node", "server.js"]
