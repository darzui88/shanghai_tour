import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ProductsManage from './pages/admin/ProductsManage'
import EventsManage from './pages/admin/EventsManage'
import LocationsManage from './pages/admin/LocationsManage'
import GuidesManage from './pages/admin/GuidesManage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Admin routes (no navbar) */}
          <Route path="/admin/login" element={<Login />} />
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
        </Routes>
      </div>
    </Router>
  )
}

export default App
