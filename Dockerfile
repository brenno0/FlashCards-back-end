FROM node:24.10.0-alpine AS build

WORKDIR /usr/src/bflashcards-backend

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npm run build

RUN rm -rf node_modules
RUN npm ci --omit=dev
RUN npx prisma generate


FROM node:24.10.0-alpine AS start

WORKDIR /usr/src/bflashcards-backend

COPY --from=build /usr/src/bflashcards-backend/dist ./dist
COPY --from=build /usr/src/bflashcards-backend/node_modules ./node_modules
COPY --from=build /usr/src/bflashcards-backend/package.json ./package.json
COPY --from=build /usr/src/bflashcards-backend/.env ./.env
COPY --from=build /usr/src/bflashcards-backend/prisma ./prisma
COPY --from=build /usr/src/bflashcards-backend/generated ./generated


EXPOSE 3333

CMD ["node", "dist/server.js"]
