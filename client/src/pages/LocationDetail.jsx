import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLocation } from '../services/api'
import './LocationDetail.css'

const LocationDetail = () => {
  const { id } = useParams()
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocation()
  }, [id])

  const fetchLocation = async () => {
    try {
      setLoading(true)
      const response = await getLocation(id)
      
      // 解析JSON字段（如果从MySQL返回的是字符串）
      const locationData = response.data;
      const parsedLocation = {
        ...locationData,
        // 确保rating是数字类型
        rating: locationData.rating ? Number(locationData.rating) : 0,
        categories: typeof locationData.categories === 'string' ? (locationData.categories ? JSON.parse(locationData.categories) : []) : (Array.isArray(locationData.categories) ? locationData.categories : []),
        images: typeof locationData.images === 'string' ? (locationData.images ? JSON.parse(locationData.images) : []) : (Array.isArray(locationData.images) ? locationData.images : []),
        products: typeof locationData.products === 'string' ? (locationData.products ? JSON.parse(locationData.products) : []) : (Array.isArray(locationData.products) ? locationData.products : []),
        openingHours: typeof locationData.openingHours === 'string' ? (locationData.openingHours ? JSON.parse(locationData.openingHours) : null) : locationData.openingHours,
        transport: typeof locationData.transport === 'string' ? (locationData.transport ? JSON.parse(locationData.transport) : null) : locationData.transport,
        tips: typeof locationData.tips === 'string' ? (locationData.tips ? JSON.parse(locationData.tips) : []) : (Array.isArray(locationData.tips) ? locationData.tips : []),
        coordinates: typeof locationData.coordinates === 'string' ? (locationData.coordinates ? JSON.parse(locationData.coordinates) : null) : locationData.coordinates
      };
      
      setLocation(parsedLocation)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching location:', error)
      setLoading(false)
    }
  }

  // 生成地图链接URL（支持PC、iPhone、Android）
  const getMapUrl = () => {
    if (!location || !location.address) return null;

    // 组合地址：城市 + 区 + 具体地址
    // 如果城市为空，默认使用"上海"
    const city = location.city || '上海';
    const district = location.district || '';
    const address = location.address || '';
    
    const addressParts = []
    // 确保城市总是包含在内（默认上海）
    addressParts.push(city)
    // 如果有区信息，添加区
    if (district && district.trim()) {
      addressParts.push(district.trim())
    }
    // 添加具体地址
    if (address && address.trim()) {
      addressParts.push(address.trim())
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
      // iPhone: 优先使用Apple Maps
      return `https://maps.apple.com/?q=${encodedAddress}`
    } else if (isAndroid) {
      // Android: 使用Google Maps
      return `https://maps.google.com/?q=${encodedAddress}`
    } else {
      // PC和其他设备: 使用Google Maps网页版
      return `https://maps.google.com/?q=${encodedAddress}`
    }
  }

  // 处理地址点击事件
  const handleAddressClick = (e) => {
    e.preventDefault()
    const mapUrl = getMapUrl()
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

  if (!location) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Location not found</h2>
          <Link to="/locations" className="btn btn-primary">Back to Locations</Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container">
        <Link to="/locations" className="back-link">← Back to Locations</Link>
        
        <div className="location-detail">
          <div className="location-header">
            <h1>{location.name}</h1>
            {location.nameCN && <p className="chinese-name">{location.nameCN}</p>}
            {location.rating && Number(location.rating) > 0 && (
              <div className="rating">
                {'⭐'.repeat(Math.floor(Number(location.rating)))} {Number(location.rating).toFixed(1)}
              </div>
            )}
          </div>

          {location.images && Array.isArray(location.images) && location.images.length > 0 && (
            <div className="location-images">
              <img 
                src={location.images[0]} 
                alt={location.name}
                onError={(e) => {
                  // 如果图片加载失败，使用data URI作为备用方案
                  e.target.style.display = 'none'
                  const placeholder = document.createElement('div')
                  placeholder.style.cssText = 'width:100%;height:400px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#666;font-size:18px'
                  placeholder.textContent = 'Image not available'
                  e.target.parentNode.appendChild(placeholder)
                }}
              />
            </div>
          )}

          <div className="location-info card">
            <div className="info-section">
              <h3>📍 Address</h3>
              <a 
                href="#" 
                onClick={handleAddressClick} 
                className="address-link"
              >
                {location.address}
              </a>
              <p className="address-hint">
                点击打开地图
              </p>
              {location.addressCN && <p className="chinese-text">{location.addressCN}</p>}
              <p><strong>District:</strong> {location.district}</p>
              
              {location.phone && (
                <p><strong>Phone:</strong> {location.phone}</p>
              )}
              
              {location.website && (
                <p><strong>Website:</strong> <a href={location.website} target="_blank" rel="noopener noreferrer">{location.website}</a></p>
              )}
            </div>

            {location.coordinates && typeof location.coordinates === 'object' && location.coordinates.latitude && location.coordinates.longitude && (
              <div className="info-section">
                <h3>🗺️ Map</h3>
                <p>Coordinates: {location.coordinates.latitude}, {location.coordinates.longitude}</p>
                <a 
                  href={`https://maps.google.com/?q=${location.coordinates.latitude},${location.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Open in Google Maps
                </a>
              </div>
            )}

            {location.transport && typeof location.transport === 'object' && (
              <div className="info-section">
                <h3>🚇 Transportation</h3>
                {location.transport.metro && Array.isArray(location.transport.metro) && location.transport.metro.length > 0 && (
                  <p><strong>Metro:</strong> {location.transport.metro.join(', ')}</p>
                )}
                {location.transport.bus && Array.isArray(location.transport.bus) && location.transport.bus.length > 0 && (
                  <p><strong>Bus:</strong> {location.transport.bus.join(', ')}</p>
                )}
                {location.transport.parking && (
                  <p><strong>Parking:</strong> Available</p>
                )}
              </div>
            )}

            {location.openingHours && typeof location.openingHours === 'object' && (
              <div className="info-section">
                <h3>🕐 Opening Hours</h3>
                <div className="opening-hours">
                  {location.openingHours.note ? (
                    // 如果是note格式，直接显示
                    <p>{location.openingHours.note}</p>
                  ) : (
                    // 如果是按天分别的格式，显示每一天
                    Object.entries(location.openingHours)
                      .sort(([dayA], [dayB]) => {
                        const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        return order.indexOf(dayA) - order.indexOf(dayB);
                      })
                      .map(([day, hours]) => (
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
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="description-section card">
            <h3>Description</h3>
            <p>{location.description}</p>
            {location.descriptionCN && (
              <p className="chinese-text">{location.descriptionCN}</p>
            )}
          </div>

          {location.products && Array.isArray(location.products) && location.products.length > 0 && (
            <div className="products-section card">
              <h3>Available Products</h3>
              <div className="products-list">
                {location.products.map((product, index) => (
                  <div key={index} className="product-item">
                    {product.type && <h4>{product.type}</h4>}
                    {product.description && <p>{product.description}</p>}
                    {product.priceRange && typeof product.priceRange === 'object' && (
                      <p className="price-range">
                        Price: ¥{product.priceRange.min || 0} - ¥{product.priceRange.max || 'N/A'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {location.categories && Array.isArray(location.categories) && location.categories.length > 0 && (
            <div className="categories-section">
              <h3>Categories</h3>
              <div className="categories">
                {location.categories.map((cat, index) => (
                  <span key={index} className="category-tag">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {location.tips && Array.isArray(location.tips) && location.tips.length > 0 && (
            <div className="tips-section card">
              <h3>💡 Tips</h3>
              <ul>
                {location.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default LocationDetail
