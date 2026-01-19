import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder, getProduct } from '../services/api'
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
  }, [])

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
      const orderData = {
        user: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        },
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity
        })),
        shipping: {
          method: formData.shippingMethod,
          fee: formData.shippingMethod === 'express' ? formData.expressFee : 0,
          address: formData.address,
          recipient: formData.recipient || formData.name,
          phone: formData.phone
        }
      }

      const response = await createOrder(orderData)
      
      // Clear cart
      localStorage.removeItem('cart')
      
      // Show success message
      alert(`Order placed successfully! Order number: ${response.data.orderNumber}`)
      
      // Navigate to home or order confirmation page
      navigate('/')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to place order. Please try again.')
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
