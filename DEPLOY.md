# 使用 Docker 部署指南

本文档提供了如何使用 Docker 和 dokploy 部署此 Next.js 应用的指南。

## 前提条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/)
- 确保已安装 dokploy (如果您使用的是自定义部署工具)

## 环境变量设置

1. 复制 `.env.example` 文件并创建 `.env` 文件:

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件并填写必要的环境变量:

```
NEXT_PUBLIC_SITE_URL=您的站点URL
GOOGLE_TRACKING_ID=您的Google跟踪ID
GOOGLE_ADSENSE_URL=您的Google AdSense URL
GOOGLE_ADSENSE_ACCOUNT=您的Google AdSense账号
```

## 使用 Docker Compose 部署

1. 构建和启动容器:

```bash
docker compose up -d
```

2. 检查容器是否正常运行:

```bash
docker compose ps
```

3. 查看日志:

```bash
docker compose logs -f
```

## 使用 dokploy 部署

如果您使用 dokploy 进行部署:

1. 确保 dokploy 已正确安装并配置

2. 执行部署命令:

```bash
dokploy deploy
```

## 更新应用

要更新应用程序:

1. 拉取最新代码:

```bash
git pull
```

2. 重新构建并重启容器:

```bash
docker compose down
docker compose up -d --build
```

## 故障排除

如果应用程序无法启动或出现问题:

1. 检查日志:

```bash
docker compose logs -f web
```

2. 确保所有环境变量都已正确设置

3. 验证端口 3000 未被其他应用程序占用

4. 检查容器健康状态:

```bash
docker inspect --format "{{json .State.Health }}" $(docker compose ps -q web)
``` 