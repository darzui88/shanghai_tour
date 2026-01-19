const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Guide = require('../models/Guide');
const authenticateAdmin = require('../middleware/auth');

// Get all guides (public API)
router.get('/', async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 20, all } = req.query;
    
    // 如果不是管理员请求，只返回已发布的攻略
    const where = all === 'true' ? {} : { isPublished: true };

    if (category) {
      where.category = category;
    }

    if (tag) {
      where.tags = {
        [Op.contains]: [tag]
      };
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { titleCN: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    // 排序：置顶优先，然后按sortOrder和创建时间
    const order = [
      ['isPinned', 'DESC'],
      ['sortOrder', 'DESC'],
      ['createdAt', 'DESC']
    ];

    const { rows: guides, count: total } = await Guide.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      guides,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get guide by ID (public API)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const guide = await Guide.findByPk(id);

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // 如果是未发布的攻略且不是管理员请求，返回404
    if (!guide.isPublished && req.query.all !== 'true') {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // 增加浏览量
    guide.viewCount = (guide.viewCount || 0) + 1;
    await guide.save();

    res.json({ guide });
  } catch (error) {
    console.error('Error fetching guide:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create guide (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const guideData = req.body;
    const guide = await Guide.create(guideData);
    res.status(201).json({ guide });
  } catch (error) {
    console.error('Error creating guide:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update guide (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const guide = await Guide.findByPk(id);

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    await guide.update(req.body);
    res.json({ guide });
  } catch (error) {
    console.error('Error updating guide:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete guide (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const guide = await Guide.findByPk(id);

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    await guide.destroy();
    res.json({ message: 'Guide deleted successfully' });
  } catch (error) {
    console.error('Error deleting guide:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
