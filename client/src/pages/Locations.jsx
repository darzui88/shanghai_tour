import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getLocations } from '../services/api'
import './Locations.css'

const Locations = () => {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    district: '',
    search: ''
  })

  // 当filters改变时，重置并重新加载
  useEffect(() => {
    setPage(1)
    setLocations([])
    setHasMore(true)
    fetchLocations(1, true)
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

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchLocations(page + 1, false)
    }
  }

  const fetchLocations = async (pageNum = 1, reset = false) => {
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
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key]
      })
      const response = await getLocations(params)
      
      // 确保locations是数组，并解析JSON字段（如果从MySQL返回的是字符串）
      const locationsData = response.data.locations || response.data || []
      const totalPages = response.data.totalPages || 1
      const parsedLocations = Array.isArray(locationsData) ? locationsData.map(loc => {
        try {
          return {
            ...loc,
            // 确保rating是数字类型
            rating: loc.rating ? Number(loc.rating) : 0,
            categories: typeof loc.categories === 'string' ? (loc.categories ? JSON.parse(loc.categories) : []) : (Array.isArray(loc.categories) ? loc.categories : []),
            images: typeof loc.images === 'string' ? (loc.images ? JSON.parse(loc.images) : []) : (Array.isArray(loc.images) ? loc.images : []),
            products: typeof loc.products === 'string' ? (loc.products ? JSON.parse(loc.products) : []) : (Array.isArray(loc.products) ? loc.products : []),
            openingHours: typeof loc.openingHours === 'string' ? (loc.openingHours ? JSON.parse(loc.openingHours) : null) : loc.openingHours,
            transport: typeof loc.transport === 'string' ? (loc.transport ? JSON.parse(loc.transport) : null) : loc.transport,
            tips: typeof loc.tips === 'string' ? (loc.tips ? JSON.parse(loc.tips) : []) : (Array.isArray(loc.tips) ? loc.tips : []),
            coordinates: typeof loc.coordinates === 'string' ? (loc.coordinates ? JSON.parse(loc.coordinates) : null) : loc.coordinates
          }
        } catch (parseError) {
          console.error('Error parsing location data:', loc.id, parseError)
          return {
            ...loc,
            rating: loc.rating ? Number(loc.rating) : 0 // 即使解析失败也确保rating是数字
          }
        }
      }) : []
      
      console.log('✅ Fetched locations:', parsedLocations.length)
      if (parsedLocations.length > 0) {
        console.log('First location:', parsedLocations[0].name)
      }
      
      if (reset) {
        setLocations(parsedLocations)
      } else {
        setLocations(prev => [...prev, ...parsedLocations])
      }
      
      setHasMore(pageNum < totalPages)
      setPage(pageNum)
      
      if (reset) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    } catch (error) {
      console.error('❌ Error fetching locations:', error)
      console.error('Error details:', error.response?.data || error.message)
      if (reset) {
        setLoading(false)
        setLocations([]) // 出错时设置为空数组
      } else {
        setLoadingMore(false)
      }
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  // 调试信息
  useEffect(() => {
    console.log('Locations component mounted/updated')
    console.log('Loading state:', loading)
    console.log('Locations count:', locations.length)
  }, [loading, locations])

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading locations...</div>
      </main>
    )
  }

  return (
    <main>
      <div className="container">
        <section>
          <h1>Shopping Locations in Shanghai</h1>
          <p>Discover the best offline stores to buy souvenirs and special items</p>
          
          {/* 调试信息 - 可以暂时显示 */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px', fontSize: '12px' }}>
              Debug: Found {locations.length} locations
            </div>
          )}

          <div className="filters card" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <h3>Filters</h3>
            <div className="filter-grid">
              <input
                type="text"
                name="search"
                placeholder="Search locations..."
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
                <option value="art">Art</option>
                <option value="antique">Antiques</option>
              </select>
              <select
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Districts</option>
                <option value="Huangpu">Huangpu</option>
                <option value="Xuhui">Xuhui</option>
                <option value="Changning">Changning</option>
                <option value="Jing'an">Jing'an</option>
                <option value="Putuo">Putuo</option>
                <option value="Hongkou">Hongkou</option>
                <option value="Yangpu">Yangpu</option>
                <option value="Pudong">Pudong</option>
              </select>
            </div>
          </div>

          <div className="grid">
            {locations.length > 0 ? (
              locations.map((location) => (
                <Link key={location.id} to={`/locations/${location.id}`} className="location-card card">
                  {location.images && Array.isArray(location.images) && location.images.length > 0 && (
                    <div className="location-image">
                      <img 
                        src={location.images[0]} 
                        alt={location.name}
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
                  <div className="location-info">
                    <h3>{location.name}</h3>
                    {location.nameCN && <p className="chinese-name">{location.nameCN}</p>}
                    <p className="location-address">📍 {location.address}</p>
                    <p className="location-district">{location.district}</p>
                    {location.description && (
                      <p className="location-description">
                        {location.description.length > 120 ? location.description.substring(0, 120) + '...' : location.description}
                      </p>
                    )}
                    {location.rating && Number(location.rating) > 0 && (
                      <div className="rating">
                        {'⭐'.repeat(Math.floor(Number(location.rating)))} {Number(location.rating).toFixed(1)}
                      </div>
                    )}
                    {location.categories && Array.isArray(location.categories) && location.categories.length > 0 && (
                      <div className="categories">
                        {location.categories.slice(0, 3).map((cat, index) => (
                          <span key={index} className="category-tag">{cat}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p>No locations found. Try adjusting your filters.</p>
            )}
          </div>
          
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading more locations...
            </div>
          )}
          
          {!hasMore && locations.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No more locations to load
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Locations
