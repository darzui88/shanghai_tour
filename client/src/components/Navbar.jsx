import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <h2>🛍️ Shanghai Tour Guide</h2>
        </Link>
        
        <button 
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/products" 
              className={isActive('/products') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
          </li>
          <li>
            <Link 
              to="/locations" 
              className={isActive('/locations') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Shopping Locations
            </Link>
          </li>
          <li>
            <Link 
              to="/events" 
              className={isActive('/events') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Events & Exhibitions
            </Link>
          </li>
          <li>
            <Link 
              to="/guides" 
              className={isActive('/guides') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Travel Guides
            </Link>
          </li>
          <li>
            <Link 
              to="/cart" 
              className={isActive('/cart') ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Cart 🛒
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
