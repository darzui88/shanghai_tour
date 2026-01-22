import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import Home from './pages/Home'
import Products from './pages/Products'
import Locations from './pages/Locations'
import Events from './pages/Events'
import Guides from './pages/Guides'
import ProductDetail from './pages/ProductDetail'
import LocationDetail from './pages/LocationDetail'
import EventDetail from './pages/EventDetail'
import GuideDetail from './pages/GuideDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProductsManage from './pages/admin/ProductsManage'
import EventsManage from './pages/admin/EventsManage'
import LocationsManage from './pages/admin/LocationsManage'
import GuidesManage from './pages/admin/GuidesManage'
import WeChatScraper from './pages/admin/WeChatScraper'
import OrdersManage from './pages/admin/OrdersManage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import OrderDetail from './pages/OrderDetail'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Pay from './pages/Pay'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App">
          <Routes>
          {/* Admin routes (no navbar) */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <ProductsManage />
            </ProtectedRoute>
          } />
          <Route path="/admin/events" element={
            <ProtectedRoute>
              <EventsManage />
            </ProtectedRoute>
          } />
          <Route path="/admin/locations" element={
            <ProtectedRoute>
              <LocationsManage />
            </ProtectedRoute>
          } />
          <Route path="/admin/guides" element={
            <ProtectedRoute>
              <GuidesManage />
            </ProtectedRoute>
          } />
          <Route path="/admin/scraper" element={
            <ProtectedRoute>
              <WeChatScraper />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <OrdersManage />
            </ProtectedRoute>
          } />
          {/* Fallback for unknown admin paths */}
          <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          
          {/* Public routes (with navbar) */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
          <Route path="/locations" element={<Layout><Locations /></Layout>} />
          <Route path="/locations/:id" element={<Layout><LocationDetail /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
          <Route path="/guides" element={<Layout><Guides /></Layout>} />
          <Route path="/guides/:id" element={<Layout><GuideDetail /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/orders/:id" element={<Layout><OrderDetail /></Layout>} />
          <Route path="/pay/:id" element={<Layout><Pay /></Layout>} />
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
