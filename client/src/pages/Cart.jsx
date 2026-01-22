import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProduct } from '../services/api'
import './Cart.css'

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const itemsWithDetails = await Promise.all(
        cart.map(async (item) => {
          try {
            const response = await getProduct(item.product)
            return {
              ...item,
              productDetails: response.data
            }
          } catch (error) {
            console.error(`Error loading product ${item.product}:`, error)
            return item
          }
        })
      )
      setCartItems(itemsWithDetails)
      setLoading(false)
    } catch (error) {
      console.error('Error loading cart:', error)
      setLoading(false)
    }
  }

  const updateQuantity = (productId, variantName, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId, variantName)
      return
    }

    const updatedCart = cartItems.map(item => {
      const matchesProduct = item.product === productId
      const matchesVariant = variantName 
        ? (item.variantName === variantName)
        : (!item.variantName)
      
      return (matchesProduct && matchesVariant)
        ? { ...item, quantity: newQuantity }
        : item
    })

    updateCart(updatedCart)
  }

  const removeItem = (productId, variantName) => {
    const updatedCart = cartItems.filter(item => {
      const matchesProduct = item.product === productId
      const matchesVariant = variantName 
        ? (item.variantName === variantName)
        : (!item.variantName)
      return !(matchesProduct && matchesVariant)
    })
    updateCart(updatedCart)
  }

  const updateCart = (updatedCart) => {
    const cartToSave = updatedCart.map(({ productDetails, ...item }) => item)
    localStorage.setItem('cart', JSON.stringify(cartToSave))
    setCartItems(updatedCart)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // 如果有规格，使用规格价格，否则使用商品价格
      const productPrice = item.variant?.price || item.price || item.productDetails?.price || 0
      return total + (productPrice * item.quantity)
    }, 0)
  }

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>Your cart is empty</h2>
          <p style={{ margin: '20px 0' }}>Start shopping to add items to your cart!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <div className="container">
        <section>
          <h1>Shopping Cart</h1>

          <div className="cart-container">
            <div className="cart-items">
              {cartItems.map((item, index) => {
                const product = item.productDetails
                // 如果有规格，使用规格价格，否则使用商品价格，并确保为数字
                const price = parseFloat(item.variant?.price ?? item.price ?? product?.price ?? 0) || 0
                const total = price * item.quantity
                // 使用索引和规格名称作为唯一key
                const itemKey = item.variantName ? `${item.product}_${item.variantName}_${index}` : `${item.product}_${index}`

                return (
                  <div key={itemKey} className="cart-item card">
                    <div className="cart-item-image">
                      <img 
                        src={item.image || (product?.images?.[0]?.url || product?.images?.[0]) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'} 
                        alt={item.name || product?.name}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          const placeholder = document.createElement('div')
                          placeholder.style.cssText = 'width:100px;height:100px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#666;font-size:12px;border-radius:4px'
                          placeholder.textContent = 'No Image'
                          e.target.parentNode.appendChild(placeholder)
                        }}
                      />
                    </div>

                    <div className="cart-item-info">
                      <h3>
                        <Link to={`/products/${item.product}`}>
                          {item.name || product?.name || 'Product'}
                        </Link>
                      </h3>
                      {item.variantName && (
                        <p className="cart-item-variant">Variant: {item.variantName}</p>
                      )}
                      <p className="cart-item-price">¥{price.toFixed(2)} each</p>
                    </div>

                    <div className="cart-item-quantity">
                      <button 
                        onClick={() => updateQuantity(item.product, item.variantName, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product, item.variantName, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-total">
                      <strong>¥{total.toFixed(2)}</strong>
                    </div>

                    <button 
                      onClick={() => removeItem(item.product, item.variantName)}
                      className="remove-btn"
                      aria-label="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="cart-summary card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>¥{calculateTotal().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>¥{calculateTotal().toFixed(2)}</span>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '20px' }}
              >
                Proceed to Checkout
              </button>

              <Link 
                to="/products" 
                className="continue-shopping"
                style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Cart
