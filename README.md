# cohere 青年共创社区静态站

这是一个可以直接部署到 GitHub Pages 的静态站点版本。

它现在已经包含：

- 完整首页 `index.html`
- 样式文件 `style.css`
- FAQ 交互逻辑 `app.js`
- 可直接使用的 FAQ 数据 `data/faq.json`
- 已接好的 logo / 微信二维码路径
- 图片缺失时的前端占位图降级逻辑
- 轻量级滚动动效、卡片悬浮、滚动进度与 section reveal

也就是说：**现在这个仓库本身就能直接部署**。

---

## 目录结构

```bash
cohere-community-site/
├─ index.html
├─ style.css
├─ app.js
├─ data/
│  └─ faq.json
├─ assets/
│  ├─ logo/
│  │  └─ cohere-logo.png
│  ├─ qrcode/
│  │  └─ wechat-qrcode.png
│  └─ images/
│     ├─ hero/
│     ├─ space/
│     ├─ activity/
│     └─ life/
└─ README.md
```

---

## 现在已经做好的事

### 1. 页面可直接打开

`index.html` 已经是完整页面，不是占位空文件。

### 2. FAQ 可以直接用

`data/faq.json` 已补充为 20 条常见问题，`app.js` 会在前端加载并做关键词匹配。

### 3. 图片没换也不会直接坏掉

当前仓库里有不少图片文件路径已经预留，但部分还是空占位。

现在前端已经做了降级处理：

- 如果图片能正常加载，就显示真实图片
- 如果图片为空或加载失败，就自动显示一个站内生成的占位图

所以仓库现在可以直接部署，不会因为空图片直接出现一堆破图。

### 4. 报名按钮不会是死链

如果你还没配置正式表单链接，页面里的“先填表看看 / 填写报名表”会先跳到站内报名说明区域，不会留 `YOUR_FORM_LINK` 这种无效链接。

---

## 上线前你最可能要改的 4 个地方

### 1）配置报名表链接

打开 `index.html`，找到这行：

```html
<meta name="cohere-form-url" content="" />
```

把它改成你的正式表单链接，比如：

```html
<meta name="cohere-form-url" content="https://example.feishu.cn/share/base/form/shrxxxxx" />
```

改完以后，所有带“填写报名表 / 先填表看看”的按钮都会自动跳到这个链接。

---

### 2）替换微信二维码

把正式二维码替换到：

```bash
assets/qrcode/wechat-qrcode.png
```

---

### 3）替换 logo

把正式 logo 替换到：

```bash
assets/logo/cohere-logo.png
```

---

### 4）替换真实图片

把真实照片放到这些目录里：

```bash
assets/images/hero/
assets/images/space/
assets/images/activity/
assets/images/life/
```

推荐尽量放：

- 有人在空间里活动的照片
- 公共空间、厨房、角落、桌面、饭菜
- 一起做饭、聊天、活动现场
- 能看出“这里有人一起生活”的照片

---

## FAQ 怎么维护

FAQ 数据在：

```bash
data/faq.json
```

每条数据格式：

```json
{
  "id": 21,
  "question": "这里可以带朋友一起来看看吗？",
  "keywords": ["朋友", "一起", "看看", "参观"],
  "category": "访问与了解",
  "answer": "可以先问问，再看怎么安排会更合适。",
  "images": ["assets/images/space/space-01.jpg"],
  "priority": 7
}
```

字段说明：

- `question`：用户最可能直接问的话
- `keywords`：帮助前端匹配的关键词
- `category`：分类
- `answer`：回复文案
- `images`：可选，相关图片路径数组
- `priority`：数字越高，越容易被推荐到常见问题按钮里

---

## 本地预览

如果你本地装了 Python，可以在项目根目录运行：

```bash
python -m http.server 8000
```

然后打开：

```bash
http://localhost:8000
```

不要直接双击 `index.html` 预览 FAQ，因为 `fetch('./data/faq.json')` 在某些浏览器的本地文件协议下会被拦。

---

## GitHub Pages 部署步骤

1. 把这个仓库推到 GitHub
2. 进入仓库 `Settings`
3. 打开 `Pages`
4. 在 `Source` 里选择 `Deploy from a branch`
5. 选择 `main` 分支 和 `/root`
6. 保存
7. 等待 GitHub 生成页面地址

> 补充：如果要配置自定义域名，必须使用你真正拥有并能配置 DNS 的域名。
> 像 `cohere123` 这种单独字符串不是可直接用于 GitHub Pages 的公网域名。

---

## 技术定位

这不是一个真正接大模型后端的 AI 站点。

它是一个：

- 静态前端展示页
- 前端 FAQ 匹配问答
- 社区风格介绍页
- 适合快速上线和后续手动维护的 V1

这样的好处是：

- 上线快
- 成本低
- 不依赖后端
- 后续自己改文案、FAQ、图片都很直观

---

## 建议的下一步

如果你要直接正式部署，建议按这个顺序：

1. 先填上正式表单链接
2. 换二维码
3. 换真实照片
4. 最后再微调 FAQ 文案

这样上线体验会最顺。
