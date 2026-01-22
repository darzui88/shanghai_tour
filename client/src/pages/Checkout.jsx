import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, getProduct, getUserInfo } from '../services/api'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    recipient: '',
    shippingMethod: 'standard',
    expressFee: 0
  })

  useEffect(() => {
    loadCart()
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    const token = localStorage.getItem('userToken')
    if (token) {
      try {
        const response = await getUserInfo()
        if (response.data.success && response.data.user) {
          const user = response.data.user
          // 如果有默认地址，自动填充
          const defaultAddress = user.addresses && user.addresses.length > 0
            ? user.addresses[user.defaultAddressIndex || 0]
            : null
          
          if (defaultAddress) {
            setFormData(prev => ({
              ...prev,
              name: user.name || defaultAddress.name || '',
              email: user.email || '',
              phone: user.phone || defaultAddress.phone || '',
              address: defaultAddress.address || '',
              recipient: defaultAddress.name || user.name || ''
            }))
          } else {
            // 使用用户基本信息
            setFormData(prev => ({
              ...prev,
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || ''
            }))
          }
        }
      } catch (error) {
        // 忽略错误，继续作为游客
      }
    }
  }

  const loadCart = async () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      if (cart.length === 0) {
        navigate('/cart')
        return
      }

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
      
      // Check if any product has express delivery
      const hasExpress = itemsWithDetails.some(
        item => item.productDetails?.expressDeliveryAvailable
      )
      if (hasExpress) {
        const expressFee = itemsWithDetails[0]?.productDetails?.expressDeliveryFee || 0
        setFormData(prev => ({ ...prev, expressFee }))
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading cart:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const productPrice = item.productDetails?.price || item.price || 0
      return total + (productPrice * item.quantity)
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shipping = formData.shippingMethod === 'express' ? formData.expressFee : 0
    return subtotal + shipping
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.address) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)

    try {
      // Validate cart items before submitting
      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty. Please add items to your cart first.')
        setSubmitting(false)
        navigate('/cart')
        return
      }

      // Filter out items that failed to load
      const validItems = cartItems.filter(item => {
        if (!item.product) {
          console.warn('Item missing product ID:', item)
          return false
        }
        if (!item.quantity || item.quantity < 1) {
          console.warn('Item has invalid quantity:', item)
          return false
        }
        return true
      })

      if (validItems.length === 0) {
        alert('No valid items in cart. Please add items to your cart.')
        setSubmitting(false)
        navigate('/cart')
        return
      }

      const orderData = {
        user: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim()
        },
        items: validItems.map(item => ({
          product: parseInt(item.product) || item.product, // Ensure it's a number if possible
          quantity: parseInt(item.quantity) || 1,
          variantName: item.variantName || item.variant?.name,
          variantPrice: item.variant?.price || item.price || undefined,
          variantImage: item.variant?.image || undefined
        })),
        shipping: {
          method: formData.shippingMethod,
          fee: formData.shippingMethod === 'express' ? parseFloat(formData.expressFee) || 0 : 0,
          address: formData.address.trim(),
          recipient: (formData.recipient || formData.name).trim(),
          phone: formData.phone.trim() || undefined
        }
      }

      console.log('Submitting order:', orderData)
      const token = localStorage.getItem('userToken')
      console.log('User token:', token ? 'Present' : 'Not present')
      
      const response = await createOrder(orderData)
      console.log('Order created:', response.data)
      
      // Clear cart
      localStorage.removeItem('cart')
      
      // Show success message
      alert(`Order placed successfully! Order number: ${response.data.orderNumber}`)
      
      // Navigate to payment page
      if (response.data.id) {
        navigate(`/pay/${response.data.id}`)
      } else if (token) {
        navigate('/profile?tab=orders')
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to place order. Please try again.'
      console.error('Error details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      })
      alert(`Failed to place order: ${errorMessage}`)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      </main>
    )
  }

  const hasExpressDelivery = cartItems.some(
    item => item.productDetails?.expressDeliveryAvailable
  )

  return (
    <main>
      <div className="container">
        <section>
          <h1>Checkout</h1>

          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-grid">
              <div className="checkout-form-section card">
                <h2>Shipping Information</h2>
                
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Shipping Address *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recipient">Recipient Name (if different)</label>
                  <input
                    type="text"
                    id="recipient"
                    name="recipient"
                    value={formData.recipient}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                {hasExpressDelivery && (
                  <div className="form-group">
                    <label htmlFor="shippingMethod">Shipping Method</label>
                    <select
                      id="shippingMethod"
                      name="shippingMethod"
                      value={formData.shippingMethod}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="standard">Standard (Free)</option>
                      <option value="express">Express Delivery (¥{formData.expressFee})</option>
                    </select>
                  </div>
                )}

                <div className="form-note">
                  <p>💡 We'll order these items from Taobao/Pinduoduo for you and have them shipped to your address.</p>
                </div>
              </div>

              <div className="checkout-summary card">
                <h2>Order Summary</h2>

                <div className="order-items">
                  {cartItems.map((item) => {
                    const product = item.productDetails
                    const price = product?.price || item.price || 0
                    const total = price * item.quantity

                    return (
                      <div key={item.product} className="order-item">
                        <div className="order-item-info">
                          <span className="order-item-name">
                            {item.name || product?.name || 'Product'}
                          </span>
                          <span className="order-item-quantity">x{item.quantity}</span>
                        </div>
                        <span className="order-item-price">¥{total.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>¥{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>
                      {formData.shippingMethod === 'express' 
                        ? `¥${formData.expressFee.toFixed(2)}` 
                        : 'Free'}
                    </span>
                  </div>

                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>¥{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '20px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Checkout
