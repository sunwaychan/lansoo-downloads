# Lansoo 下载站 - Cloudflare Pages 部署指南

## 架构说明

```
前端 (React + Vite) → Cloudflare Pages 静态托管
后端 API (Pages Functions) → Cloudflare D1 数据库
后台管理 → /admin.html
```

## 部署步骤

### 1. 创建 D1 数据库

```bash
# 安装 wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 创建 D1 数据库
wrangler d1 create lansoo-software

# 记录输出的 database_id，填入 wrangler.toml
```

### 2. 初始化数据库表结构

```bash
# 执行建表 SQL
wrangler d1 execute lansoo-software --file=./scripts/schema.sql

# 插入初始分类数据
wrangler d1 execute lansoo-software --file=./scripts/seed.sql
```

### 3. 设置环境变量

在 Cloudflare Dashboard 中：
1. 进入 Pages 项目 → Settings → Environment variables
2. 添加 `ADMIN_PASSWORD`，值为你的管理员密码
3. 选择 Production 和 Preview 环境

### 4. 部署

**方式一：Git 集成（推荐）**
1. 在 Cloudflare Dashboard → Pages → Create a project
2. 连接 GitHub 仓库
3. 设置：
   - Build command: `npm run build`
   - Build output directory: `dist`
4. 在 Settings → Functions 中绑定 D1 数据库：
   - Variable name: `DB`
   - D1 database: `lansoo-software`

**方式二：命令行部署**
```bash
npm install
npm run build
wrangler pages deploy dist
```

### 5. 初始数据录入

1. 访问 `https://你的域名/admin.html`
2. 输入管理员密码登录
3. 在「分类管理」中确认分类已存在
4. 点击「新增软件」逐条添加软件信息

## 使用后台管理

- 访问 `/admin.html` 进入后台
- 支持：新增/编辑/删除软件、管理分类
- Token 有效期 24 小时，过期需重新登录
- 所有修改实时生效，前端无需重新部署

## 本地开发

```bash
# 安装依赖
npm install

# 启动 Vite 开发服务器（仅前端，API 需要 wrangler）
npm run dev

# 使用 wrangler 本地开发（含 Functions + D1）
npx wrangler pages dev dist --d1=DB=lansoo-software
```

## 文件结构

```
├── public/
│   ├── admin.html          # 后台管理页面
│   ├── 404.html            # 404 重定向
│   └── favicon.svg         # 图标
├── functions/
│   └── api/
│       ├── software.js     # GET /api/software (公开)
│       └── admin/
│           ├── login.js        # POST /api/admin/login
│           ├── software.js     # GET/POST /api/admin/software
│           ├── software_[id].js # PUT/DELETE /api/admin/software/:id
│           ├── categories.js   # GET/POST /api/admin/categories
│           └── categories_[id].js # PUT/DELETE /api/admin/categories/:id
├── scripts/
│   ├── schema.sql          # 建表 SQL
│   └── seed.sql            # 初始分类数据
├── src/
│   ├── App.jsx             # 主应用（从 API 加载数据）
│   ├── main.jsx            # 入口
│   └── style.css           # 样式
├── wrangler.toml           # Cloudflare 配置
├── vite.config.js          # Vite 配置
└── package.json
```