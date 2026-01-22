import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrder, payOrder } from '../services/api';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getOrder(id);
        
        // 检查组件是否仍然挂载
        if (!isMounted) return;
        
        setOrder(response.data);
        
        // 检查是否已过期
        if (response.data.paymentDeadline) {
          const now = new Date();
          const deadline = new Date(response.data.paymentDeadline);
          if (now > deadline) {
            setIsExpired(true);
          }
        }
      } catch (error) {
        // 检查组件是否仍然挂载
        if (!isMounted) return;
        
        console.error('Error loading order:', error);
        setError(error.response?.data?.error || 'Failed to load order details');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadOrder();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!order || !order.paymentDeadline) return;

    let isMounted = true;

    const updateTimer = () => {
      if (!isMounted) return;
      
      const now = new Date();
      const deadline = new Date(order.paymentDeadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        return;
      }

      setIsExpired(false);
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining({ minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order]);

  const handlePay = async () => {
    if (!order || isExpired || order.paymentStatus === 'paid') return;
    setPaying(true);
    setError('');
    try {
      await payOrder(order.id);
      alert('支付成功！订单已标记为已支付。');
      // 重新加载订单信息
      await loadOrder();
    } catch (err) {
      console.error('Pay error:', err);
      const errorMsg = err.response?.data?.error || '支付失败';
      setError(errorMsg);
      
      // 如果是因为超时，更新状态
      if (errorMsg.includes('deadline') || errorMsg.includes('expired') || errorMsg.includes('超时')) {
        setIsExpired(true);
      }
    } finally {
      setPaying(false);
    }
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return '';
    const date = new Date(deadline);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `¥${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: '待处理',
      confirmed: '已确认',
      processing: '处理中',
      purchased: '已购买',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      pending: '待支付',
      paid: '已支付',
      refunded: '已退款',
      failed: '支付失败'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <main className="order-detail-container">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="order-detail-container">
        <div className="container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => navigate('/profile?tab=orders')} className="btn-primary">
              返回订单列表
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="order-detail-container">
        <div className="container">
          <div className="error-message">
            <p>订单不存在</p>
            <button onClick={() => navigate('/profile?tab=orders')} className="btn-primary">
              返回订单列表
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="order-detail-container">
      <div className="container">
        <div className="order-detail-header">
          <button onClick={() => navigate('/profile?tab=orders')} className="back-button">
            ← 返回订单列表
          </button>
          <h1>订单详情</h1>
        </div>

        <div className="order-detail-card">
          {/* 订单基本信息 */}
          <section className="order-section">
            <h2>订单信息</h2>
            <div className="order-info-grid">
              <div className="info-item">
                <label>订单号</label>
                <span className="order-number">{order.orderNumber}</span>
              </div>
              <div className="info-item">
                <label>订单状态</label>
                <span className={getStatusClass(order.status)}>
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="info-item">
                <label>支付状态</label>
                <span>{getPaymentStatusText(order.paymentStatus)}</span>
              </div>
              <div className="info-item">
                <label>下单时间</label>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>订单总额</label>
                <span className="order-total-amount">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>

            {/* 支付截止时间显示 */}
            {order.paymentStatus === 'pending' && order.paymentDeadline && (
              <div className="payment-deadline-section">
                {isExpired ? (
                  <div className="deadline-expired">
                    <strong>⚠️ 支付截止时间已过</strong>
                    <p>支付截止时间：{formatDeadline(order.paymentDeadline)}</p>
                    <p>此订单已无法支付。</p>
                  </div>
                ) : (
                  <div className="deadline-countdown">
                    <strong>⏰ 支付截止时间：</strong>
                    <p>请在 {formatDeadline(order.paymentDeadline)} 前完成支付</p>
                    {timeRemaining && (
                      <div className="countdown-timer">
                        <strong>剩余时间：</strong>
                        <span className="timer-value">
                          {String(timeRemaining.minutes).padStart(2, '0')}:
                          {String(timeRemaining.seconds).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 支付按钮 */}
            {order.paymentStatus === 'pending' && (
              <div className="payment-action-section">
                {error && <div className="pay-error">{error}</div>}
                <button
                  className="btn-pay"
                  onClick={handlePay}
                  disabled={paying || isExpired}
                >
                  {isExpired 
                    ? '支付已过期' 
                    : (paying ? '支付中...' : '立即支付')}
                </button>
              </div>
            )}
          </section>

          {/* 收货信息 */}
          <section className="order-section">
            <h2>收货信息</h2>
            <div className="shipping-info">
              <p><strong>收货人：</strong>{order.shipping?.recipient || order.user?.name || '-'}</p>
              <p><strong>联系电话：</strong>{order.shipping?.phone || order.user?.phone || '-'}</p>
              <p><strong>收货地址：</strong>{order.shipping?.address || order.user?.address || '-'}</p>
              <p><strong>配送方式：</strong>
                {order.shipping?.method === 'express' ? '快递' : '标准配送'}
                {order.shipping?.fee > 0 && ` (运费: ${formatCurrency(order.shipping.fee)})`}
              </p>
            </div>
          </section>

          {/* 订单商品 */}
          <section className="order-section">
            <h2>订单商品</h2>
            <div className="order-items-list">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  // 优先使用规格图片，否则使用商品图片
                  const displayImage = item.variantImage 
                    || (item.product?.images && item.product.images.length > 0 ? item.product.images[0] : null);
                  
                  // 商品名称，可点击跳转到商品详情页
                  const productName = item.product?.nameCN || item.product?.name || `商品ID: ${item.product}`;
                  const productId = item.product?.id || item.product;
                  
                  return (
                    <div key={index} className="order-item-card">
                      <div className="item-image">
                        {displayImage ? (
                          <img 
                            src={displayImage} 
                            alt={productName}
                            onError={(e) => {
                              e.target.src = '/placeholder-image.png';
                            }}
                          />
                        ) : (
                          <div className="placeholder-image">无图片</div>
                        )}
                      </div>
                      <div className="item-details">
                        <h3>
                          <Link to={`/products/${productId}`} className="product-name-link">
                            {productName}
                          </Link>
                        </h3>
                        {item.variantName && (
                          <p className="item-variant">
                            <strong>规格：</strong>{item.variantName}
                          </p>
                        )}
                        <p className="item-price">
                          单价：{formatCurrency(item.variantPrice || item.price)}
                        </p>
                        <p className="item-quantity">数量：{item.quantity}</p>
                      </div>
                      <div className="item-total">
                        <strong>{formatCurrency((item.variantPrice || item.price) * item.quantity)}</strong>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>暂无商品信息</p>
              )}
            </div>
          </section>

          {/* 费用明细 */}
          <section className="order-section">
            <h2>费用明细</h2>
            <div className="price-breakdown">
              <div className="price-row">
                <span>商品总额</span>
                <span>{formatCurrency(order.totalAmount - (order.shipping?.fee || 0))}</span>
              </div>
              {order.shipping?.fee > 0 && (
                <div className="price-row">
                  <span>运费</span>
                  <span>{formatCurrency(order.shipping.fee)}</span>
                </div>
              )}
              <div className="price-row total-row">
                <span>订单总额</span>
                <strong>{formatCurrency(order.totalAmount)}</strong>
              </div>
            </div>
          </section>

          {/* 备注信息 */}
          {order.notes && (
            <section className="order-section">
              <h2>备注</h2>
              <p className="order-notes">{order.notes}</p>
            </section>
          )}

          {/* 淘宝/拼多多订单号 */}
          {(order.taobaoOrderIds?.length > 0 || order.pinduoduoOrderIds?.length > 0) && (
            <section className="order-section">
              <h2>关联订单</h2>
              {order.taobaoOrderIds?.length > 0 && (
                <div className="related-orders">
                  <p><strong>淘宝订单号：</strong></p>
                  <ul>
                    {order.taobaoOrderIds.map((id, index) => (
                      <li key={index}>{id}</li>
                    ))}
                  </ul>
                </div>
              )}
              {order.pinduoduoOrderIds?.length > 0 && (
                <div className="related-orders">
                  <p><strong>拼多多订单号：</strong></p>
                  <ul>
                    {order.pinduoduoOrderIds.map((id, index) => (
                      <li key={index}>{id}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
};

export default OrderDetail;
