import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../services/api';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('尝试登录，用户名:', username);
      
      // 使用api.js中的adminLogin函数
      const response = await adminLogin(username, password);

      console.log('登录响应:', response.data);

      if (response.data.success) {
        // 保存token到localStorage
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        
        // 跳转到后台管理首页
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('登录错误:', err);
      console.error('错误响应:', err.response?.data);
      console.error('错误状态:', err.response?.status);
      
      if (err.response) {
        // 服务器返回了响应
        setError(err.response.data?.error || `登录失败 (${err.response.status})`);
      } else if (err.request) {
        // 请求发送了但没有收到响应
        setError('无法连接到服务器，请确保后端服务正在运行 (http://localhost:5000)');
      } else {
        // 其他错误
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>管理员登录</h1>
        <p>Admin Login</p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>用户名 Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter username"
            />
          </div>

          <div className="form-group">
            <label>密码 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? '登录中...' : '登录 Login'}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">返回首页 Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
