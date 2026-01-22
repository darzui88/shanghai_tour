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
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await getProduct(id)
        
        // 检查组件是否仍然挂载
        if (!isMounted) return
        
        const productData = response.data
        setProduct(productData)
        
        // 如果有规格，默认选择第一个有库存的规格
        if (productData.variants && productData.variants.length > 0) {
          const firstAvailableVariant = productData.variants.find(v => v.stock > 0) || productData.variants[0]
          setSelectedVariant(firstAvailableVariant)
        }
        
        setLoading(false)
      } catch (error) {
        // 检查组件是否仍然挂载
        if (!isMounted) return
        
        console.error('Error fetching product:', error)
        setLoading(false)
        // 可以设置错误状态，但这里我们保持简单，只记录错误
      }
    }
    
    fetchProduct()
    
    // 清理函数：组件卸载时设置标志
    return () => {
      isMounted = false
    }
  }, [id])

  const addToCart = () => {
    // 检查是否有规格且已选择
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      alert('Please select a variant')
      return
    }

    // 检查库存
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock
    if (quantity > currentStock) {
      alert(`Only ${currentStock} items available in stock`)
      return
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    
    // 构建购物车项的唯一标识（包含规格信息）
    const cartItemKey = selectedVariant 
      ? `${id}_${selectedVariant.name}` 
      : id
    
    const existingItem = cart.find(item => {
      if (selectedVariant) {
        return item.product === id && item.variantName === selectedVariant.name
      } else {
        return item.product === id && !item.variantName
      }
    })

    const itemPrice = selectedVariant ? selectedVariant.price : product.price
    const itemImage = selectedVariant?.image 
      ? selectedVariant.image 
      : (product.images?.[0]?.url || product.images?.[0] || product.coverImage)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({
        product: id,
        variantName: selectedVariant?.name,
        variant: selectedVariant,
        quantity,
        price: itemPrice,
        name: product.name,
        image: itemImage
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

  // 获取当前价格（如果有规格则使用规格价格，否则使用商品价格）
  const currentPrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(product.price)
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const displayImage = selectedVariant?.image 
    ? selectedVariant.image 
    : (product.coverImage || (product.images?.[0]?.url || product.images?.[0]))

  const totalPrice = (currentPrice * quantity) + 
    (shippingMethod === 'express' ? (parseFloat(product.expressDeliveryFee) || 0) : 0)

  return (
    <main>
      <div className="container">
        <Link to="/products" className="back-link">← Back to Products</Link>
        
        <div className="product-detail">
          <div className="product-images">
            {displayImage ? (
              <img 
                src={displayImage} 
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
              <span className="price">¥{currentPrice.toFixed(2)}</span>
              {product.originalPrice && parseFloat(product.originalPrice) > currentPrice && (
                <span className="original-price">¥{parseFloat(product.originalPrice).toFixed(2)}</span>
              )}
            </div>

            {/* 规格选择 */}
            {product.variants && product.variants.length > 0 && (
              <div className="variant-selector">
                <label>Select Variant:</label>
                <div className="variants-grid">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`variant-option ${selectedVariant?.name === variant.name ? 'selected' : ''} ${variant.stock <= 0 ? 'out-of-stock' : ''}`}
                      onClick={() => {
                        if (variant.stock > 0) {
                          setSelectedVariant(variant)
                          setQuantity(1) // 切换规格时重置数量
                        }
                      }}
                      disabled={variant.stock <= 0}
                    >
                      {variant.image && (
                        <img src={variant.image} alt={variant.name} className="variant-image" />
                      )}
                      <div className="variant-info">
                        <span className="variant-name">{variant.name}</span>
                        <span className="variant-price">¥{parseFloat(variant.price).toFixed(2)}</span>
                        <span className={`variant-stock ${variant.stock <= 0 ? 'stock-zero' : ''}`}>
                          {variant.stock > 0 ? `Stock: ${variant.stock}` : 'Out of Stock'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 库存显示 */}
            <div className="stock-info">
              <span className={currentStock > 0 ? 'in-stock' : 'out-of-stock'}>
                {currentStock > 0 ? `In Stock (${currentStock} available)` : 'Out of Stock'}
              </span>
            </div>

            <div className="description">
              <h3>Description</h3>
              <div 
                className="description-content"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
              {product.descriptionCN && (
                <div 
                  className="chinese-description description-content"
                  dangerouslySetInnerHTML={{ __html: product.descriptionCN }}
                />
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
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="quantity-btn"
                    disabled={quantity >= currentStock}
                  >
                    +
                  </button>
                </div>
                {currentStock > 0 && (
                  <p className="quantity-hint">Max: {currentStock}</p>
                )}
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
                disabled={!product.isAvailable || currentStock <= 0 || (product.variants && product.variants.length > 0 && !selectedVariant)}
              >
                {!product.isAvailable || currentStock <= 0 
                  ? 'Out of Stock' 
                  : (product.variants && product.variants.length > 0 && !selectedVariant)
                    ? 'Please Select Variant'
                    : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProductDetail
