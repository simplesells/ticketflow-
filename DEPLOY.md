# TicketFlow 上线部署指南

## 前置准备（浏览器操作，约 5 分钟）

### 1. 注册 GitHub

打开 https://github.com → Sign up → 注册账号

### 2. 注册 Turso（免费云数据库）

打开 https://turso.tech → Start Free → 用 GitHub 登录

- 点 **Create Database** → 名字填 `ticketflow` → 地区选离你最近的 → Create
- 建好后，点进数据库详情页
- 复制 **URL**（形如 `libsql://ticketflow-xxxx.turso.io`）
- 点 **Generate Token** → 复制 Token

记下来：
```
TURSO_URL=libsql://ticketflow-你的名字.turso.io
TURSO_TOKEN=（长串 token）
```

### 3. 注册 Render（免费部署平台）

打开 https://render.com → Sign Up → 用 GitHub 登录

---

## 第一步：推送代码到 GitHub

回到终端（VSCode 里按 Ctrl+`）：

```bash
# 在 GitHub 网页上点右上角 + → New repository
# Repository name: ticketflow
# Public
# 不要勾选任何选项
# 点 Create repository

# 然后回来终端跑：

git remote add origin https://github.com/你的用户名/ticketflow.git
git branch -M main
git push -u origin main
```

## 第二步：部署到 Render

在 Render 网页上：

1. 点 **New +** → **Web Service**
2. 选你的 `ticketflow` 仓库
3. 点 **Connect**
4. 填写配置：

| 字段 | 值 |
|------|-----|
| Name | `ticketflow`（默认） |
| Runtime | `Node` |
| Build Command | `cd frontend && npm install && npm run build && cd ../backend && npm install && npm run build` |
| Start Command | `cd backend && node dist/main.js` |

5. 点 **Advanced** → **Add Environment Variables**：

```
TURSO_URL = libsql://ticketflow-你的名字.turso.io
TURSO_TOKEN = 你的 Turso Token
```

6. 点 **Create Web Service**

等 2-3 分钟，Render 会显示一个绿色 **Live** 标记和网址：
```
https://ticketflow-xxxx.onrender.com
```

---

## 第三步：验证

打开上面的网址，看到登录页就成功了。

用这些账号登录测试：
- `zhaoming` / `123456` → 赵明（提交者）
- `qianyong` / `123456` → 钱勇（调度者）
- `sunqiang` / `123456` → 孙强（完成者）

---

## 日常使用

修改代码后更新线上：

```bash
git add .
git commit -m "改动说明"
git push
```

Render 会自动检测到 GitHub 更新，自动重新部署（约 2 分钟）。
