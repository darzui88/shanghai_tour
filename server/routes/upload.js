const express = require('express');
const router = express.Router();
const { createUpload } = require('../middleware/upload');
const authenticateAdmin = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// 上传图片（支持products/locations/events）
// POST /api/upload/:type/:id
// type: products, locations, events
// id: 资源ID
// 支持多文件上传，最多20张
router.post('/:type/:id', authenticateAdmin, (req, res, next) => {
  const { type } = req.params;
  const upload = createUpload(type);
  upload.array('images', 20)(req, res, next);
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const { type, id } = req.params;
    
    // 验证type
    if (!['products', 'locations', 'events', 'guides'].includes(type)) {
      return res.status(400).json({ error: '无效的类型，只支持 products, locations, events, guides' });
    }

    // 构建文件URL
    const baseUrl = req.protocol + '://' + req.get('host');
    const uploadedFiles = req.files.map(file => {
      const relativePath = `uploads/${type}/${file.filename}`;
      return {
        url: `${baseUrl}/${relativePath}`,
        path: relativePath,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.json({
      success: true,
      files: uploadedFiles,
      message: `成功上传 ${uploadedFiles.length} 张图片`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || '上传失败' });
  }
});

// 删除图片
// DELETE /api/upload/:type/:id
// body: { filepath: 'uploads/products/xxx.jpg' }
router.delete('/:type/:id', authenticateAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { filepath } = req.body;

    if (!filepath) {
      return res.status(400).json({ error: '缺少文件路径' });
    }

    // 验证路径安全性（防止路径遍历攻击）
    if (filepath.includes('..') || !filepath.startsWith(`uploads/${type}/`)) {
      return res.status(400).json({ error: '无效的文件路径' });
    }

    const filePath = path.join(__dirname, '..', filepath);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 删除文件
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: error.message || '删除失败' });
  }
});

module.exports = router;
