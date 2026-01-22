const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Event = require('../models/Event');
const smartShanghaiScraper = require('../scrapers/smartShanghaiScraper');
const authenticateAdmin = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, featured, search, page = 1, limit = 20, all } = req.query;
    const where = {};

    if (category) {
      where.category = category;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // 构建日期条件
    const dateConditions = [];
    if (all !== 'true') {
      // 如果不是查看所有活动，只显示即将到来的活动
      if (startDate || endDate) {
        if (startDate) {
          dateConditions.push({
            [Op.or]: [
              { endDate: { [Op.gte]: new Date(startDate) } },
              { endDate: null } // 包含没有结束日期的活动
            ]
          });
        }
        if (endDate) {
          dateConditions.push({
            [Op.or]: [
              { startDate: { [Op.lte]: new Date(endDate) } },
              { startDate: null } // 包含没有开始日期的活动
            ]
          });
        }
      } else {
        // Default: show upcoming events (只显示有日期且未过期的，或没有日期的)
        dateConditions.push({
          [Op.or]: [
            { endDate: { [Op.gte]: new Date() } },
            { endDate: null }
          ]
        });
      }
    } else {
      // all=true: 显示所有活动，不限制日期
      // 如果指定了日期范围，仍然应用
      if (startDate || endDate) {
        if (startDate) {
          dateConditions.push({
            [Op.or]: [
              { endDate: { [Op.gte]: new Date(startDate) } },
              { endDate: null }
            ]
          });
        }
        if (endDate) {
          dateConditions.push({
            [Op.or]: [
              { startDate: { [Op.lte]: new Date(endDate) } },
              { startDate: null }
            ]
          });
        }
      }
    }

    // 构建搜索条件
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      );
    }

    // 合并所有条件
    const andConditions = [];
    
    // 添加基本条件（category, featured）到where或andConditions
    const basicConditions = {};
    if (category) {
      basicConditions.category = category;
    }
    if (featured === 'true') {
      basicConditions.featured = true;
    }
    
    // 添加日期条件
    if (dateConditions.length > 0) {
      if (dateConditions.length === 1) {
        andConditions.push(dateConditions[0]);
      } else {
        andConditions.push({ [Op.and]: dateConditions });
      }
    }
    
    // 添加搜索条件
    if (searchConditions.length > 0) {
      andConditions.push({ [Op.or]: searchConditions });
    }
    
    // 合并条件
    if (andConditions.length > 0) {
      // 如果有and条件，需要将基本条件也加入
      if (Object.keys(basicConditions).length > 0) {
        andConditions.unshift(basicConditions);
      }
      where[Op.and] = andConditions;
    } else {
      // 没有and条件，直接使用基本条件
      Object.assign(where, basicConditions);
    }

    const offset = (page - 1) * limit;
    
    console.log('[Events API] Query conditions:', JSON.stringify(where, null, 2));
    
    const { rows: events, count: total } = await Event.findAndCountAll({
      where,
      order: [
        ['featured', 'DESC'], 
        // 对于没有日期的活动，使用一个很晚的日期来排序
        [sequelize.fn('COALESCE', sequelize.col('startDate'), new Date('9999-12-31')), 'ASC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`[Events API] Found ${events.length} events (total: ${total})`);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('[Events API] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh events from scrapers (admin)
router.post('/refresh', async (req, res) => {
  try {
    const result = await smartShanghaiScraper.scrapeEvents();
    res.json({
      message: 'Events refreshed successfully',
      newEvents: result.newEvents,
      updatedEvents: result.updatedEvents,
      total: result.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new event (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update event (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    await event.update(req.body);
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
