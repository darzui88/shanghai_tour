import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getGuides } from '../services/api'
import './Guides.css'

const Guides = () => {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    search: ''
  })

  // 当filters改变时，重置并重新加载
  useEffect(() => {
    setPage(1)
    setGuides([])
    setHasMore(true)
    fetchGuides(1, true)
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
      fetchGuides(page + 1, false)
    }
  }

  const fetchGuides = async (pageNum = 1, reset = false) => {
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
      const response = await getGuides(params)
      const guidesData = response.data.guides || response.data || []
      const totalPages = response.data.totalPages || 1
      const newGuides = Array.isArray(guidesData) ? guidesData : []
      
      if (reset) {
        setGuides(newGuides)
      } else {
        setGuides(prev => [...prev, ...newGuides])
      }
      
      setHasMore(pageNum < totalPages)
      setPage(pageNum)
      
      if (reset) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    } catch (error) {
      console.error('Error fetching guides:', error)
      if (reset) {
        setLoading(false)
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
          <h1>Travel Guides</h1>
          <p>Helpful guides and tips for exploring Shanghai</p>

          <div className="filters card" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <h3>Filters</h3>
            <div className="filter-grid">
              <input
                type="text"
                name="search"
                placeholder="Search guides..."
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
                <option value="transport">Transport 交通</option>
                <option value="shopping">Shopping 购物</option>
                <option value="food">Food 美食</option>
                <option value="sightseeing">Sightseeing 观光</option>
                <option value="culture">Culture 文化</option>
                <option value="tips">Tips 贴士</option>
                <option value="other">Other 其他</option>
              </select>
            </div>
          </div>

          <div className="guides-grid">
            {guides.length > 0 ? (
              guides.map((guide) => (
                <Link key={guide.id} to={`/guides/${guide.id}`} className="guide-card card">
                  {guide.isPinned && (
                    <span className="pinned-badge">📌 Pinned</span>
                  )}
                  {guide.coverImage && (
                    <div className="guide-image">
                      <img
                        src={guide.coverImage}
                        alt={guide.title}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="guide-info">
                    <h3>{guide.title}</h3>
                    {guide.titleCN && <p className="chinese-name">{guide.titleCN}</p>}
                    {guide.summary && (
                      <p className="guide-summary">{guide.summary}</p>
                    )}
                    {guide.tags && Array.isArray(guide.tags) && guide.tags.length > 0 && (
                      <div className="tags">
                        {guide.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="guide-meta">
                      <span className="category-badge">{guide.category}</span>
                      {guide.viewCount > 0 && (
                        <span className="view-count">👁️ {guide.viewCount}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p>No guides found. Try adjusting your filters.</p>
            )}
          </div>
          
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading more guides...
            </div>
          )}
          
          {!hasMore && guides.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No more guides to load
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Guides
