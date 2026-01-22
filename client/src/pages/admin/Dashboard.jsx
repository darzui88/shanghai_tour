import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>后台管理 Dashboard</h1>
        <div className="header-actions">
          <Link to="/admin/products" className="nav-link">商品管理</Link>
          <Link to="/admin/events" className="nav-link">活动管理</Link>
          <Link to="/admin/locations" className="nav-link">地点管理</Link>
          <Link to="/admin/guides" className="nav-link">攻略管理</Link>
          <Link to="/admin/scraper" className="nav-link">文章抓取</Link>
          <Link to="/admin/orders" className="nav-link">订单管理</Link>
          <button 
            onClick={() => {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUser');
              window.location.href = '/admin/login';
            }}
            className="logout-button"
          >
            退出登录
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-cards">
          <Link to="/admin/products" className="dashboard-card">
            <div className="card-icon">🛍️</div>
            <h2>商品管理</h2>
            <p>Products Management</p>
            <p className="card-description">添加、编辑、删除商品信息</p>
          </Link>

          <Link to="/admin/events" className="dashboard-card">
            <div className="card-icon">🎉</div>
            <h2>活动管理</h2>
            <p>Events Management</p>
            <p className="card-description">管理活动信息，包括标题、描述、时间、地点等</p>
          </Link>

          <Link to="/admin/locations" className="dashboard-card">
            <div className="card-icon">📍</div>
            <h2>地点管理</h2>
            <p>Locations Management</p>
            <p className="card-description">管理线下购物地点和旅游景点信息</p>
          </Link>

          <Link to="/admin/guides" className="dashboard-card">
            <div className="card-icon">📖</div>
            <h2>攻略管理</h2>
            <p>Guides Management</p>
            <p className="card-description">管理旅游攻略和实用指南文章</p>
          </Link>

          <Link to="/admin/scraper" className="dashboard-card">
            <div className="card-icon">🕷️</div>
            <h2>文章抓取</h2>
            <p>WeChat Article Scraper</p>
            <p className="card-description">从微信公众号文章抓取数据并保存到数据库</p>
          </Link>

          <Link to="/admin/orders" className="dashboard-card">
            <div className="card-icon">📦</div>
            <h2>订单管理</h2>
            <p>Orders Management</p>
            <p className="card-description">查看和管理所有订单，更新订单状态和支付状态</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
