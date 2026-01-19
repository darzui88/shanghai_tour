import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>Welcome to Shanghai!</h1>
          <p>Your complete guide to shopping, souvenirs, and events in Shanghai</p>
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </section>

      <div className="container">
        <section className="features">
          <div className="feature-card card">
            <div className="feature-icon">📍</div>
            <h3>Shopping Locations</h3>
            <p>Discover the best places to buy souvenirs and special items in Shanghai. Find offline stores with detailed information about products and prices.</p>
            <Link to="/locations" className="btn btn-secondary" style={{ marginTop: '20px' }}>
              Explore Locations
            </Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">🛍️</div>
            <h3>Online Shopping</h3>
            <p>Buy unique Chinese products with our drop-shipping service. We'll order from Taobao and Pinduoduo for you, saving you time and effort.</p>
            <Link to="/products" className="btn btn-secondary" style={{ marginTop: '20px' }}>
              Browse Products
            </Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">🎭</div>
            <h3>Events & Exhibitions</h3>
            <p>Stay updated with the latest events, exhibitions, and activities happening in Shanghai. Curated information from trusted sources.</p>
            <Link to="/events" className="btn btn-secondary" style={{ marginTop: '20px' }}>
              View Events
            </Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon">📖</div>
            <h3>Travel Guides</h3>
            <p>Practical guides and tips for exploring Shanghai. Learn how to navigate the city, use public transport, and discover hidden gems.</p>
            <Link to="/guides" className="btn btn-secondary" style={{ marginTop: '20px' }}>
              Read Guides
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home
