const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Location = require('../models/Location');
const authenticateAdmin = require('../middleware/auth');

// Get all locations
router.get('/', async (req, res) => {
  try {
    const { category, district, search, page = 1, limit = 20 } = req.query;
    const where = {};

    // Note: JSON field querying in MySQL via Sequelize requires raw queries
    // For simplicity, we'll filter in JavaScript after fetching
    // In production, consider using JSON_CONTAINS for better performance

    if (district) {
      where.district = district;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    let { rows: locations, count: total } = await Location.findAndCountAll({
      where,
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit) + 100, // Fetch extra for filtering
      offset: parseInt(offset)
    });

    // Filter by category if needed (since categories is JSON)
    if (category) {
      locations = locations.filter(loc => {
        const categories = loc.categories || [];
        return Array.isArray(categories) ? categories.includes(category) : false;
      });
      total = locations.length;
    }

    // Apply pagination after filtering
    locations = locations.slice(0, parseInt(limit));

    res.json({
      locations,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new location (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const location = await Location.create(req.body);
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update location (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    await location.update(req.body);
    res.json(location);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete location (admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const location = await Location.findByPk(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    await location.destroy();
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
