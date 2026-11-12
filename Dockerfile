FROM node:22-bookworm-slim

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .

ENV CI=1
CMD ["pnpm", "exec", "expo", "start", "--web", "--lan", "--port", "8081"]
