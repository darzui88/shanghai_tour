import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminCancelOrder,
  adminShipOrder,
  adminUpdateShippingInfo
} from '../../services/api';
import './Manage.css';

const OrdersManage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [showShipModal, setShowShipModal] = useState(false);
  const [showShippingEditModal, setShowShippingEditModal] = useState(false);
  const [shipFormData, setShipFormData] = useState({
    shippingCompany: '',
    trackingNumber: '',
    shippingNotes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, paymentStatusFilter, activeSearchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };
      if (statusFilter) params.status = statusFilter;
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      
      const response = await adminGetOrders(params);
      let filteredOrders = response.data.orders || [];
      
      // 客户端搜索（订单号、用户邮箱、用户名）
      if (activeSearchTerm.trim()) {
        const searchLower = activeSearchTerm.toLowerCase();
        filteredOrders = filteredOrders.filter(order => {
          const orderNumber = order.orderNumber?.toLowerCase() || '';
          const userEmail = order.user?.email?.toLowerCase() || order.user?.Email?.toLowerCase() || '';
          const userName = order.user?.name?.toLowerCase() || order.user?.Name?.toLowerCase() || '';
          return orderNumber.includes(searchLower) || 
                 userEmail.includes(searchLower) || 
                 userName.includes(searchLower);
        });
      }
      
      setOrders(filteredOrders);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setCurrentPage(1);
  };

  const handleViewDetail = async (orderId) => {
    try {
      const response = await adminGetOrder(orderId);
      setSelectedOrder(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('获取订单详情失败');
    }
  };

  const handleStatusUpdate = async (orderId, field, value) => {
    try {
      const updateData = {};
      updateData[field] = value;
      
      await adminUpdateOrderStatus(orderId, updateData);
      alert('订单状态更新成功');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await adminGetOrder(orderId);
        setSelectedOrder(updatedOrder.data);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert(error.response?.data?.error || '更新订单状态失败');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm('确定要取消这个订单吗？如果订单已支付，将标记为退款状态。')) {
      return;
    }

    try {
      await adminCancelOrder(orderId);
      alert('订单已取消');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await adminGetOrder(orderId);
        setSelectedOrder(updatedOrder.data);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.response?.data?.error || '取消订单失败');
    }
  };

  const handleShipOrder = async (orderId) => {
    // 打开发货弹窗
    const order = selectedOrder || orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      // 如果已有物流信息，填充表单
      if (order.shipping?.shippingCompany) {
        setShipFormData({
          shippingCompany: order.shipping.shippingCompany || '',
          trackingNumber: order.shipping.trackingNumber || '',
          shippingNotes: order.shipping.shippingNotes || ''
        });
      } else {
        setShipFormData({
          shippingCompany: '',
          trackingNumber: '',
          shippingNotes: ''
        });
      }
      setShowShipModal(true);
    }
  };

  const handleSubmitShip = async () => {
    if (!shipFormData.shippingCompany || !shipFormData.trackingNumber) {
      alert('请填写物流公司名称和物流单号');
      return;
    }

    try {
      const orderId = selectedOrder?.id;
      if (!orderId) return;

      await adminShipOrder(orderId, shipFormData);
      alert('订单已发货');
      setShowShipModal(false);
      fetchOrders();
      const updatedOrder = await adminGetOrder(orderId);
      setSelectedOrder(updatedOrder.data);
    } catch (error) {
      console.error('Error shipping order:', error);
      alert(error.response?.data?.error || '发货失败');
    }
  };

  const handleEditShipping = async (orderId) => {
    const order = selectedOrder || orders.find(o => o.id === orderId);
    if (order && order.status === 'shipped') {
      setSelectedOrder(order);
      setShipFormData({
        shippingCompany: order.shipping?.shippingCompany || '',
        trackingNumber: order.shipping?.trackingNumber || '',
        shippingNotes: order.shipping?.shippingNotes || ''
      });
      setShowShippingEditModal(true);
    }
  };

  const handleSubmitShippingEdit = async () => {
    if (!shipFormData.shippingCompany || !shipFormData.trackingNumber) {
      alert('请填写物流公司名称和物流单号');
      return;
    }

    try {
      const orderId = selectedOrder?.id;
      if (!orderId) return;

      await adminUpdateShippingInfo(orderId, shipFormData);
      alert('物流信息已更新');
      setShowShippingEditModal(false);
      fetchOrders();
      const updatedOrder = await adminGetOrder(orderId);
      setSelectedOrder(updatedOrder.data);
    } catch (error) {
      console.error('Error updating shipping info:', error);
      alert(error.response?.data?.error || '更新物流信息失败');
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      purchased: 'status-purchased',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  };

  const getPaymentStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: 'payment-pending',
      paid: 'payment-paid',
      failed: 'payment-failed',
      refunded: 'payment-refunded'
    };
    return statusClasses[status] || 'payment-default';
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

  return (
    <div className="manage-container">
      <div className="manage-header">
        <h1>订单管理</h1>
        <Link to="/admin" className="back-link">← 返回Dashboard</Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="manage-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索订单号、用户邮箱或姓名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>搜索</button>
          {activeSearchTerm && (
            <button onClick={handleClearSearch}>清除</button>
          )}
        </div>

        <div className="filter-box">
          <label>订单状态：</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">全部</option>
            <option value="pending">待处理</option>
            <option value="confirmed">已确认</option>
            <option value="processing">处理中</option>
            <option value="purchased">已购买</option>
            <option value="shipped">已发货</option>
            <option value="delivered">已送达</option>
            <option value="cancelled">已取消</option>
          </select>

          <label>支付状态：</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">全部</option>
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
            <option value="failed">支付失败</option>
            <option value="refunded">已退款</option>
          </select>
        </div>
      </div>

      {/* 订单列表 */}
      {loading ? (
        <div className="loading">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">暂无订单</div>
      ) : (
        <>
          <div className="manage-stats">
            共 {total} 个订单，当前第 {currentPage} / {totalPages} 页
          </div>

          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>用户信息</th>
                  <th>商品数量</th>
                  <th>总金额</th>
                  <th>订单状态</th>
                  <th>支付状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>
                      <div className="user-info">
                        <div>{order.user?.name || order.user?.Name || '-'}</div>
                        <div className="user-email">
                          {order.user?.email || order.user?.Email || '-'}
                        </div>
                      </div>
                    </td>
                    <td>{order.items?.length || 0}</td>
                    <td>
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status === 'pending' && '待处理'}
                        {order.status === 'confirmed' && '已确认'}
                        {order.status === 'processing' && '处理中'}
                        {order.status === 'purchased' && '已购买'}
                        {order.status === 'shipped' && '已发货'}
                        {order.status === 'delivered' && '已送达'}
                        {order.status === 'cancelled' && '已取消'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                        {order.paymentStatus === 'pending' && '待支付'}
                        {order.paymentStatus === 'paid' && '已支付'}
                        {order.paymentStatus === 'failed' && '支付失败'}
                        {order.paymentStatus === 'refunded' && '已退款'}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => handleViewDetail(order.id)}
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                上一页
              </button>
              <span>
                第 {currentPage} / {totalPages} 页
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      {/* 订单详情模态框 */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>订单详情 - {selectedOrder.orderNumber}</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* 用户信息 */}
              <div className="detail-section">
                <h3>用户信息</h3>
                <div className="detail-grid">
                  <div>
                    <label>姓名：</label>
                    <span>{selectedOrder.user?.name || selectedOrder.user?.Name || '-'}</span>
                  </div>
                  <div>
                    <label>邮箱：</label>
                    <span>{selectedOrder.user?.email || selectedOrder.user?.Email || '-'}</span>
                  </div>
                  <div>
                    <label>电话：</label>
                    <span>{selectedOrder.user?.phone || selectedOrder.user?.Phone || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 配送信息 */}
              <div className="detail-section">
                <h3>配送信息</h3>
                <div className="detail-grid">
                  <div>
                    <label>收货地址：</label>
                    <span>
                      {selectedOrder.shipping?.address || '-'}
                    </span>
                  </div>
                  <div>
                    <label>配送方式：</label>
                    <span>
                      {selectedOrder.shipping?.method === 'express' ? '快递' : '自提'}
                    </span>
                  </div>
                  <div>
                    <label>运费：</label>
                    <span>{formatCurrency(selectedOrder.shipping?.fee || 0)}</span>
                  </div>
                </div>
              </div>

              {/* 商品列表 */}
              <div className="detail-section">
                <h3>商品列表</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>商品名称</th>
                      <th>数量</th>
                      <th>单价</th>
                      <th>小计</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.product?.nameCN || item.product?.name || `商品ID: ${item.product}`}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 订单状态 */}
              <div className="detail-section">
                <h3>订单状态</h3>
                <div className="detail-grid">
                  <div>
                    <label>订单状态：</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, 'status', e.target.value)}
                    >
                      <option value="pending">待处理</option>
                      <option value="confirmed">已确认</option>
                      <option value="processing">处理中</option>
                      <option value="purchased">已购买</option>
                      <option value="shipped">已发货</option>
                      <option value="delivered">已送达</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <div>
                    <label>支付状态：</label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, 'paymentStatus', e.target.value)}
                    >
                      <option value="pending">待支付</option>
                      <option value="paid">已支付</option>
                      <option value="failed">支付失败</option>
                      <option value="refunded">已退款</option>
                    </select>
                  </div>
                  <div>
                    <label>总金额：</label>
                    <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* 第三方订单ID */}
              {(selectedOrder.taobaoOrderIds?.length > 0 || selectedOrder.pinduoduoOrderIds?.length > 0) && (
                <div className="detail-section">
                  <h3>第三方订单</h3>
                  {selectedOrder.taobaoOrderIds?.length > 0 && (
                    <div>
                      <label>淘宝订单ID：</label>
                      <span>{selectedOrder.taobaoOrderIds.join(', ')}</span>
                    </div>
                  )}
                  {selectedOrder.pinduoduoOrderIds?.length > 0 && (
                    <div>
                      <label>拼多多订单ID：</label>
                      <span>{selectedOrder.pinduoduoOrderIds.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 备注 */}
              {selectedOrder.notes && (
                <div className="detail-section">
                  <h3>备注</h3>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}

              {/* 物流信息 */}
              {selectedOrder.status === 'shipped' && selectedOrder.shipping?.shippingCompany && (
                <div className="detail-section">
                  <h3>物流信息</h3>
                  <div className="detail-grid">
                    <div>
                      <label>物流公司：</label>
                      <span>{selectedOrder.shipping.shippingCompany}</span>
                    </div>
                    <div>
                      <label>物流单号：</label>
                      <span>{selectedOrder.shipping.trackingNumber}</span>
                    </div>
                    {selectedOrder.shipping.shippingNotes && (
                      <div>
                        <label>物流备注：</label>
                        <span>{selectedOrder.shipping.shippingNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 时间信息 */}
              <div className="detail-section">
                <h3>时间信息</h3>
                <div className="detail-grid">
                  <div>
                    <label>创建时间：</label>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div>
                    <label>更新时间：</label>
                    <span>{formatDate(selectedOrder.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="detail-section">
                <h3>操作</h3>
                <div className="action-buttons">
                  {/* 取消订单按钮 - 任何状态下都可以取消 */}
                  {selectedOrder.status !== 'cancelled' && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                    >
                      取消订单
                    </button>
                  )}
                  
                  {/* 发货按钮 - 只有未发货的订单可以发货 */}
                  {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'cancelled' && (
                    <button
                      className="btn-ship"
                      onClick={() => handleShipOrder(selectedOrder.id)}
                    >
                      发货
                    </button>
                  )}
                  
                  {/* 修改物流信息按钮 - 只有已发货的订单可以修改 */}
                  {selectedOrder.status === 'shipped' && (
                    <button
                      className="btn-edit-shipping"
                      onClick={() => handleEditShipping(selectedOrder.id)}
                    >
                      修改物流信息
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 发货弹窗 */}
      {showShipModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowShipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>发货 - {selectedOrder.orderNumber}</h2>
              <button
                className="modal-close"
                onClick={() => setShowShipModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>物流公司名称 *</label>
                <input
                  type="text"
                  value={shipFormData.shippingCompany}
                  onChange={(e) => setShipFormData({ ...shipFormData, shippingCompany: e.target.value })}
                  placeholder="例如：顺丰、圆通、中通等"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>物流单号 *</label>
                <input
                  type="text"
                  value={shipFormData.trackingNumber}
                  onChange={(e) => setShipFormData({ ...shipFormData, trackingNumber: e.target.value })}
                  placeholder="请输入物流单号"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea
                  value={shipFormData.shippingNotes}
                  onChange={(e) => setShipFormData({ ...shipFormData, shippingNotes: e.target.value })}
                  placeholder="可选：物流备注信息"
                  className="input"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowShipModal(false)}>
                  取消
                </button>
                <button className="btn-primary" onClick={handleSubmitShip}>
                  确认发货
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 修改物流信息弹窗 */}
      {showShippingEditModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowShippingEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>修改物流信息 - {selectedOrder.orderNumber}</h2>
              <button
                className="modal-close"
                onClick={() => setShowShippingEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>物流公司名称 *</label>
                <input
                  type="text"
                  value={shipFormData.shippingCompany}
                  onChange={(e) => setShipFormData({ ...shipFormData, shippingCompany: e.target.value })}
                  placeholder="例如：顺丰、圆通、中通等"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>物流单号 *</label>
                <input
                  type="text"
                  value={shipFormData.trackingNumber}
                  onChange={(e) => setShipFormData({ ...shipFormData, trackingNumber: e.target.value })}
                  placeholder="请输入物流单号"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>备注</label>
                <textarea
                  value={shipFormData.shippingNotes}
                  onChange={(e) => setShipFormData({ ...shipFormData, shippingNotes: e.target.value })}
                  placeholder="可选：物流备注信息"
                  className="input"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowShippingEditModal(false)}>
                  取消
                </button>
                <button className="btn-primary" onClick={handleSubmitShippingEdit}>
                  确认修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManage;
