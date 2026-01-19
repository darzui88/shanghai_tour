const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Event = require('../models/Event');
const smartShanghaiScraper = require('../scrapers/smartShanghaiScraper');
const authenticateAdmin = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, featured, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where[Op.and] = [];
      if (startDate) {
        where[Op.and].push({ endDate: { [Op.gte]: new Date(startDate) } });
      }
      if (endDate) {
        where[Op.and].push({ startDate: { [Op.lte]: new Date(endDate) } });
      }
    } else {
      // Default: show upcoming events
      where.endDate = { [Op.gte]: new Date() };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const { rows: events, count: total } = await Event.findAndCountAll({
      where,
      order: [['featured', 'DESC'], ['startDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
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
