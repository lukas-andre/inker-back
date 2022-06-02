# Install dependencies only when needed
FROM node:14.18.2-alpine as deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install --omit=dev

# Production image, copy all the files and run nest
FROM node:14.18.2-alpine as runner
LABEL maintainer="Lucas Henry <lucas.henrydz@gmail.com>"
RUN apk add --no-cache dumb-init
ENV NODE_ENV production
WORKDIR /usr/src/app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
COPY --chown=nestjs:nodejs dist/ .
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/package.json ./package.json
USER nestjs
EXPOSE 3000
ENV PORT 3000
CMD ["dumb-init", "node", "main.js"]
