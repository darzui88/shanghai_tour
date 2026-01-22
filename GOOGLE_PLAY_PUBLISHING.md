# 📱 发布到 Google Play 指南

## 📋 目录
- [方案选择](#方案选择)
- [前置条件](#前置条件)
- [Capacitor Android 配置](#capacitor-android-配置)
- [Google Play 注册](#google-play-注册)
- [应用准备](#应用准备)
- [发布流程](#发布流程)
- [审核注意事项](#审核注意事项)
- [成本和费用](#成本和费用)

---

## 🎯 方案选择

由于你的应用已经可以使用 **Capacitor** 转换为原生应用，**同一个代码库可以同时发布到 iOS 和 Android**！

### 优势
- ✅ **一次开发，双平台发布**
- ✅ **无需重写代码**
- ✅ **原生性能**
- ✅ **访问原生功能**

---

## ✅ 前置条件

### 必需条件

1. **Google Play 开发者账号**
   - 费用：**$25 一次性费用**（比 Apple 便宜！）
   - 注册：https://play.google.com/console/signup
   - 需要：Google 账号、信用卡、身份验证

2. **Android Studio**（推荐）
   - 免费下载：https://developer.android.com/studio
   - 用于构建和测试 Android 应用

3. **Java Development Kit (JDK)**
   - 通常 Android Studio 会自动安装
   - 或手动安装 JDK 11+

4. **Android SDK**
   - Android Studio 会自动安装

**注意**：可以在 Windows、Mac 或 Linux 上开发 Android 应用！

---

## 🔧 Capacitor Android 配置

### 第一步：安装 Android 平台

```bash
npm install @capacitor/android
npx cap add android
```

这会在项目根目录创建 `android` 文件夹。

### 第二步：配置 Capacitor

确保 `capacitor.config.json` 或 `capacitor.config.ts` 中包含 Android 配置：

```json
{
  "appId": "com.shanghaitour.guide",
  "appName": "Shanghai Tour Guide",
  "webDir": "client/dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": false,
    "captureInput": true,
    "webContentsDebuggingEnabled": false
  }
}
```

### 第三步：构建前端

```bash
cd client
npm run build
cd ..
```

### 第四步：同步到 Android

```bash
npx cap sync android
```

### 第五步：打开 Android Studio

```bash
npx cap open android
```

或者直接打开 `android` 文件夹。

---

## 📦 在 Android Studio 中配置

### 1. 应用基本信息

打开 `android/app/src/main/res/values/strings.xml`：

```xml
<resources>
    <string name="app_name">Shanghai Tour Guide</string>
    <string name="title_activity_main">Shanghai Tour Guide</string>
</resources>
```

### 2. 包名（Package Name）

在 `android/app/build.gradle` 中：

```gradle
android {
    namespace 'com.shanghaitour.guide'
    defaultConfig {
        applicationId "com.shanghaitour.guide"
        minSdkVersion 22  // Android 5.1+
        targetSdkVersion 34  // 最新版本
        versionCode 1  // 每次更新递增
        versionName "1.0.0"  // 用户看到的版本
    }
}
```

### 3. 应用图标

需要准备多尺寸图标，放在：
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
└── mipmap-xxxhdpi/ic_launcher.png (192x192)
```

**推荐工具**：
- Android Asset Studio：https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
- 上传 1024x1024 图片，自动生成所有尺寸

### 4. 权限配置

在 `android/app/src/main/AndroidManifest.xml` 中添加：

```xml
<manifest>
    <!-- 网络权限（必需） -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- 相机权限（如需要） -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- 位置权限（如需要） -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- 存储权限（如需要） -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application>
        <!-- 权限说明（必需） -->
        <uses-permission android:name="android.permission.CAMERA" 
            android:required="false" />
        <!-- ... -->
    </application>
</manifest>
```

---

## 🔐 Google Play 注册

### 第一步：创建开发者账号

1. **访问 Google Play Console**
   - https://play.google.com/console/signup

2. **登录 Google 账号**
   - 使用你的 Gmail 账号

3. **同意服务条款**

4. **支付注册费**
   - $25 一次性费用（可使用信用卡或 PayPal）
   - 永久有效，无需续费

5. **完成身份验证**
   - 提供个人信息
   - 验证身份（可能需要提供身份证件）

### 第二步：设置开发者账号

1. **填写开发者信息**
   - 开发者名称
   - 联系方式
   - 地址

2. **设置付款和税务信息**
   - 设置收款方式（如需要付费应用）
   - 填写税务信息

---

## 📱 应用准备

### 必需内容清单

#### 1. 应用图标
- **Play Store 图标**：512x512 PNG（必需）
- **应用图标**：多种尺寸（见上面）

#### 2. 功能图形
- **功能图形**：1024x500 PNG（可选但推荐）
- 展示应用核心功能

#### 3. 截图
- 至少 2 张，最多 8 张
- 尺寸：
  - 手机：至少 320px，最多 3840px 宽/高
  - 推荐：1080x1920 或更高
- 展示应用核心功能

#### 4. 应用描述
- **简短描述**：最多 80 个字符
- **完整描述**：最多 4000 个字符
- 使用关键词优化 SEO

#### 5. 隐私政策
- **必需！**（与 iOS 相同）
- 必须是可访问的 URL
- 说明数据收集和使用

#### 6. 内容分级
- 填写问卷确定年龄分级
- Google 会根据你的回答自动分级

---

## 🚀 发布流程

### 第一步：在 Android Studio 中构建

1. **生成签名密钥**
   ```bash
   keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
   ```
   保存好密钥和密码（重要！）

2. **配置签名**
   在 `android/app/build.gradle` 中：
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('my-release-key.jks')
               storePassword 'your-store-password'
               keyAlias 'my-key-alias'
               keyPassword 'your-key-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               shrinkResources true
           }
       }
   }
   ```

3. **构建 Release APK/AAB**
   - Build → Generate Signed Bundle / APK
   - 选择 "Android App Bundle"（推荐）
   - 或选择 "APK"
   - 选择 release 配置
   - 等待构建完成

### 第二步：在 Google Play Console 创建应用

1. **访问 Google Play Console**
   - https://play.google.com/console

2. **创建应用**
   - 点击 "Create app"
   - 填写：
     - 应用名称：Shanghai Tour Guide
     - 默认语言：中文或 English
     - 应用类型：应用（App）
     - 免费或付费：免费（Free）

3. **同意声明**
   - 同意内容分级、出口合规等

### 第三步：填写应用信息

#### 主要信息
- **应用名称**：最多 50 个字符
- **简短描述**：最多 80 个字符
- **完整描述**：最多 4000 个字符
- **图形资源**：
  - 应用图标（512x512）
  - 功能图形（可选，1024x500）
  - 截图（至少 2 张）

#### 分类
- **应用类别**：例如 "旅游"、"购物"
- **标签**：例如 "旅游指南"、"上海"

#### 内容分级
- 填写问卷
- Google 自动生成分级

#### 定价和分发
- **价格**：免费
- **国家/地区**：选择要发布的国家
- **隐私政策 URL**（必需）

### 第四步：上传应用

1. **进入 "Production" 或 "Internal testing"**

2. **创建新版本**
   - 点击 "Create new release"

3. **上传 AAB/APK**
   - 上传构建好的文件
   - 填写发布说明（版本更新内容）

4. **检查发布内容**
   - 确保所有信息完整
   - 检查错误和警告

5. **审核并发布**
   - 点击 "Review release"
   - 确认所有信息
   - 点击 "Start rollout to Production"

---

## ⚠️ 审核注意事项

### Google Play 审核要求

#### 1. 必需内容

- ✅ **隐私政策**（必需）
  - 必须是可访问的 URL
  - 说明数据收集和使用

- ✅ **应用图标**
  - 512x512 PNG
  - 符合 Google 设计规范

- ✅ **截图**
  - 至少 2 张
  - 展示应用功能

#### 2. 功能要求

- ✅ **目标 API 级别**
  - 必须支持最新或次新版本的 Android API
  - 当前要求：API 33 (Android 13) 或更高

- ✅ **64 位支持**（必需）
  - Android 9+ 要求 64 位支持
  - 确保构建时包含 64 位库

- ✅ **权限声明**
  - 所有权限必须在 AndroidManifest.xml 中声明
  - 运行时权限需要说明用途

#### 3. 禁止内容

- ❌ 恶意软件或病毒
- ❌ 误导性内容
- ❌ 侵犯隐私
- ❌ 暴力或不当内容
- ❌ 侵犯版权

#### 4. 性能要求

- ✅ 启动时间合理
- ✅ 无崩溃
- ✅ 流畅的用户体验
- ✅ 合理的电池使用

---

## 🔄 与 iOS 的区别

| 项目 | iOS (App Store) | Android (Google Play) |
|------|----------------|----------------------|
| **注册费** | $99/年 | $25 一次性 |
| **审核时间** | 1-3 天 | 几小时到几天 |
| **审核严格度** | 非常严格 | 相对宽松 |
| **开发平台** | 必须 Mac | Windows/Mac/Linux |
| **构建工具** | Xcode | Android Studio |
| **签名** | 必须 | 必须 |
| **隐私政策** | 必需 | 必需 |
| **截图要求** | 多种尺寸 | 至少 2 张 |

---

## 💰 成本和费用

### 一次性费用
- **Google Play 开发者账号**：$25（一次性，永久有效）

### 持续费用
- **Google Play 账号**：$0（无需续费）
- **服务器和数据库**：$10-50/月（如果使用云服务）

### 对比 iOS
- iOS：$99/年（需要续费）
- Android：$25 一次性（更便宜！）

---

## 📝 针对你的应用的特殊配置

### 1. API 地址

确保生产环境 API 地址正确配置：

```javascript
// client/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.origin + '/api') || 
  'https://你的后端地址/api';
```

### 2. HTTPS 要求

确保所有 API 请求使用 HTTPS（Google Play 要求）。

### 3. 网络权限

在 `AndroidManifest.xml` 中必须声明：
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 4. 权限说明

对于敏感权限（相机、位置等），需要运行时请求并在设置中说明用途。

---

## 🔄 更新应用

每次更新代码后：

```bash
# 1. 构建前端
cd client && npm run build && cd ..

# 2. 同步到 Android
npx cap sync android

# 3. 在 Android Studio 中打开
npx cap open android

# 4. 更新版本号
# 在 android/app/build.gradle 中：
# versionCode 2  (递增)
# versionName "1.0.1"

# 5. 构建新的 AAB/APK

# 6. 上传到 Google Play Console
```

---

## 🆘 常见问题

### Q1: 可以在 Windows 上开发吗？
A: **可以！** Android 应用可以在 Windows、Mac 或 Linux 上开发。

### Q2: 审核需要多久？
A: 通常几小时到 1-2 天，比 iOS 快。

### Q3: 被拒绝怎么办？
A: Google 会说明拒绝原因，修复后重新提交。

### Q4: 需要单独的 Android 版本吗？
A: **不需要！** 使用 Capacitor，同一个代码库可以同时发布到 iOS 和 Android。

### Q5: 64 位支持怎么处理？
A: Capacitor 和现代构建工具默认支持 64 位。确保 `build.gradle` 中正确配置。

### Q6: 签名密钥丢失了怎么办？
A: **非常重要！** 必须保存好签名密钥。如果丢失，无法更新应用，只能发布新应用。

---

## ✅ 发布检查清单

### 开发阶段
- [ ] Capacitor Android 平台已添加
- [ ] 应用已构建并测试
- [ ] 所有功能正常工作
- [ ] 无崩溃或严重 Bug
- [ ] 性能已优化

### 配置阶段
- [ ] 应用图标已准备（512x512 和多种尺寸）
- [ ] 应用名称已确定
- [ ] 包名已设置
- [ ] 版本号已设置
- [ ] 权限已正确声明
- [ ] 签名密钥已生成并保存

### Google Play Console
- [ ] 开发者账号已注册（$25）
- [ ] 应用记录已创建
- [ ] 应用信息已填写完整
- [ ] 截图已上传（至少 2 张）
- [ ] 隐私政策 URL 已提供
- [ ] 内容分级已完成

### 发布阶段
- [ ] AAB/APK 已构建
- [ ] 应用已上传
- [ ] 发布说明已填写
- [ ] 所有信息已检查
- [ ] 已提交审核

---

## 🎉 同时发布到 iOS 和 Android

由于使用 Capacitor，你可以：

1. **一次开发**：React 代码保持不变
2. **双平台构建**：
   ```bash
   npx cap sync ios
   npx cap sync android
   ```
3. **分别发布**：分别提交到 App Store 和 Google Play

---

## 📚 推荐资源

- **Capacitor Android 文档**：https://capacitorjs.com/docs/android
- **Google Play Console**：https://play.google.com/console
- **Android 开发者指南**：https://developer.android.com/guide
- **Google Play 政策**：https://play.google.com/about/developer-content-policy/
- **Material Design**：https://material.io/design

---

## ⏱️ 时间估算

- **Capacitor Android 配置**：0.5-1 天（因为 iOS 已经配置了）
- **Android Studio 配置**：1 天
- **测试**：1-2 天
- **准备 Google Play 内容**：1 天
- **审核等待**：几小时到 1-2 天
- **总计**：约 1 周

---

## 🎯 总结

Google Play 发布比 App Store 更简单：
- ✅ **更便宜**：$25 一次性 vs $99/年
- ✅ **更灵活**：可以在 Windows 上开发
- ✅ **更快速**：审核通常更快
- ✅ **更容易**：要求相对宽松

使用 Capacitor，你可以同时发布到两个平台，最大化你的应用覆盖范围！

需要我帮你开始配置 Android 版本吗？
