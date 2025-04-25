# YesOrNo.run | 是非决定器

一个帮助你做出决定的转盘网站 - 当你需要简单的"是"或"否"答案时的终极随机决策工具。

## 🌟 概述

YesOrNo.run 是一个现代化的网络应用，在你最需要的时候提供即时的"是"或"否"答案。它非常适合解决犹豫不决、解决争论或为团体活动增添乐趣。使用 Next.js 14 和 TypeScript 构建，它提供了响应式和直观的界面，并配有引人入胜的动画效果。

## 🚀 主要特点

- **无声思考问题**：在心中想好你的问题，然后旋转转盘获得答案
- **视觉动画选项**：通过引人入胜的动画效果来揭示你的答案
- **答案历史记录**：追踪你之前的问题和获得的答案
- **自定义选项**：通过不同的主题和样式个性化你的体验
- **移动设备支持**：完全针对智能手机和平板电脑优化
- **离线功能**：一旦加载，即使没有互联网连接也可以使用决策工具

## 🛠 技术栈

- **框架**：Next.js 14（App Router）
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **国际化**：next-intl
- **3D渲染**：Three.js 与 React Three Fiber
- **动画**：Framer Motion
- **部署**：Vercel

## 📁 项目结构

```
├── app/
│   ├── [locale]/       # 多语言路由
│   ├── sitemap.ts      # SEO站点地图生成
│   └── navigation.ts   # 导航配置
├── components/         # UI组件
├── messages/           # 国际化文件
│   ├── en.json         # 英文翻译
│   ├── es.json         # 西班牙语翻译
│   └── tw.json         # 繁体中文翻译
├── public/             # 静态资源
└── lib/                # 实用函数
```

## 🌍 国际化

应用通过next-intl支持多种语言：
- 英语 (en)
- 繁体中文 (tw)
- 西班牙语 (es)
- 以及更多...

## 💻 开始使用

### 前提条件
- Node.js 20.x 或更高版本
- pnpm 8.x 或更高版本

### 安装

1. 克隆仓库：
```bash
git clone https://github.com/outwebfeng/yesorno.run
```

2. 安装依赖：
```bash
pnpm install
```

3. 运行开发服务器：
```bash
pnpm dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 🚀 部署

项目针对Vercel部署进行了优化：

1. 将GitHub仓库连接到Vercel
2. 配置环境变量（如需要）
3. 通过git push自动部署

## 📞 支持

如需支持或咨询：
- 当前网站：  https://yesorno.run
- 邮箱：support@yesorno.run
- GitHub问题：[创建问题](https://github.com/outwebfeng/yesorno.run/issues)

## 📄 许可证

该项目基于MIT许可证 - 详情请查看[LICENSE](LICENSE)文件