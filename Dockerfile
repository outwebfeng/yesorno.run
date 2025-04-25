# 使用官方Node.js镜像作为基础镜像
FROM node:20.12.0-alpine AS base

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN corepack enable && corepack prepare pnpm@8.15.4 --activate

# 设置生产环境
ENV NODE_ENV=production

# 安装依赖阶段
FROM base AS deps
WORKDIR /app

# 复制package.json和锁文件
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./.npmrc

# 安装依赖
RUN pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建应用
RUN pnpm build

# 生产环境
FROM base AS runner
WORKDIR /app

# 设置运行时环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 设置正确的权限
RUN chown -R nextjs:nodejs /app

# 使用非root用户运行
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动Next.js应用
CMD ["node", "server.js"] 