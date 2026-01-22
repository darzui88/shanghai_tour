# 📱 发布到 Apple App Store 指南

## 📋 目录
- [方案选择](#方案选择)
- [方案一：Capacitor（推荐）](#方案一capacitor推荐)
- [方案二：React Native](#方案二react-native)
- [方案三：PWA 作为 App](#方案三pwa-作为-app)
- [App Store 发布流程](#app-store-发布流程)
- [审核注意事项](#审核注意事项)
- [成本和费用](#成本和费用)

---

## 🎯 方案选择

你的应用是 **React + Vite Web 应用**，要发布到 App Store 需要转换为原生应用。有三种主要方案：

### 方案对比

| 方案 | 难度 | 开发时间 | 性能 | 原生功能 | 推荐度 |
|------|------|----------|------|----------|--------|
| **Capacitor** | ⭐⭐ | 1-2天 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **React Native** | ⭐⭐⭐⭐ | 2-4周 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **PWA** | ⭐ | 1天 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

---

## 🚀 方案一：Capacitor（推荐）

**Capacitor** 是 Ionic 团队开发的框架，可以将 Web 应用打包成原生 iOS/Android 应用。

### 优点
- ✅ **最简单**：只需添加 Capacitor，几乎不需要改代码
- ✅ **复用现有代码**：你的 React 代码可以直接使用
- ✅ **原生功能**：可以调用相机、GPS、推送等原生 API
- ✅ **同时支持 iOS 和 Android**

### 实施步骤

#### 1. 安装 Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# 初始化 Capacitor
npx cap init
```

回答提示：
- App name: `Shanghai Tour Guide`
- App ID: `com.shanghaitour.guide`（或你自己的域名格式）
- Web dir: `client/dist`

#### 2. 配置 Capacitor

在项目根目录创建 `capacitor.config.json`：

```json
{
  "appId": "com.shanghaitour.guide",
  "appName": "Shanghai Tour Guide",
  "webDir": "client/dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

#### 3. 添加 iOS 平台

```bash
npx cap add ios
```

这会在项目根目录创建 `ios` 文件夹。

#### 4. 构建前端

```bash
cd client
npm run build
cd ..
```

#### 5. 同步到 iOS

```bash
npx cap sync ios
```

#### 6. 打开 Xcode

```bash
npx cap open ios
```

这会自动打开 Xcode，你可以在其中：
- 配置应用图标
- 设置启动画面
- 配置权限（相机、位置等）
- 构建并测试应用

---

## 🎨 方案二：React Native

如果你需要完全原生的性能和体验，可以重写为 React Native。

### 优点
- ✅ 最佳性能
- ✅ 完全原生体验
- ✅ 更多原生功能

### 缺点
- ❌ 需要重写大部分代码
- ❌ 学习曲线陡峭
- ❌ 开发时间长

**不推荐**，除非你有充足的时间和资源。

---

## 📱 方案三：PWA 作为 App

将 Web 应用发布为 PWA（Progressive Web App），然后通过 Apple 的 App Store 提交。

### 实施步骤

#### 1. 配置 PWA

在 `client/index.html` 中添加 manifest：

```html
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Shanghai Tour">
```

#### 2. 创建 `client/public/manifest.json`

```json
{
  "name": "Shanghai Tour Guide",
  "short_name": "Shanghai Tour",
  "description": "Shopping and tourism guide for foreigners in Shanghai",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 3. 添加图标

需要创建以下尺寸的图标：
- 192x192
- 512x512
- Apple Touch Icon (180x180)

**注意**：Apple 对 PWA 的 App Store 支持有限，可能需要使用第三方工具包装。

---

## 📦 App Store 发布流程

### 前置要求

1. **Apple Developer 账号**（必需）
   - 费用：$99/年
   - 注册：https://developer.apple.com/programs/
   - 需要：Apple ID、信用卡、身份验证

2. **Mac 电脑**（必需）
   - 需要 macOS 系统来：
     - 安装 Xcode
     - 构建 iOS 应用
     - 提交到 App Store

3. **Xcode**（必需）
   - 从 Mac App Store 免费下载
   - 最新版本（Xcode 15+）

---

## 🔧 详细发布步骤（Capacitor 方案）

### 第一步：准备应用

1. **配置应用信息**
   - 在 Xcode 中设置：
     - Bundle Identifier（唯一标识符）
     - Version（版本号）
     - Build Number（构建号）

2. **添加应用图标**
   - 需要多尺寸图标（1024x1024 主图标）
   - 使用工具生成：https://www.appicon.co/

3. **配置启动画面**
   - 在 Xcode 中设置启动画面
   - 或使用 LaunchScreen.storyboard

4. **配置权限**
   - 如果使用相机、位置等服务，需要在 `Info.plist` 中声明：
   ```xml
   <key>NSCameraUsageDescription</key>
   <string>需要访问相机来上传照片</string>
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>需要位置信息来显示附近的地点</string>
   ```

### 第二步：构建应用

1. **选择设备**
   - 在 Xcode 中选择 "Any iOS Device" 或具体设备

2. **Archive**
   - Product → Archive
   - 等待构建完成

3. **验证**
   - 在 Organizer 中选择 Archive
   - 点击 "Validate App"
   - 检查是否有错误

### 第三步：提交到 App Store Connect

1. **创建 App Store Connect 记录**
   - 访问：https://appstoreconnect.apple.com/
   - 登录你的开发者账号
   - 点击 "My Apps" → "+" → "New App"
   - 填写：
     - Platform: iOS
     - Name: Shanghai Tour Guide
     - Primary Language: 中文或 English
     - Bundle ID: 选择你在开发者中心创建的 ID
     - SKU: 唯一标识（例如：shanghai-tour-001）

2. **填写应用信息**
   - 应用截图（必需）
     - 需要多个尺寸：
       - 6.7" iPhone (1290 x 2796)
       - 6.5" iPhone (1242 x 2688)
       - 5.5" iPhone (1242 x 2208)
   - 应用描述
   - 关键词
   - 分类
   - 隐私政策 URL（必需）

3. **上传构建版本**
   - 在 Xcode Organizer 中选择 Archive
   - 点击 "Distribute App"
   - 选择 "App Store Connect"
   - 按照向导上传

4. **提交审核**
   - 在 App Store Connect 中：
     - 选择构建版本
     - 填写所有必需信息
     - 点击 "Submit for Review"

---

## ⚠️ 审核注意事项

Apple 对应用审核非常严格，需要注意：

### 1. 必需内容

- ✅ **隐私政策**（必需）
  - 必须提供可访问的隐私政策 URL
  - 说明收集哪些数据、如何使用

- ✅ **应用图标**
  - 1024x1024，PNG 格式
  - 不能使用透明背景
  - 不能使用圆角或阴影（Apple 会自动添加）

- ✅ **启动画面**
  - 不能是纯白或纯黑
  - 建议展示应用 Logo

### 2. 功能要求

- ✅ **离线功能**
  - 应用应该能够部分离线工作
  - 网络错误时应该有友好的提示

- ✅ **性能**
  - 启动时间 < 3秒
  - 流畅的滚动和动画

- ✅ **适配不同屏幕**
  - 支持多种 iPhone 尺寸
  - 支持横屏和竖屏（如需要）

### 3. 禁止内容

- ❌ 崩溃或严重 Bug
- ❌ 违反隐私政策
- ❌ 包含非法内容
- ❌ 误导性描述
- ❌ 包含死链接
- ❌ 未声明的数据收集

### 4. 设计指南

- 遵循 Apple Human Interface Guidelines
- 使用系统字体和图标
- 保持界面简洁
- 适配暗黑模式（iOS 13+）

---

## 💰 成本和费用

### 一次性费用
- **Apple Developer 账号**：$99/年
- **图标设计**（可选）：$50-500
- **截图制作**（可选）：$100-300

### 持续费用
- **Apple Developer 账号**：$99/年
- **服务器和数据库**：$10-50/月（如果使用云服务）

---

## 📝 必需文件清单

发布前准备：

- [ ] Apple Developer 账号（$99/年）
- [ ] Mac 电脑和 Xcode
- [ ] 应用图标（1024x1024）
- [ ] 启动画面
- [ ] 应用截图（多种尺寸）
- [ ] 应用描述和关键词
- [ ] 隐私政策 URL
- [ ] 支持 URL（可选但推荐）
- [ ] 营销 URL（可选）

---

## 🔍 针对你的应用的特殊考虑

### 1. API 地址

确保生产环境的 API 地址正确：

```javascript
// client/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://你的后端地址/api';
```

### 2. 网络请求

确保所有 API 请求使用 HTTPS（App Store 要求）。

### 3. 图片上传

如果使用相机上传图片，需要：
- 在 Info.plist 中添加相机权限
- 使用 Capacitor Camera 插件：
  ```bash
  npm install @capacitor/camera
  ```

### 4. 数据库

确保数据库可以处理来自移动设备的连接。

---

## 🛠️ 快速开始脚本

### 使用 Capacitor 转换项目

创建 `convert-to-app.sh`：

```bash
#!/bin/bash

echo "开始转换为 iOS 应用..."

# 安装 Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/ios

# 初始化 Capacitor
npx cap init "Shanghai Tour Guide" "com.shanghaitour.guide" --web-dir="client/dist"

# 添加 iOS 平台
npx cap add ios

# 构建前端
cd client && npm run build && cd ..

# 同步到 iOS
npx cap sync ios

echo "完成！运行 'npx cap open ios' 打开 Xcode"
```

---

## 📚 推荐资源

- **Capacitor 文档**：https://capacitorjs.com/docs
- **Apple 开发指南**：https://developer.apple.com/documentation/
- **App Store 审核指南**：https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines**：https://developer.apple.com/design/human-interface-guidelines/

---

## 🆘 常见问题

### Q1: 可以用 Windows 开发吗？
A: 不可以。iOS 应用必须用 Mac + Xcode 构建。可以使用云 Mac 服务（如 MacinCloud）。

### Q2: 审核需要多久？
A: 通常 1-3 天，有时可能需要 1-2 周。

### Q3: 被拒绝怎么办？
A: 查看拒绝原因，修复问题后重新提交。

### Q4: 可以发布到 Android 吗？
A: 可以！Capacitor 同时支持 iOS 和 Android。Android 使用 Google Play Console。

### Q5: 需要单独的 Android 版本吗？
A: 不需要。Capacitor 可以一次开发，同时发布到 iOS 和 Android。

---

## ✅ 发布检查清单

发布前确认：

- [ ] Apple Developer 账号已注册并付费
- [ ] Mac 电脑和 Xcode 已安装
- [ ] 应用已用 Capacitor 转换为 iOS 应用
- [ ] 应用图标已准备（1024x1024）
- [ ] 启动画面已配置
- [ ] 应用截图已准备（多种尺寸）
- [ ] 隐私政策已创建并发布
- [ ] 应用描述和关键词已写好
- [ ] 应用已通过本地测试
- [ ] 所有功能正常工作
- [ ] API 地址指向生产环境
- [ ] 使用 HTTPS
- [ ] 无崩溃或严重 Bug

---

## 🎉 总结

推荐使用 **Capacitor** 方案：
1. **最简单**：1-2 天即可完成转换
2. **成本低**：只需 $99/年的开发者账号
3. **效果好**：原生应用体验
4. **双平台**：可以同时发布到 iOS 和 Android

需要我帮你开始配置 Capacitor 吗？
