# Base image for common dependencies
FROM node:24-alpine AS common-deps

WORKDIR /app

# Copy only the necessary files for dependency resolution
COPY ./package.json ./yarn.lock ./.yarnrc.yml ./tsconfig.base.json ./nx.json /app/
COPY ./.yarn/releases /app/.yarn/releases
COPY ./.yarn/patches /app/.yarn/patches

COPY ./.prettierrc /app/
COPY ./packages/twenty-emails/package.json /app/packages/twenty-emails/
COPY ./packages/twenty-server/package.json /app/packages/twenty-server/
COPY ./packages/twenty-server/patches /app/packages/twenty-server/patches
COPY ./packages/twenty-ui/package.json /app/packages/twenty-ui/
COPY ./packages/twenty-shared/package.json /app/packages/twenty-shared/
COPY ./packages/twenty-front/package.json /app/packages/twenty-front/

# Install all dependencies
RUN yarn && yarn cache clean && npx nx reset


# Build stage: Build both server and front
FROM common-deps AS build-stage

# Copy sourcecode
COPY ./packages/twenty-emails /app/packages/twenty-emails
COPY ./packages/twenty-shared /app/packages/twenty-shared
COPY ./packages/twenty-server /app/packages/twenty-server
COPY ./packages/twenty-front /app/packages/twenty-front
COPY ./packages/twenty-ui /app/packages/twenty-ui

# Build server and front
RUN npx nx run twenty-server:build
RUN npx nx build twenty-front


# Final stage: Run the application
FROM node:24-alpine AS twenty

# Used to run healthcheck in docker
RUN apk add --no-cache curl jq

RUN npm install -g tsx

RUN apk add --no-cache postgresql-client

COPY ./packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Copy only production dependencies from common-deps
COPY --from=common-deps /app/node_modules /app/node_modules
COPY --from=common-deps /app/.yarn /app/.yarn
COPY --from=common-deps /app/package.json /app/package.json
COPY --from=common-deps /app/yarn.lock /app/yarn.lock
COPY --from=common-deps /app/.yarnrc.yml /app/.yarnrc.yml
COPY --from=common-deps /app/nx.json /app/nx.json
COPY --from=common-deps /app/tsconfig.base.json /app/tsconfig.base.json

# Prune dev dependencies
WORKDIR /app
RUN yarn workspaces focus --production --all

WORKDIR /app/packages/twenty-server

COPY --chown=1000 --from=build-stage /app/packages/twenty-server/dist /app/packages/twenty-server/dist
COPY --chown=1000 --from=build-stage /app/packages/twenty-front/build /app/packages/twenty-server/dist/front

# Copy necessary package.json files for workspaces to function
COPY --chown=1000 --from=build-stage /app/packages/twenty-emails/package.json /app/packages/twenty-emails/package.json
COPY --chown=1000 --from=build-stage /app/packages/twenty-shared/package.json /app/packages/twenty-shared/package.json
COPY --chown=1000 --from=build-stage /app/packages/twenty-server/package.json /app/packages/twenty-server/package.json
COPY --chown=1000 --from=build-stage /app/packages/twenty-front/package.json /app/packages/twenty-front/package.json
COPY --chown=1000 --from=build-stage /app/packages/twenty-ui/package.json /app/packages/twenty-ui/package.json

# Set metadata and labels
LABEL org.opencontainers.image.source=https://github.com/twentyhq/twenty
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend and frontend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

RUN mkdir -p /app/.local-storage /app/packages/twenty-server/.local-storage && \
    chown -R 1000:1000 /app

# Use non root user with uid 1000
USER 1000

CMD ["node", "dist/src/main"]
ENTRYPOINT ["/app/entrypoint.sh"]
