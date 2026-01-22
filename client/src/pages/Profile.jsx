import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  getUserInfo,
  updateUserInfo,
  updatePassword,
  updateAddresses,
  getMyOrders
} from '../services/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info'); // info, addresses, password, orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // 个人信息表单
  const [infoForm, setInfoForm] = useState({
    name: '',
    phone: ''
  });
  const [infoSaving, setInfoSaving] = useState(false);

  // 密码表单
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 地址表单
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    checkAuthAndLoadUser();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  const checkAuthAndLoadUser = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/login?from=/profile');
      return;
    }

    try {
      const response = await getUserInfo();
      if (response.data.success) {
        setUser(response.data.user);
        setInfoForm({
          name: response.data.user.name || '',
          phone: response.data.user.phone || ''
        });
      } else {
        navigate('/login?from=/profile');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('userToken');
      navigate('/login?from=/profile');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      console.log('🔍 加载订单列表...');
      const response = await getMyOrders({ page: 1, limit: 50 });
      console.log('📦 订单响应:', response.data);
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        console.log(`✅ 加载了 ${response.data.orders.length} 个订单`);
      } else {
        console.log('⚠️ 响应中没有订单数据');
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ 加载订单失败:', error);
      console.error('错误详情:', error.response?.data);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoSaving(true);

    try {
      const response = await updateUserInfo(infoForm);
      if (response.data.success) {
        setUser(response.data.user);
        alert('个人信息更新成功！');
      }
    } catch (error) {
      alert(error.response?.data?.error || '更新失败，请重试');
    } finally {
      setInfoSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('请填写所有字段');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('新密码至少6个字符');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      if (response.data.success) {
        alert('密码修改成功！');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      setPasswordError(error.response?.data?.error || '密码修改失败，请重试');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.name || !addressForm.address) {
      alert('请填写收货人姓名和地址');
      return;
    }

    setAddressSaving(true);
    try {
      const currentAddresses = user.addresses || [];
      let newAddresses;
      let defaultIndex = user.defaultAddressIndex || 0;

      if (editingAddressIndex !== null) {
        // 编辑地址
        newAddresses = [...currentAddresses];
        newAddresses[editingAddressIndex] = { ...addressForm };
      } else {
        // 添加新地址
        newAddresses = [...currentAddresses, { ...addressForm }];
        if (newAddresses.length === 1) {
          defaultIndex = 0;
        }
      }

      const response = await updateAddresses(newAddresses, defaultIndex);
      if (response.data.success) {
        setUser(response.data.user);
        setAddressForm({ name: '', phone: '', address: '' });
        setEditingAddressIndex(null);
        alert(editingAddressIndex !== null ? '地址更新成功！' : '地址添加成功！');
      }
    } catch (error) {
      alert(error.response?.data?.error || '操作失败，请重试');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleEditAddress = (index) => {
    const address = user.addresses[index];
    setAddressForm({
      name: address.name,
      phone: address.phone || '',
      address: address.address
    });
    setEditingAddressIndex(index);
  };

  const handleDeleteAddress = async (index) => {
    if (!window.confirm('确定要删除这个地址吗？')) return;

    try {
      const currentAddresses = user.addresses || [];
      const newAddresses = currentAddresses.filter((_, i) => i !== index);
      let defaultIndex = user.defaultAddressIndex || 0;

      if (defaultIndex >= newAddresses.length) {
        defaultIndex = newAddresses.length > 0 ? 0 : -1;
      } else if (index < defaultIndex) {
        defaultIndex = defaultIndex - 1;
      }

      const response = await updateAddresses(newAddresses, defaultIndex);
      if (response.data.success) {
        setUser(response.data.user);
        alert('地址删除成功！');
      }
    } catch (error) {
      alert(error.response?.data?.error || '删除失败，请重试');
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      const response = await updateAddresses(user.addresses, index);
      if (response.data.success) {
        setUser(response.data.user);
        alert('默认地址已更新！');
      }
    } catch (error) {
      alert(error.response?.data?.error || '操作失败，请重试');
    }
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

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="profile-container">
      <div className="container">
        <h1>个人中心</h1>

        <div className="profile-tabs">
          <button
            className={activeTab === 'info' ? 'active' : ''}
            onClick={() => {
              setActiveTab('info');
              setSearchParams({});
            }}
          >
            个人信息
          </button>
          <button
            className={activeTab === 'addresses' ? 'active' : ''}
            onClick={() => {
              setActiveTab('addresses');
              setSearchParams({ tab: 'addresses' });
            }}
          >
            收货地址
          </button>
          <button
            className={activeTab === 'password' ? 'active' : ''}
            onClick={() => {
              setActiveTab('password');
              setSearchParams({ tab: 'password' });
            }}
          >
            修改密码
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => {
              setActiveTab('orders');
              setSearchParams({ tab: 'orders' });
            }}
          >
            我的订单
          </button>
        </div>

        <div className="profile-content">
          {/* 个人信息 */}
          {activeTab === 'info' && (
            <div className="profile-section">
              <h2>个人信息</h2>
              <form onSubmit={handleUpdateInfo} className="profile-form">
                <div className="form-group">
                  <label>邮箱</label>
                  <input type="email" value={user.email} disabled />
                  <small>邮箱不可修改</small>
                </div>

                <div className="form-group">
                  <label>姓名</label>
                  <input
                    type="text"
                    value={infoForm.name}
                    onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>

                <div className="form-group">
                  <label>手机号</label>
                  <input
                    type="tel"
                    value={infoForm.phone}
                    onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                    placeholder="请输入手机号"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={infoSaving}>
                  {infoSaving ? '保存中...' : '保存'}
                </button>
              </form>
            </div>
          )}

          {/* 收货地址 */}
          {activeTab === 'addresses' && (
            <div className="profile-section">
              <h2>收货地址</h2>

              {/* 地址列表 */}
              {user.addresses && user.addresses.length > 0 && (
                <div className="addresses-list">
                  {user.addresses.map((address, index) => (
                    <div key={index} className="address-item">
                      <div className="address-header">
                        <span className="address-name">{address.name}</span>
                        {index === user.defaultAddressIndex && (
                          <span className="default-badge">默认</span>
                        )}
                      </div>
                      <div className="address-details">
                        <p>电话：{address.phone || '-'}</p>
                        <p>地址：{address.address}</p>
                      </div>
                      <div className="address-actions">
                        {index !== user.defaultAddressIndex && (
                          <button
                            onClick={() => handleSetDefaultAddress(index)}
                            className="btn-small"
                          >
                            设为默认
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAddress(index)}
                          className="btn-small"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(index)}
                          className="btn-small btn-danger"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 添加/编辑地址表单 */}
              <div className="address-form-card">
                <h3>{editingAddressIndex !== null ? '编辑地址' : '添加新地址'}</h3>
                <form onSubmit={handleAddAddress} className="profile-form">
                  <div className="form-group">
                    <label>收货人姓名 *</label>
                    <input
                      type="text"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                      required
                      placeholder="请输入收货人姓名"
                    />
                  </div>

                  <div className="form-group">
                    <label>联系电话</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="请输入联系电话"
                    />
                  </div>

                  <div className="form-group">
                    <label>详细地址 *</label>
                    <textarea
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                      required
                      rows="3"
                      placeholder="请输入详细地址"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={addressSaving}>
                      {addressSaving ? '保存中...' : (editingAddressIndex !== null ? '更新' : '添加')}
                    </button>
                    {editingAddressIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddressForm({ name: '', phone: '', address: '' });
                          setEditingAddressIndex(null);
                        }}
                        className="btn-secondary"
                      >
                        取消
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 修改密码 */}
          {activeTab === 'password' && (
            <div className="profile-section">
              <h2>修改密码</h2>
              <form onSubmit={handleUpdatePassword} className="profile-form">
                {passwordError && <div className="error-message">{passwordError}</div>}

                <div className="form-group">
                  <label>当前密码 *</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    placeholder="请输入当前密码"
                  />
                </div>

                <div className="form-group">
                  <label>新密码 *</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength="6"
                    placeholder="至少6个字符"
                  />
                </div>

                <div className="form-group">
                  <label>确认新密码 *</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    placeholder="请再次输入新密码"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={passwordSaving}>
                  {passwordSaving ? '修改中...' : '修改密码'}
                </button>
              </form>
            </div>
          )}

          {/* 我的订单 */}
          {activeTab === 'orders' && (
            <div className="profile-section">
              <h2>我的订单</h2>

              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
              ) : orders.length === 0 ? (
                <div className="empty-state">暂无订单</div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-item">
                      <div className="order-header">
                        <div>
                          <strong>订单号：{order.orderNumber}</strong>
                          <span className="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge status-${order.status}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>

                      <div className="order-items">
                        {order.items?.map((item, index) => (
                          <div key={index} className="order-item-row">
                            <span>
                              {item.product?.nameCN || item.product?.name || `商品ID: ${item.product}`}
                            </span>
                            <span>x{item.quantity}</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-total">
                          总计：<strong>{formatCurrency(order.totalAmount)}</strong>
                        </div>
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="btn-small"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;
