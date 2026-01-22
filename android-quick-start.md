# 🤖 Android 快速开始 - Capacitor 转换

## ⚡ 5 步转换为 Android 应用

### 步骤 1：安装 Android 平台

```bash
npm install @capacitor/android
npx cap add android
```

这会在项目根目录创建 `android` 文件夹。

### 步骤 2：构建前端

```bash
cd client
npm run build
cd ..
```

### 步骤 3：同步到 Android

```bash
npx cap sync android
```

### 步骤 4：打开 Android Studio

```bash
npx cap open android
```

或者在 Android Studio 中直接打开 `android` 文件夹。

### 步骤 5：配置并构建

在 Android Studio 中：
- 等待 Gradle 同步完成
- 配置应用信息
- 构建 APK 或 AAB

---

## 📝 配置文件示例

### capacitor.config.json

确保包含 Android 配置：

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

### android/app/build.gradle

检查关键配置：

```gradle
android {
    namespace 'com.shanghaitour.guide'
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.shanghaitour.guide"
        minSdkVersion 22  // Android 5.1+
        targetSdkVersion 34  // 最新版本
        versionCode 1  // 每次更新递增
        versionName "1.0.0"  // 用户看到的版本
    }
    
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🎨 准备应用图标

### 使用 Android Asset Studio

1. 访问：https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
2. 上传 1024x1024 图片
3. 下载生成的图标
4. 解压并复制到 `android/app/src/main/res/` 对应文件夹

### 手动创建

需要的尺寸：
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

---

## 🔐 生成签名密钥

### 创建密钥

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

**重要**：保存好密钥文件和密码！

### 配置签名

在 `android/app/build.gradle` 中添加：

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
        }
    }
}
```

**安全提示**：建议使用环境变量存储密码，不要直接写在代码中。

---

## 📦 构建 Release 版本

### 在 Android Studio 中

1. Build → Generate Signed Bundle / APK
2. 选择 "Android App Bundle"（推荐）或 "APK"
3. 选择签名配置
4. 选择 release
5. 点击 Finish

### 使用命令行

```bash
cd android
./gradlew bundleRelease  # 生成 AAB
# 或
./gradlew assembleRelease  # 生成 APK
```

输出文件位置：
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🚀 上传到 Google Play

1. **访问 Google Play Console**
   - https://play.google.com/console

2. **创建应用**
   - 填写基本信息

3. **上传 AAB/APK**
   - 进入 "Production" 或 "Internal testing"
   - 创建新版本
   - 上传构建文件

4. **填写应用信息**
   - 截图、描述、隐私政策等

5. **提交审核**

---

## 🔄 更新应用流程

每次更新代码后：

```bash
# 1. 构建前端
cd client && npm run build && cd ..

# 2. 同步到 Android
npx cap sync android

# 3. 在 Android Studio 中：
#    - 更新 versionCode（递增）
#    - 更新 versionName
#    - 构建新的 AAB/APK

# 4. 上传到 Google Play Console
```

---

## 🆘 常见问题

### Q: Gradle 同步失败？
A: 
- 检查网络连接
- 尝试 File → Invalidate Caches / Restart
- 检查 JDK 版本（需要 JDK 11+）

### Q: 构建失败？
A:
- 检查 Android SDK 是否完整
- 检查 build.gradle 配置
- 查看错误日志

### Q: 应用无法运行？
A:
- 检查权限是否已声明
- 检查 API 地址是否正确
- 查看 Logcat 日志

---

## 📚 下一步

详细说明请参考：
- `GOOGLE_PLAY_PUBLISHING.md` - 完整发布指南
- `google-play-checklist.md` - 发布检查清单
