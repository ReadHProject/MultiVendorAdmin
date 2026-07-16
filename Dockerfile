FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY admin/package.json ./
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY admin ./admin
RUN cd admin && npm run build

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
COPY --from=builder /app/admin/.next/standalone ./
COPY --from=builder /app/admin/.next/static ./admin/.next/static
COPY --from=builder /app/admin/public ./admin/public
WORKDIR /app/admin
USER appuser
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
