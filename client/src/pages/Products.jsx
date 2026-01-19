import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getProducts } from '../services/api'
import './Products.css'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    minPrice: '',
    maxPrice: ''
  })

  // 当filters改变时，重置并重新加载
  useEffect(() => {
    setPage(1)
    setProducts([])
    setHasMore(true)
    fetchProducts(1, true)
  }, [filters])

  // 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 当滚动到距离底部200px时开始加载
      if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, loadingMore, hasMore, page, filters])

  const fetchProducts = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const params = {
        ...filters,
        page: pageNum,
        limit: 20
      }
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key]
      })
      
      const response = await getProducts(params)
      const newProducts = response.data.products || response.data || []
      const totalPages = response.data.totalPages || 1
      
      if (reset) {
        setProducts(newProducts)
      } else {
        setProducts(prev => [...prev, ...newProducts])
      }
      
      setHasMore(pageNum < totalPages)
      setPage(pageNum)
      
      if (reset) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      if (reset) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(page + 1, false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    )
  }

  return (
    <main>
      <div className="container">
        <section>
          <h1>Online Products</h1>
          <p>Discover unique Chinese products. We'll order from Taobao/Pinduoduo for you!</p>

          <div className="filters card" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <h3>Filters</h3>
            <div className="filter-grid">
              <input
                type="text"
                name="search"
                placeholder="Search products..."
                value={filters.search}
                onChange={handleFilterChange}
                className="input"
              />
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Categories</option>
                <option value="souvenir">Souvenirs</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food</option>
                <option value="cosmetics">Cosmetics</option>
                <option value="other">Other</option>
              </select>
              <input
                type="number"
                name="minPrice"
                placeholder="Min Price (¥)"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="input"
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Max Price (¥)"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="input"
              />
            </div>
          </div>

          <div className="grid">
            {products.length > 0 ? (
              products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="product-card card">
                  {product.images && product.images.length > 0 && (
                    <div className="product-image">
                      <img 
                        src={product.images[0].url || product.images[0]} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          const placeholder = document.createElement('div')
                          placeholder.style.cssText = 'width:100%;height:200px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;border-radius:8px'
                          placeholder.textContent = 'Image not available'
                          e.target.parentNode.appendChild(placeholder)
                        }}
                      />
                    </div>
                  )}
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description.substring(0, 100)}...</p>
                    <div className="product-price">
                      <span className="price">¥{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="original-price">¥{product.originalPrice}</span>
                      )}
                    </div>
                    {product.expressDeliveryAvailable && (
                      <span className="badge">🚀 Express Available</span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p>No products found. Try adjusting your filters.</p>
            )}
          </div>
          
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading more products...
            </div>
          )}
          
          {!hasMore && products.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No more products to load
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Products
