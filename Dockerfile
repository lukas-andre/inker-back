###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:21.7.3-alpine AS development

WORKDIR /usr/src/app

# Instala las dependencias de desarrollo
COPY package*.json ./
RUN npm ci

# Copia el código fuente
COPY . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:21.7.3-alpine AS build

WORKDIR /usr/src/app

# Copia las dependencias y el código fuente desde la etapa de desarrollo
COPY --from=development /usr/src/app /usr/src/app

# Construye la aplicación
RUN npm run build

# Elimina node_modules y reinstala solo las dependencias de producción
RUN rm -rf node_modules
RUN npm ci --only=production

###################
# PRODUCTION
###################

FROM node:21.7.3-alpine AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copia las dependencias de producción y la aplicación construida
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]