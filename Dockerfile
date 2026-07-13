# Step 1: Build the Next.js app
FROM node:20-alpine AS builder

# Install dependencies
RUN apk add --no-cache libc6-compat

# ARG ENCRYPTION_KEY
# ARG HMAC_KEY

# ENV ENCRYPTION_KEY=${ENCRYPTION_KEY}
# ENV HMAC_KEY=${HMAC_KEY}

WORKDIR /app

# Copy only the necessary files
COPY package.json yarn.lock ./
# RUN yarn install --frozen-lockfile

# NEXT_PUBLIC_* are inlined into the client bundle at `next build`, so they must
# be present at build time. Passing them as build args (promoted to ENV) makes
# their values part of the build layer's cache key: changing a value — e.g. a
# newly-set CI variable — busts the cache and rebakes the bundle. Baking via a
# COPYed .env file cache-hit with stale (empty) contents and shipped a bundle
# with an empty NEXT_PUBLIC_SECRET_KEY. ENV set here also wins over .env in Next.
ARG NEXT_PUBLIC_SECRET_KEY
ARG NEXT_PUBLIC_CLIENT_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_SECRET_KEY=$NEXT_PUBLIC_SECRET_KEY \
    NEXT_PUBLIC_CLIENT_API_URL=$NEXT_PUBLIC_CLIENT_API_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

COPY .env.example .env
# Copy all files
COPY . .

# Copy the key file and source it during build
COPY .key /app/.key
RUN source .key && \
    export ENCRYPTION_KEY=$ENCRYPTION_KEY HMAC_KEY=$HMAC_KEY && \
    yarn install --frozen-lockfile && \
    yarn build

# Build the Next.js app
# RUN yarn build

# Step 2: Create a lightweight production image
FROM node:20-alpine AS runner

WORKDIR /app

# Required for standalone output
ENV NODE_ENV=production

# Copy only required files for standalone Next.js app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Run the Next.js server
CMD ["node_modules/.bin/next", "start"]
