import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOrder, payOrder } from '../services/api';
import './Pay.css';

const Pay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await getOrder(id);
        
        // 检查组件是否仍然挂载
        if (!isMounted) return;
        
        setOrder(res.data);
        
        // 检查是否已过期
        if (res.data.paymentDeadline) {
          const now = new Date();
          const deadline = new Date(res.data.paymentDeadline);
          if (now > deadline) {
            setIsExpired(true);
          }
        }
      } catch (err) {
        // 检查组件是否仍然挂载
        if (!isMounted) return;
        
        console.error('Error loading order:', err);
        setError(err.response?.data?.error || 'Failed to load order');
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
    if (!order || isExpired) return;
    setPaying(true);
    setError('');
    try {
      await payOrder(order.id);
      alert('Payment successful. Order is marked as paid.');
      navigate('/profile?tab=orders');
    } catch (err) {
      console.error('Pay error:', err);
      const errorMsg = err.response?.data?.error || 'Payment failed';
      setError(errorMsg);
      
      // 如果是因为超时，更新状态
      if (errorMsg.includes('deadline') || errorMsg.includes('expired')) {
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

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Order not found</h2>
          <Link to="/profile?tab=orders" className="btn btn-primary">Back to Orders</Link>
        </div>
      </main>
    );
  }

  const amount = order.totalAmount || 0;

  return (
    <main>
      <div className="container">
        <div className="pay-card card">
          <h1>Payment</h1>
          <p>Order: <strong>{order.orderNumber}</strong></p>
          <p>Status: {order.paymentStatus}</p>
          <p className="pay-amount">Amount: ¥{parseFloat(amount).toFixed(2)}</p>

          {/* 支付截止时间显示 */}
          {order.paymentDeadline && (
            <div className="payment-deadline">
              {isExpired ? (
                <div className="deadline-expired">
                  <strong>⚠️ Payment deadline has passed</strong>
                  <p>Payment deadline: {formatDeadline(order.paymentDeadline)}</p>
                  <p>This order can no longer be paid.</p>
                </div>
              ) : (
                <div className="deadline-countdown">
                  <strong>⏰ Payment Deadline:</strong>
                  <p>Please complete payment before: {formatDeadline(order.paymentDeadline)}</p>
                  {timeRemaining && (
                    <div className="countdown-timer">
                      <strong>Time remaining: </strong>
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

          {error && <div className="pay-error">{error}</div>}

          <button
            className="btn btn-primary"
            onClick={handlePay}
            disabled={paying || order.paymentStatus === 'paid' || isExpired}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {order.paymentStatus === 'paid' 
              ? 'Already Paid' 
              : isExpired
                ? 'Payment Expired'
                : (paying ? 'Paying...' : 'Pay')}
          </button>

          <Link to="/profile?tab=orders" className="back-to-orders">Back to Orders</Link>
        </div>
      </div>
    </main>
  );
};

export default Pay;
