import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEvents } from '../services/api'
import './Events.css'

const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    featured: '',
    search: ''
  })

  // 当filters改变时，重置并重新加载
  useEffect(() => {
    setPage(1)
    setEvents([])
    setHasMore(true)
    fetchEvents(1, true)
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
      fetchEvents(page + 1, false)
    }
  }

  const fetchEvents = async (pageNum = 1, reset = false) => {
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
      const response = await getEvents(params)
      const eventsData = response.data.events || response.data || []
      const totalPages = response.data.totalPages || 1
      
      // 确保events是数组
      const newEvents = Array.isArray(eventsData) ? eventsData : []
      
      if (reset) {
        setEvents(newEvents)
      } else {
        setEvents(prev => [...prev, ...newEvents])
      }
      
      setHasMore(pageNum < totalPages)
      setPage(pageNum)
      
      if (reset) {
        setLoading(false)
      } else {
        setLoadingMore(false)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
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

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
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
          <h1>Events & Exhibitions in Shanghai</h1>
          <p>Stay updated with the latest events, exhibitions, and activities</p>

          <div className="filters card" style={{ marginTop: '20px', marginBottom: '30px' }}>
            <h3>Filters</h3>
            <div className="filter-grid">
              <input
                type="text"
                name="search"
                placeholder="Search events..."
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
                <option value="exhibition">Exhibitions</option>
                <option value="concert">Concerts</option>
                <option value="festival">Festivals</option>
                <option value="workshop">Workshops</option>
                <option value="sports">Sports</option>
                <option value="food">Food</option>
                <option value="art">Art</option>
                <option value="music">Music</option>
                <option value="other">Other</option>
              </select>
              <select
                name="featured"
                value={filters.featured}
                onChange={handleFilterChange}
                className="input"
              >
                <option value="">All Events</option>
                <option value="true">Featured Only</option>
              </select>
            </div>
          </div>

          <div className="grid">
            {events.length > 0 ? (
              events.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className={`event-card card ${event.featured ? 'featured' : ''}`}>
                  {event.featured && <span className="featured-badge">⭐ Featured</span>}
                  
                  {(event.listImage || (event.images && Array.isArray(event.images) && event.images.length > 0)) && (
                    <div className="event-image">
                      <img 
                        src={event.listImage || (event.images && event.images[0])} 
                        alt={event.title}
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
                  
                  <div className="event-info">
                    <div className="event-date">
                      <span className="date-icon">📅</span>
                      {event.startDate ? (
                        <>
                          {formatDate(event.startDate)}
                          {event.endDate && event.startDate !== event.endDate && (
                            <span> - {formatDate(event.endDate)}</span>
                          )}
                        </>
                      ) : (
                        <span style={{ color: '#999' }}>Date TBA</span>
                      )}
                    </div>
                    
                    <h3>{event.title}</h3>
                    {event.titleCN && <p className="chinese-name">{event.titleCN}</p>}
                    
                    {/* 地点名称显示在标题下一行 */}
                    {event.venueName && event.venueName !== 'TBA' && event.venueName.trim() !== '' && (
                      <p className="event-venue-name" style={{ fontSize: '0.95em', color: '#666', marginTop: '4px', marginBottom: '8px' }}>
                        {event.venueName}
                      </p>
                    )}
                    
                    {/* 地址信息 */}
                    {event.venueAddress && (
                      <p className="event-address" style={{ fontSize: '0.9em', color: '#888', marginTop: '4px' }}>
                        📍 {event.venueAddress}
                      </p>
                    )}
                    
                    {event.description && (
                      <p className="event-description">
                        {event.description.length > 120 ? event.description.substring(0, 120) + '...' : event.description}
                      </p>
                    )}
                    
                    {event.category && (
                      <span className="event-category">{event.category}</span>
                    )}
                    
                    {event.price && (
                      <div className="event-price">
                        {event.price.note || `¥${event.price.amount || 'Free'}`}
                      </div>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p>No events found. Try adjusting your filters.</p>
            )}
          </div>
          
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading more events...
            </div>
          )}
          
          {!hasMore && events.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No more events to load
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Events
