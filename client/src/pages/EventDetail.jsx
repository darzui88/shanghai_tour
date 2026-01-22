import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvent } from '../services/api'
import './EventDetail.css'

const EventDetail = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await getEvent(id)
      const eventData = response.data.event || response.data
      // 确保venue是对象格式
      if (eventData.venue && typeof eventData.venue === 'string') {
        try {
          eventData.venue = JSON.parse(eventData.venue)
        } catch (e) {
          eventData.venue = { name: eventData.venue, address: '' }
        }
      }
      // 确保images是数组
      if (eventData.images && typeof eventData.images === 'string') {
        try {
          eventData.images = JSON.parse(eventData.images)
        } catch (e) {
          eventData.images = []
        }
      }
      // 解析openingHours
      if (eventData.openingHours && typeof eventData.openingHours === 'string') {
        try {
          eventData.openingHours = JSON.parse(eventData.openingHours)
        } catch (e) {
          eventData.openingHours = null
        }
      }
      setEvent(eventData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching event:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString // 如果无法解析，返回原始字符串
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch (e) {
      return dateString
    }
  }

  // 生成地图链接URL（支持PC、iPhone、Android）
  const getMapUrl = (venueAddress, city, district) => {
    // 组合地址：城市 + 区 + 具体地址
    // 如果城市为空，默认使用"上海"
    const defaultCity = city && city.trim() ? city.trim() : '上海';
    const addressParts = []
    
    // 确保城市总是包含在内（默认上海）
    addressParts.push(defaultCity)
    
    // 如果有区信息，添加区
    if (district && district.trim()) {
      addressParts.push(district.trim())
    }
    
    // 添加具体地址
    if (venueAddress && venueAddress.trim()) {
      addressParts.push(venueAddress.trim())
    }
    
    const fullAddress = addressParts.join(', ')
    
    if (!fullAddress.trim()) return null
    
    // 检测设备类型
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream
    const isAndroid = /android/i.test(userAgent)
    
    // URL编码地址
    const encodedAddress = encodeURIComponent(fullAddress)
    
    if (isIOS) {
      // iPhone: 优先使用Apple Maps，如果失败则使用Google Maps
      // Apple Maps URL格式
      return `https://maps.apple.com/?q=${encodedAddress}`
    } else if (isAndroid) {
      // Android: 使用Google Maps（会自动打开应用或浏览器）
      // 也可以使用geo: URI scheme，但Google Maps URL更通用
      return `https://maps.google.com/?q=${encodedAddress}`
    } else {
      // PC和其他设备: 使用Google Maps网页版
      return `https://maps.google.com/?q=${encodedAddress}`
    }
  }

  // 处理地址点击事件
  const handleAddressClick = () => {
    const mapUrl = getMapUrl(event.venueAddress, event.city, event.district)
    if (mapUrl) {
      window.open(mapUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // 获取当前是星期几（小写，匹配数据库格式：monday, tuesday, etc.）
  const getCurrentDay = () => {
    const today = new Date()
    const dayIndex = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[dayIndex]
  }

  // 判断是否是当前日期
  const isCurrentDay = (day) => {
    return day.toLowerCase() === getCurrentDay()
  }

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Event not found</h2>
          <Link to="/events" className="btn btn-primary">Back to Events</Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container">
        <Link to="/events" className="back-link">← Back to Events</Link>
        
        <div className="event-detail">
          {event.featured && (
            <span className="featured-badge-large">⭐ Featured Event</span>
          )}

          <div className="event-header">
            <h1>{event.title}</h1>
            {event.titleCN && <p className="chinese-name">{event.titleCN}</p>}
            {/* 地点名称显示在标题下一行 */}
            {event.venueName && event.venueName !== 'TBA' && event.venueName.trim() !== '' && (
              <p className="event-venue-name" style={{ fontSize: '1.1em', color: '#666', marginTop: '8px', marginBottom: '12px' }}>
                {event.venueName}
              </p>
            )}
            {event.category && (
              <span className="event-category-large">{event.category}</span>
            )}
          </div>

          {(event.listImage || (event.images && Array.isArray(event.images) && event.images.length > 0)) && (
            <div className="event-images">
              <img 
                src={event.listImage || (event.images && event.images[0])} 
                alt={event.title}
                onError={(e) => {
                  e.target.style.display = 'none'
                  const placeholder = document.createElement('div')
                  placeholder.style.cssText = 'width:100%;height:400px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#666;font-size:18px;border-radius:8px'
                  placeholder.textContent = 'Image not available'
                  e.target.parentNode.appendChild(placeholder)
                }}
              />
            </div>
          )}

          <div className="event-info-grid">
            <div className="event-main-info card">
                <div className="info-section">
                  <h3>📅 Date & Time</h3>
                  {event.startDate && (
                    <p><strong>Start:</strong> {formatDate(event.startDate)}</p>
                  )}
                  {event.startTime && <p>Time: {event.startTime}</p>}
                  {event.endDate && event.endDate !== event.startDate && (
                    <>
                      <p><strong>End:</strong> {formatDate(event.endDate)}</p>
                      {event.endTime && <p>Time: {event.endTime}</p>}
                    </>
                  )}
                  {!event.startDate && !event.endDate && (
                    <p style={{ color: '#999' }}>Date TBA</p>
                  )}
                </div>

              {/* Opening Hours */}
              {event.openingHours && typeof event.openingHours === 'object' && (
                <div className="info-section">
                  <h3>🕐 Opening Hours</h3>
                  <div className="opening-hours">
                    {event.openingHours.note ? (
                      // 如果是note格式，直接显示
                      <p>{event.openingHours.note}</p>
                    ) : (
                      // 如果是按天分别的格式，显示每一天
                      Object.entries(event.openingHours)
                        .sort(([dayA], [dayB]) => {
                          const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                          return order.indexOf(dayA) - order.indexOf(dayB);
                        })
                        .map(([day, hours]) => hours && hours.trim() ? (
                          <div 
                            key={day} 
                            className={`hours-row ${isCurrentDay(day) ? 'current-day' : ''}`}
                          >
                            <span className="day">
                              {day.charAt(0).toUpperCase() + day.slice(1)}:
                              {isCurrentDay(day) && <span className="today-badge">Today</span>}
                            </span>
                            <span>{hours || 'Closed'}</span>
                          </div>
                        ) : null)
                        .filter(item => item !== null)
                    )}
                  </div>
                </div>
              )}

              {/* Address信息单独显示，可点击打开地图 */}
              {event.venueAddress && (
                <div className="info-section">
                  <h3>📍 Address</h3>
                  <p 
                    className="address-link"
                    onClick={handleAddressClick}
                  >
                    {event.venueAddress}
                  </p>
                  <p className="address-hint">
                    Click to open in map
                  </p>
                </div>
              )}

              {event.price && (
                <div className="info-section">
                  <h3>💰 Price</h3>
                  <p className="event-price-large">
                    {event.price.note || 
                     (event.price.amount ? `¥${event.price.amount}` : 'Free')}
                  </p>
                </div>
              )}

              {event.contact && (
                <div className="info-section">
                  <h3>📞 Contact</h3>
                  {event.contact.phone && <p><strong>Phone:</strong> {event.contact.phone}</p>}
                  {event.contact.email && <p><strong>Email:</strong> {event.contact.email}</p>}
                  {event.contact.website && (
                    <p>
                      <strong>Website:</strong>{' '}
                      <a href={event.contact.website} target="_blank" rel="noopener noreferrer">
                        {event.contact.website}
                      </a>
                    </p>
                  )}
                </div>
              )}

              {event.source && event.source.url && (
                <div className="info-section">
                  <p className="source-info">
                    Source: <a href={event.source.url} target="_blank" rel="noopener noreferrer">
                      {event.source.platform || 'External'}
                    </a>
                  </p>
                </div>
              )}
            </div>

            <div className="event-description-section card">
              <h3>Description</h3>
              {event.description ? (
                <p>{event.description}</p>
              ) : (
                <p>No description available.</p>
              )}
              {event.descriptionCN && (
                <p className="chinese-text">{event.descriptionCN}</p>
              )}

              {event.tags && Array.isArray(event.tags) && event.tags.length > 0 && (
                <div className="tags-section" style={{ marginTop: '20px' }}>
                  <h4>Tags</h4>
                  <div className="tags">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {event.language && Array.isArray(event.language) && event.language.length > 0 && (
                <div className="language-section" style={{ marginTop: '20px' }}>
                  <h4>Languages</h4>
                  <p>{event.language.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default EventDetail
