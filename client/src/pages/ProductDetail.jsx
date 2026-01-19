import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getProduct } from '../services/api'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [shippingMethod, setShippingMethod] = useState('standard')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await getProduct(id)
      setProduct(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching product:', error)
      setLoading(false)
    }
  }

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find(item => item.product === id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        product: id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.images?.[0]?.url || product.images?.[0]
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Added to cart!')
    navigate('/cart')
  }

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Product not found</h2>
          <Link to="/products" className="btn btn-primary">Back to Products</Link>
        </div>
      </main>
    )
  }

  const totalPrice = (parseFloat(product.price) * quantity) + 
    (shippingMethod === 'express' ? (parseFloat(product.expressDeliveryFee) || 0) : 0)

  return (
    <main>
      <div className="container">
        <Link to="/products" className="back-link">← Back to Products</Link>
        
        <div className="product-detail">
          <div className="product-images">
            {product.images && product.images.length > 0 ? (
              <img 
                src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || product.images[0])} 
                alt={product.name}
                onError={(e) => {
                  e.target.style.display = 'none'
                  const placeholder = document.createElement('div')
                  placeholder.style.cssText = 'width:100%;height:500px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#666;font-size:18px;border-radius:8px'
                  placeholder.textContent = 'Image not available'
                  e.target.parentNode.appendChild(placeholder)
                }}
              />
            ) : (
              <div className="placeholder-image">No Image</div>
            )}
          </div>

          <div className="product-details">
            <h1>{product.name}</h1>
            {product.nameCN && <p className="chinese-name">{product.nameCN}</p>}
            
            <div className="price-section">
              <span className="price">¥{parseFloat(product.price).toFixed(2)}</span>
              {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
                <span className="original-price">¥{parseFloat(product.originalPrice).toFixed(2)}</span>
              )}
            </div>

            <div className="description">
              <h3>Description</h3>
              <p>{product.description}</p>
              {product.descriptionCN && (
                <p className="chinese-description">{product.descriptionCN}</p>
              )}
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="purchase-section card">
              <h3>Order Information</h3>
              
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              {product.expressDeliveryAvailable && (
                <div className="shipping-selector">
                  <label>Shipping Method:</label>
                  <select 
                    value={shippingMethod} 
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="input"
                  >
                    <option value="standard">Standard (Free)</option>
                    <option value="express">Express Delivery (¥{parseFloat(product.expressDeliveryFee || 0).toFixed(2)})</option>
                  </select>
                </div>
              )}

              <div className="total-price">
                <strong>Total: ¥{totalPrice.toFixed(2)}</strong>
              </div>

              <button 
                onClick={addToCart} 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px' }}
                disabled={!product.isAvailable}
              >
                {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <p className="note">
                💡 We'll order this item from {product.taobaoUrl ? 'Taobao' : ''}
                {product.taobaoUrl && product.pinduoduoUrl ? ' or ' : ''}
                {product.pinduoduoUrl ? 'Pinduoduo' : ''} for you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProductDetail
