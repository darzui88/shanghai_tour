import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getGuide } from '../services/api'
import './GuideDetail.css'

const GuideDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [guide, setGuide] = useState(null)
  const [loading, setLoading] = useState(true)
  const contentRef = useRef(null)

  useEffect(() => {
    fetchGuide()
  }, [id])

  // 处理内容中的链接点击和图片错误
  useEffect(() => {
    if (guide && contentRef.current) {
      // 处理链接点击
      const links = contentRef.current.querySelectorAll('a')
      links.forEach(link => {
        const href = link.getAttribute('href')
        if (href) {
          // 检查是否是内部链接（以/开头的相对路径，且不是外部域名）
          if (href.startsWith('/') && !href.startsWith('//')) {
            link.addEventListener('click', (e) => {
              e.preventDefault()
              // 使用React Router导航
              navigate(href)
            })
          } else if (href.startsWith('http://') || href.startsWith('https://')) {
            // 外部链接，确保在新标签页打开
            link.setAttribute('target', '_blank')
            link.setAttribute('rel', 'noopener noreferrer')
          }
        }
      })

      // 处理图片加载错误（包括via.placeholder.com等占位符）
      const images = contentRef.current.querySelectorAll('img')
      images.forEach(img => {
        const src = img.getAttribute('src') || img.getAttribute('data-src')
        
        // 如果是via.placeholder.com或其他占位符服务，直接替换为占位符div
        if (src && (src.includes('via.placeholder.com') || 
                    src.includes('placeholder') || 
                    src.includes('placehold.it'))) {
          const placeholder = document.createElement('div')
          placeholder.style.cssText = 'width:100%;height:300px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px;border-radius:8px;margin:10px 0'
          placeholder.textContent = 'Image not available'
          img.parentNode?.replaceChild(placeholder, img)
          return
        }

        // 添加图片加载错误处理
        img.addEventListener('error', (e) => {
          e.target.style.display = 'none'
          // 如果图片加载失败，创建一个占位符
          const placeholder = document.createElement('div')
          placeholder.style.cssText = 'width:100%;height:300px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;font-size:14px;border-radius:8px;margin:10px 0'
          placeholder.textContent = 'Image not available'
          e.target.parentNode?.appendChild(placeholder)
        })
      })
    }
  }, [guide, navigate])

  const fetchGuide = async () => {
    try {
      setLoading(true)
      const response = await getGuide(id)
      setGuide(response.data.guide || response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching guide:', error)
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    )
  }

  if (!guide) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Guide not found</h2>
          <Link to="/guides" className="btn btn-primary">Back to Guides</Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container">
        <Link to="/guides" className="back-link">← Back to Guides</Link>
        
        <article className="guide-detail">
          {guide.isPinned && (
            <span className="pinned-badge-large">📌 Pinned</span>
          )}

          <header className="guide-header">
            <h1>{guide.title}</h1>
            {guide.titleCN && <p className="chinese-name">{guide.titleCN}</p>}
            <div className="guide-meta-header">
              <span className="category-badge-large">{guide.category}</span>
              {guide.viewCount > 0 && (
                <span className="view-count-large">👁️ {guide.viewCount} views</span>
              )}
            </div>
            {guide.tags && Array.isArray(guide.tags) && guide.tags.length > 0 && (
              <div className="tags">
                {guide.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </header>

          {guide.coverImage && (
            <div className="guide-cover-image">
              <img 
                src={guide.coverImage} 
                alt={guide.title}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}

          {guide.summary && (
            <div className="guide-summary-section">
              <p className="summary-text">{guide.summary}</p>
            </div>
          )}

          <div 
            ref={contentRef}
            className="guide-content"
            dangerouslySetInnerHTML={{ __html: guide.content }}
          />
        </article>
      </div>
    </main>
  )
}

export default GuideDetail
