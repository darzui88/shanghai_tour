import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUserInfo, verifyUserToken } from '../services/api'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    // 使用setTimeout避免阻塞初始渲染
    const timer = setTimeout(() => {
      checkUserLogin()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const checkUserLogin = async () => {
    try {
      const token = localStorage.getItem('userToken')
      if (token) {
        try {
          const response = await verifyUserToken(token)
          if (response && response.data && response.data.success) {
            // Token有效，获取用户信息
            try {
              const userResponse = await getUserInfo()
              if (userResponse && userResponse.data && userResponse.data.success) {
                setUser(userResponse.data.user)
              }
            } catch (error) {
              // 获取用户信息失败，清除token
              console.error('Error getting user info:', error)
              localStorage.removeItem('userToken')
              setUser(null)
            }
          } else {
            localStorage.removeItem('userToken')
            setUser(null)
          }
        } catch (error) {
          // Token验证失败，清除token
          console.error('Error verifying token:', error)
          localStorage.removeItem('userToken')
          setUser(null)
        }
      }
    } catch (error) {
      // 防止任何错误导致页面崩溃
      console.error('Error in checkUserLogin:', error)
      setUser(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    setUser(null)
    navigate('/')
    window.location.reload()
  }

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
          {user ? (
            <>
              <li>
                <Link 
                  to="/profile" 
                  className={isActive('/profile') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user.name || user.email}
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="navbar-logout"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link 
                  to="/login" 
                  className={isActive('/login') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className={isActive('/register') ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
