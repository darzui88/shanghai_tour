const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, '../uploads');
const productsDir = path.join(uploadsDir, 'products');
const locationsDir = path.join(uploadsDir, 'locations');
const eventsDir = path.join(uploadsDir, 'events');
const guidesDir = path.join(uploadsDir, 'guides');

[uploadsDir, productsDir, locationsDir, eventsDir, guidesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 文件过滤器：只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
  }
};

// 创建multer配置函数
const createUpload = (type) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      
      switch (type) {
        case 'products':
          uploadPath = productsDir;
          break;
        case 'locations':
          uploadPath = locationsDir;
          break;
        case 'events':
          uploadPath = eventsDir;
          break;
        case 'guides':
          uploadPath = guidesDir;
          break;
        default:
          uploadPath = uploadsDir;
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // 生成唯一文件名: timestamp-random-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
  });

  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: fileFilter
  });
};

// 导出创建函数
module.exports = { createUpload, fileFilter };
