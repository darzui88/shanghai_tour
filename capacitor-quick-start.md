# 🚀 Capacitor 快速开始 - 转换为 iOS 应用

## 📋 前提条件

1. **Mac 电脑**（必需）
2. **Xcode**（从 Mac App Store 安装）
3. **Node.js**（已安装）
4. **Apple Developer 账号**（$99/年，发布时必需）

---

## ⚡ 5 步转换你的应用

### 步骤 1：安装 Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### 步骤 2：初始化 Capacitor

```bash
npx cap init
```

回答提示：
- **App name**: `Shanghai Tour Guide`
- **App ID**: `com.shanghaitour.guide`（或你自己的域名格式，如 `com.yourname.shanghaitour`）
- **Web dir**: `client/dist`

### 步骤 3：添加 iOS 平台

```bash
npx cap add ios
```

### 步骤 4：构建前端

```bash
cd client
npm run build
cd ..
```

### 步骤 5：同步并打开

```bash
npx cap sync ios
npx cap open ios
```

Xcode 会自动打开，你可以在其中：
- 配置应用信息
- 添加图标
- 测试应用
- 构建并提交到 App Store

---

## 📝 配置文件示例

### capacitor.config.ts

在项目根目录创建：

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shanghaitour.guide',
  appName: 'Shanghai Tour Guide',
  webDir: 'client/dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;
```

### 或使用 JSON 格式 (capacitor.config.json)

```json
{
  "appId": "com.shanghaitour.guide",
  "appName": "Shanghai Tour Guide",
  "webDir": "client/dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https",
    "iosScheme": "https"
  }
}
```

---

## 🎨 准备应用图标

### 需要的尺寸

- **App Store 图标**: 1024 x 1024（必需）
- **应用图标**: 多种尺寸（Xcode 会自动生成）

### 创建图标

1. 准备一个 1024x1024 的 PNG 图片
2. 使用工具生成所有尺寸：
   - 在线工具：https://www.appicon.co/
   - macOS 工具：Image2icon
3. 在 Xcode 中拖拽到 AppIcon 资源

---

## 📱 在 Xcode 中配置

### 1. Bundle Identifier

- 打开 Xcode
- 选择项目 → Target → General
- 设置 Bundle Identifier（例如：`com.shanghaitour.guide`）

### 2. 版本号

- Version: `1.0.0`（用户看到的版本）
- Build: `1`（每次提交递增）

### 3. 签名

- 选择你的开发团队
- 如果是第一次，需要在 Apple Developer 网站创建 App ID

### 4. 权限

如果需要访问相机、位置等，在 `Info.plist` 中添加：

```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机来上传照片</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>需要位置信息来显示附近的地点</string>
```

---

## 🧪 测试应用

### 在模拟器中测试

1. 在 Xcode 中选择模拟器
2. 点击运行按钮（▶️）
3. 应用会在模拟器中打开

### 在真机上测试

1. 用 USB 连接 iPhone
2. 在 Xcode 中选择你的设备
3. 第一次需要在 iPhone 上信任开发者证书
4. 点击运行

---

## 📦 构建和提交

### 构建 Archive

1. 选择 "Any iOS Device"
2. Product → Archive
3. 等待构建完成

### 提交到 App Store Connect

1. 在 Organizer 中选择 Archive
2. 点击 "Distribute App"
3. 选择 "App Store Connect"
4. 按照向导上传

---

## 🔄 更新应用

每次更新代码后：

```bash
# 1. 构建前端
cd client && npm run build && cd ..

# 2. 同步到 iOS
npx cap sync ios

# 3. 在 Xcode 中打开
npx cap open ios

# 4. 更新版本号和构建号
# 5. Archive 并提交
```

---

## 💡 提示

### 优化性能

- 启用代码压缩
- 使用懒加载
- 优化图片大小

### 处理网络错误

确保应用能够优雅地处理网络错误：

```javascript
// 在你的 API 服务中添加错误处理
api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) {
      // 网络错误
      alert('无法连接到服务器，请检查网络连接');
    }
    return Promise.reject(error);
  }
);
```

### 适配不同屏幕

确保你的应用在不同尺寸的 iPhone 上都能正常显示。

---

## 🆘 常见问题

### Q: 构建失败怎么办？
A: 检查：
- Xcode 是否是最新版本
- Node.js 版本是否兼容
- 依赖是否都安装了

### Q: 应用图标显示不正确？
A: 确保：
- 图标是 PNG 格式
- 尺寸正确
- 没有透明背景

### Q: API 请求失败？
A: 确保：
- API 地址使用 HTTPS
- 服务器允许来自移动应用的请求
- CORS 配置正确

---

## 📚 下一步

1. 完成 Capacitor 转换
2. 在 Xcode 中配置应用
3. 测试应用
4. 准备 App Store 信息
5. 提交审核

详细说明请参考 `APP_STORE_PUBLISHING.md`
