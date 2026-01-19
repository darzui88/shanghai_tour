const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Get all orders (admin)
router.get('/', async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const offset = (page - 1) * limit;
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    const { user, items, shipping } = req.body;

    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product);
      if (!product || !product.isAvailable) {
        return res.status(400).json({ error: `Product ${item.product} not available` });
      }

      const productPrice = parseFloat(product.price);
      const itemTotal = productPrice * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        product: product.id,
        quantity: item.quantity,
        price: productPrice
      });
    }

    // Add shipping fee
    const shippingFee = shipping.method === 'express' 
      ? (shipping.fee || 0) 
      : 0;
    totalAmount += shippingFee;

    const order = await Order.create({
      user,
      items: validatedItems,
      shipping: {
        ...shipping,
        fee: shippingFee
      },
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Populate product details manually
    const itemsWithProducts = await Promise.all(
      order.items.map(async (item) => {
        const product = await Product.findByPk(item.product);
        return {
          ...item,
          product: product || item.product
        };
      })
    );

    const orderWithProducts = {
      ...order.toJSON(),
      items: itemsWithProducts
    };

    res.json(orderWithProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get orders by user email
router.get('/user/:email', async (req, res) => {
  try {
    // Since user is stored as JSON, we need to query differently
    const orders = await Order.findAll({
      order: [['createdAt', 'DESC']]
    });

    // Filter by email in JavaScript since JSON field querying is complex
    const filteredOrders = orders.filter(order => {
      const userEmail = order.user?.email || order.user?.Email || '';
      return userEmail.toLowerCase() === req.params.email.toLowerCase();
    });

    // Populate product details for each order
    const ordersWithProducts = await Promise.all(
      filteredOrders.map(async (order) => {
        const itemsWithProducts = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findByPk(item.product);
            return {
              ...item,
              product: product || item.product
            };
          })
        );
        return {
          ...order.toJSON(),
          items: itemsWithProducts
        };
      })
    );

    res.json(ordersWithProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, paymentStatus, taobaoOrderIds, pinduoduoOrderIds, notes } = req.body;
    
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (taobaoOrderIds) updateData.taobaoOrderIds = taobaoOrderIds;
    if (pinduoduoOrderIds) updateData.pinduoduoOrderIds = pinduoduoOrderIds;
    if (notes) updateData.notes = notes;

    await order.update(updateData);
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
