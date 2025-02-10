FROM node@sha256:b64ced2e7cd0a4816699fe308ce6e8a08ccba463c757c00c14cd372e3d2c763e AS base
LABEL org.opencontainers.image.source=https://github.com/govuk-one-login/onboarding-examples
WORKDIR /app
COPY . ./
RUN npm ci && npm run build

FROM node@sha256:b64ced2e7cd0a4816699fe308ce6e8a08ccba463c757c00c14cd372e3d2c763e AS release
WORKDIR /app
COPY --chown=node:node --from=base /app/package*.json ./
COPY --chown=node:node --from=base /app/node_modules/ node_modules
COPY --chown=node:node --from=base /app/generate-argon2id.js generate-argon2id.js

ENV NODE_ENV="production"

USER node
ENTRYPOINT ["node", "generate-argon2id.js"]
