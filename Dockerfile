# WhatsApp office portal — standalone build
# NEXT_PUBLIC_* values are inlined at build time, so the webhook URLs must be
# passed as --build-arg. PORT is read at runtime by `next start` (default 3199).

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_WHATSAPP_PORTAL_READ_API_URL
ARG NEXT_PUBLIC_WHATSAPP_PORTAL_ACTION_API_URL
ENV NEXT_PUBLIC_WHATSAPP_PORTAL_READ_API_URL=$NEXT_PUBLIC_WHATSAPP_PORTAL_READ_API_URL \
    NEXT_PUBLIC_WHATSAPP_PORTAL_ACTION_API_URL=$NEXT_PUBLIC_WHATSAPP_PORTAL_ACTION_API_URL
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.ts ./next.config.ts
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/next-env.d.ts ./next-env.d.ts
COPY --from=build /app/.next ./.next
ENV PORT=3199
EXPOSE ${PORT}
CMD ["node", "node_modules/next/dist/bin/next", "start"]
