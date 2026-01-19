import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadImages,
  adminDeleteImage
} from '../../services/api';
import './Manage.css';

const ProductsManage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    nameCN: '',
    description: '',
    descriptionCN: '',
    category: 'souvenir',
    price: 0,
    images: [],
    coverImage: '',
    isAvailable: true
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 实际用于搜索的关键词

  useEffect(() => {
    fetchProducts();
  }, [currentPage, activeSearchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 50,
        all: 'true' // 管理员可以查看所有商品
      };
      if (activeSearchTerm.trim()) {
        params.search = activeSearchTerm.trim();
      }
      const response = await adminGetProducts(params);
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(1); // 搜索时重置到第一页
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let productId;
      if (editingProduct) {
        const response = await adminUpdateProduct(editingProduct.id, formData);
        productId = editingProduct.id;
        alert('商品更新成功');
      } else {
        const response = await adminCreateProduct(formData);
        productId = response.data.id || response.data.product?.id;
        if (productId) {
          setEditingProduct({ id: productId });
        }
        alert('商品创建成功，现在可以上传图片了');
      }
      
      // 如果产品ID存在且有选中的文件，自动上传
      if (productId && selectedFiles.length > 0) {
        await handleUploadImages();
      }
      
      // 只有在编辑模式下才关闭表单，新创建时保持打开以便上传图片
      if (editingProduct) {
        setShowForm(false);
        setEditingProduct(null);
        resetForm();
      }
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个商品吗？')) return;
    
    try {
      await adminDeleteProduct(id);
      alert('删除成功');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('删除失败');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const parsedImages = Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? JSON.parse(product.images || '[]') : []);
    setFormData({
      name: product.name || '',
      nameCN: product.nameCN || '',
      description: product.description || '',
      descriptionCN: product.descriptionCN || '',
      category: product.category || 'souvenir',
      price: product.price || 0,
      images: parsedImages,
      coverImage: product.coverImage || (parsedImages.length > 0 ? parsedImages[0] : ''),
      isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
    });
    setShowForm(true);
    setSelectedFiles([]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameCN: '',
      description: '',
      descriptionCN: '',
      category: 'souvenir',
      price: 0,
      images: [],
      coverImage: '',
      isAvailable: true
    });
    setSelectedFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 20) {
      alert('最多只能上传20张图片');
      return;
    }
    setSelectedFiles(files);
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      alert('请先选择要上传的图片');
      return;
    }

    const productId = editingProduct?.id;
    if (!productId) {
      alert('请先保存商品，然后再上传图片');
      return;
    }

    try {
      setUploadingImages(true);
      const response = await adminUploadImages('products', productId, selectedFiles);
      
      const newImages = response.data.files.map(f => f.url);
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages],
        coverImage: formData.coverImage || newImages[0]
      });
      
      setSelectedFiles([]);
      alert(`成功上传 ${newImages.length} 张图片`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || '上传失败');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageUrl) => {
    if (!window.confirm('确定要删除这张图片吗？')) return;

    try {
      // 从列表中移除
      const updatedImages = formData.images.filter(img => img !== imageUrl);
      const updatedCoverImage = formData.coverImage === imageUrl ? (updatedImages[0] || '') : formData.coverImage;
      
      setFormData({
        ...formData,
        images: updatedImages,
        coverImage: updatedCoverImage
      });

      // 如果有编辑中的商品ID，尝试从服务器删除文件
      if (editingProduct?.id) {
        try {
          const filepath = imageUrl.split('/uploads/')[1];
          if (filepath) {
            await adminDeleteImage('products', editingProduct.id, `uploads/${filepath}`);
          }
        } catch (error) {
          console.error('Delete file error:', error);
          // 即使删除失败，也从表单中移除了
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('删除失败');
    }
  };

  const handleSetCoverImage = (imageUrl) => {
    setFormData({
      ...formData,
      coverImage: imageUrl
    });
  };

  if (loading) {
    return <div className="manage-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="manage-container">
      <div className="manage-header">
        <h1>商品管理 Products Management</h1>
        <div className="header-actions">
          <Link to="/admin/dashboard" className="back-button">返回首页</Link>
          <button onClick={() => { setShowForm(true); setEditingProduct(null); resetForm(); }} className="add-button">
            添加商品
          </button>
        </div>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索商品名称或描述..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '8px 16px', border: '1px solid #457b9d', borderRadius: '4px', background: '#457b9d', color: 'white', cursor: 'pointer' }}
        >
          搜索
        </button>
        {activeSearchTerm && (
          <button
            onClick={handleClearSearch}
            style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
          >
            清除
          </button>
        )}
        <span style={{ color: '#666', fontSize: '14px' }}>共 {total} 条记录</span>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-card">
            <h2>{editingProduct ? '编辑商品' : '添加商品'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>商品名称 (EN) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>商品名称 (CN)</label>
                  <input
                    type="text"
                    value={formData.nameCN}
                    onChange={(e) => setFormData({ ...formData, nameCN: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>描述 (EN) *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>描述 (CN)</label>
                  <textarea
                    value={formData.descriptionCN}
                    onChange={(e) => setFormData({ ...formData, descriptionCN: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>分类 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="souvenir">纪念品 Souvenir</option>
                    <option value="food">食品 Food</option>
                    <option value="clothing">服装 Clothing</option>
                    <option value="electronics">电子产品 Electronics</option>
                    <option value="other">其他 Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>价格 (CNY) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>图片管理 ({formData.images.length}/20)</label>
                
                {/* 图片上传区域 */}
                {editingProduct && editingProduct.id && (
                  <div className="image-upload-section">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploadingImages || formData.images.length >= 20}
                      style={{ marginBottom: '10px' }}
                    />
                    {selectedFiles.length > 0 && (
                      <button
                        type="button"
                        onClick={handleUploadImages}
                        disabled={uploadingImages}
                        className="upload-button"
                      >
                        {uploadingImages ? '上传中...' : `上传 ${selectedFiles.length} 张图片`}
                      </button>
                    )}
                    {formData.images.length >= 20 && (
                      <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px' }}>
                        已达到最大图片数量（20张）
                      </p>
                    )}
                  </div>
                )}

                {/* 已上传的图片列表 */}
                {formData.images.length > 0 && (
                  <div className="images-grid">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className={`image-item ${formData.coverImage === imageUrl ? 'cover-image' : ''}`}>
                        <img src={imageUrl} alt={`Product ${index + 1}`} />
                        <div className="image-actions">
                          {formData.coverImage !== imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleSetCoverImage(imageUrl)}
                              className="set-cover-button"
                            >
                              设为封面
                            </button>
                          )}
                          {formData.coverImage === imageUrl && (
                            <span className="cover-badge">封面</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(imageUrl)}
                            className="delete-image-button"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL输入（备用） */}
                <details style={{ marginTop: '10px' }}>
                  <summary>或手动输入图片URL（每行一个）</summary>
                  <textarea
                    value={formData.images.join('\n')}
                    onChange={(e) => {
                      const urls = e.target.value.split('\n').filter(url => url.trim());
                      if (urls.length <= 20) {
                        setFormData({
                          ...formData,
                          images: urls,
                          coverImage: formData.coverImage || urls[0] || ''
                        });
                      } else {
                        alert('最多只能有20张图片');
                      }
                    }}
                    rows="4"
                    placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    style={{ marginTop: '10px', width: '100%' }}
                  />
                </details>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  上架 Available
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">保存</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} className="cancel-button">
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="manage-table-container">
        <table className="manage-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>分类</th>
              <th>价格</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>¥{product.price}</td>
                <td>{product.isAvailable ? '✓ 上架' : '✗ 下架'}</td>
                <td>
                  <button onClick={() => handleEdit(product)} className="edit-button">编辑</button>
                  <button onClick={() => handleDelete(product.id)} className="delete-button">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && !loading && <div className="empty-state">暂无商品</div>}
      </div>

      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: currentPage === 1 ? '#f5f5f5' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            上一页
          </button>
          <span style={{ padding: '0 10px' }}>
            第 {currentPage} / {totalPages} 页
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', background: currentPage === totalPages ? '#f5f5f5' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsManage;
