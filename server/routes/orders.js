const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const authenticateAdmin = require('../middleware/auth');
const authenticateUser = require('../middleware/userAuth');
const jwt = require('jsonwebtoken');

// Helper: deduct stock when payment is confirmed
const deductStockForOrder = async (order) => {
  for (const item of order.items) {
    const product = await Product.findByPk(item.product);
    if (!product) continue;

    // If product has variants and order item specifies a variant
    if (product.variants && Array.isArray(product.variants) && item.variantName) {
      const variants = Array.isArray(product.variants) ? product.variants : [];
      const variantIndex = variants.findIndex(v => v.name === item.variantName);
      if (variantIndex === -1) {
        throw new Error(`Variant ${item.variantName} not found for product ${product.id}`);
      }
      if (variants[variantIndex].stock !== undefined && variants[variantIndex].stock < item.quantity) {
        throw new Error(`Insufficient stock for variant ${item.variantName} of product ${product.id}`);
      }
      // deduct
      variants[variantIndex].stock = Math.max(0, (variants[variantIndex].stock || 0) - item.quantity);
      product.variants = variants;
    } else {
      // No variants, deduct from product stock if defined
      if (product.stock !== undefined && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.id}`);
      }
      if (product.stock !== undefined) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    // Also maintain overall stock field as the sum of variants if variants exist
    if (product.variants && Array.isArray(product.variants)) {
      const totalVariantStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      product.stock = totalVariantStock;
    }

    await product.save();
  }
};

// Get all orders (admin)
router.get('/', authenticateAdmin, async (req, res) => {
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

    // Validate required fields
    if (!user || !items || !shipping) {
      return res.status(400).json({ 
        error: 'Missing required fields: user, items, or shipping' 
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Items must be a non-empty array' 
      });
    }

    // Validate user fields
    if (!user.name || !user.email || !shipping.address) {
      return res.status(400).json({ 
        error: 'Missing required user or shipping information' 
      });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.product || item.product === undefined || item.product === null) {
        return res.status(400).json({ 
          error: 'Each item must have product ID' 
        });
      }

      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ 
          error: 'Each item must have a valid quantity (at least 1)' 
        });
      }

      // Try to find product by ID (handle both string and number IDs)
      const productId = parseInt(item.product) || item.product;
      const product = await Product.findByPk(productId);
      
      if (!product) {
        console.error(`Product not found: ${productId} (original: ${item.product}, type: ${typeof item.product})`);
        return res.status(400).json({ 
          error: `Product ${item.product} not found` 
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({ 
          error: `Product ${product.name || product.nameCN || item.product} is not available` 
        });
      }

      const productPrice = parseFloat(product.price);
      if (isNaN(productPrice) || productPrice < 0) {
        return res.status(400).json({ 
          error: `Invalid price for product ${item.product}` 
        });
      }

      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ 
          error: `Invalid quantity for product ${item.product}` 
        });
      }

      const itemTotal = productPrice * quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        product: product.id,
        quantity: quantity,
        price: productPrice
      });
    }

    // Add shipping fee
    const shippingFee = shipping.method === 'express' 
      ? parseFloat(shipping.fee || 0) 
      : 0;
    totalAmount += shippingFee;

    // Generate order number before creating
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `STG${timestamp}${random}`;

    // 检查是否有用户登录（从token中获取userId）
    let userId = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const jwt = require('jsonwebtoken');
        const token = authHeader.substring(7);
        // 使用与users.js相同的JWT_SECRET
        const JWT_SECRET = process.env.JWT_SECRET || 'shanghai-tour-guide-user-secret-key-2024';
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id;
          console.log(`✅ Order created with userId: ${userId}`);
        } catch (err) {
          console.log(`⚠️ Token验证失败，创建游客订单: ${err.message}`);
          // Token无效或过期，继续作为游客订单
        }
      } else {
        console.log('ℹ️ 无Authorization header，创建游客订单');
      }
    } catch (error) {
      console.error('❌ 检查用户登录状态时出错:', error);
      // 忽略错误，继续创建订单
    }

    // 设置支付截止时间为10分钟后
    const paymentDeadline = new Date();
    paymentDeadline.setMinutes(paymentDeadline.getMinutes() + 10);

    const order = await Order.create({
      orderNumber,
      userId,
      user,
      items: validatedItems,
      shipping: {
        ...shipping,
        fee: shippingFee
      },
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      paymentDeadline
    });

    console.log(`✅ Order created: ${order.orderNumber}`);
    res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to create order',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get orders by current user (requires login)
// 注意：这个路由必须在 /:id 之前，否则 /my-orders 会被当作 /:id 处理
router.get('/my-orders', authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const userId = req.user.id;
    console.log(`🔍 查询用户 ${userId} 的订单 (page: ${page}, limit: ${limit})`);
    
    // 查询该用户的订单（通过userId）
    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: {
        userId: userId
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`📦 找到 ${orders.length} 个订单（用户ID: ${userId}，总数: ${total}）`);
    
    // 如果没有找到订单，尝试通过邮箱匹配（兼容旧订单）
    if (orders.length === 0) {
      console.log(`⚠️ 未找到userId=${userId}的订单，尝试通过邮箱匹配...`);
      const user = await User.findByPk(userId);
      if (user && user.email) {
        // 查询所有订单，然后在内存中过滤
        const allOrders = await Order.findAll({
          order: [['createdAt', 'DESC']],
          limit: 100 // 限制查询数量
        });
        
        const matchedOrders = allOrders.filter(order => {
          const orderEmail = order.user?.email || order.user?.Email || '';
          return orderEmail.toLowerCase() === user.email.toLowerCase();
        });
        
        console.log(`📦 通过邮箱匹配找到 ${matchedOrders.length} 个订单`);
        
        if (matchedOrders.length > 0) {
          // 更新这些订单的userId
          const orderIds = matchedOrders.map(o => o.id);
          await Order.update(
            { userId: userId },
            { where: { id: { [require('sequelize').Op.in]: orderIds } } }
          );
          console.log(`✅ 已更新 ${orderIds.length} 个订单的userId`);
          
          // 重新查询
          const updatedQuery = await Order.findAndCountAll({
            where: {
              userId: userId
            },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
          });
          
          const ordersWithProducts = await Promise.all(
            updatedQuery.rows.map(async (order) => {
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

          return res.json({
            orders: ordersWithProducts,
            totalPages: Math.ceil(updatedQuery.count / limit),
            currentPage: parseInt(page),
            total: updatedQuery.count
          });
        }
      }
    }

    // Populate product details for each order
    const ordersWithProducts = await Promise.all(
      orders.map(async (order) => {
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

    res.json({
      orders: ordersWithProducts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pay for order (mock)
router.post('/:id/pay', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // 检查支付截止时间
    if (order.paymentDeadline) {
      const now = new Date();
      const deadline = new Date(order.paymentDeadline);
      if (now > deadline) {
        return res.status(400).json({ 
          error: 'Payment deadline has passed. This order can no longer be paid.',
          paymentDeadline: order.paymentDeadline
        });
      }
    }

    // Optional auth: allow owner token
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const JWT_SECRET = process.env.JWT_SECRET || 'shanghai-tour-guide-user-secret-key-2024';
        const decoded = jwt.verify(token, JWT_SECRET);
        if (order.userId && decoded.id !== order.userId) {
          return res.status(403).json({ error: 'Not allowed to pay for this order' });
        }
      }
    } catch (err) {
      // ignore token errors for mock payment
    }

    // Deduct stock; throws if insufficient
    await deductStockForOrder(order);

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Error paying order:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get order by ID
// 注意：这个路由必须在具体路径（如 /my-orders）之后
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

// Get orders by user email (deprecated, use /my-orders instead)
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
router.patch('/:id/status', authenticateAdmin, async (req, res) => {
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

// Cancel order (admin) - 任何状态下都可以取消
router.post('/:id/cancel', authenticateAdmin, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 如果订单已取消，直接返回
    if (order.status === 'cancelled') {
      return res.json({ message: 'Order already cancelled', order });
    }

    // 如果订单已支付，需要标记为退款状态（暂时不操作支付网关）
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
      // TODO: 这里应该调用支付网关进行退款，但目前暂时不操作
      console.log(`⚠️ 订单 ${order.orderNumber} 已支付，需要退款，但暂时不操作支付网关`);
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(400).json({ error: error.message });
  }
});

// Ship order (admin) - 发货，设置物流信息并更新状态为已发货
router.post('/:id/ship', authenticateAdmin, async (req, res) => {
  try {
    const { shippingCompany, trackingNumber, shippingNotes } = req.body;
    
    if (!shippingCompany || !trackingNumber) {
      return res.status(400).json({ error: '物流公司名称和物流单号不能为空' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 更新shipping JSON字段，添加物流信息
    const shippingData = order.shipping || {};
    shippingData.shippingCompany = shippingCompany;
    shippingData.trackingNumber = trackingNumber;
    if (shippingNotes) {
      shippingData.shippingNotes = shippingNotes;
    }

    // 更新订单状态为已发货
    order.status = 'shipped';
    order.shipping = shippingData;
    await order.save();

    res.json({ message: 'Order shipped successfully', order });
  } catch (error) {
    console.error('Error shipping order:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update shipping info (admin) - 修改物流信息（已发货后可以修改）
router.patch('/:id/shipping', authenticateAdmin, async (req, res) => {
  try {
    const { shippingCompany, trackingNumber, shippingNotes } = req.body;
    
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // 只有已发货的订单才能修改物流信息
    if (order.status !== 'shipped') {
      return res.status(400).json({ error: '只有已发货的订单才能修改物流信息' });
    }

    // 更新shipping JSON字段
    const shippingData = order.shipping || {};
    if (shippingCompany) shippingData.shippingCompany = shippingCompany;
    if (trackingNumber) shippingData.trackingNumber = trackingNumber;
    if (shippingNotes !== undefined) shippingData.shippingNotes = shippingNotes;

    order.shipping = shippingData;
    await order.save();

    res.json({ message: 'Shipping info updated successfully', order });
  } catch (error) {
    console.error('Error updating shipping info:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
