import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetLocations,
  adminCreateLocation,
  adminUpdateLocation,
  adminDeleteLocation,
  adminUploadImages,
  adminDeleteImage
} from '../../services/api';
import './Manage.css';

const LocationsManage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    nameCN: '',
    address: '',
    addressCN: '',
    city: 'Shanghai',
    district: '',
    description: '',
    descriptionCN: '',
    categories: '[]',
    phone: '',
    website: '',
    rating: 0,
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    images: [],
    coverImage: ''
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 实际用于搜索的关键词

  useEffect(() => {
    fetchLocations();
  }, [currentPage, activeSearchTerm]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 50
      };
      if (activeSearchTerm.trim()) {
        params.search = activeSearchTerm.trim();
      }
      const response = await adminGetLocations(params);
      setLocations(response.data.locations || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching locations:', error);
      alert('获取地点列表失败');
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
      // 处理openingHours：移除空值，如果所有天都为空则设为null
      let openingHoursObj = { ...formData.openingHours };
      Object.keys(openingHoursObj).forEach(key => {
        if (!openingHoursObj[key] || openingHoursObj[key].trim() === '') {
          delete openingHoursObj[key];
        }
      });
      if (Object.keys(openingHoursObj).length === 0) {
        openingHoursObj = null;
      }

      const submitData = {
        ...formData,
        categories: typeof formData.categories === 'string' ? JSON.parse(formData.categories) : formData.categories,
        rating: parseFloat(formData.rating) || 0,
        openingHours: openingHoursObj
      };

      let locationId;
      if (editingLocation) {
        await adminUpdateLocation(editingLocation.id, submitData);
        locationId = editingLocation.id;
        alert('地点更新成功');
      } else {
        const response = await adminCreateLocation(submitData);
        locationId = response.data.id || response.data.location?.id;
        if (locationId) {
          setEditingLocation({ id: locationId });
        }
        alert('地点创建成功，现在可以上传图片了');
      }

      // 如果地点ID存在且有选中的文件，自动上传
      if (locationId && selectedFiles.length > 0) {
        await handleUploadImages();
      }

      // 只有在编辑模式下才关闭表单
      if (editingLocation && editingLocation.id) {
        setShowForm(false);
        setEditingLocation(null);
        resetForm();
      }
      fetchLocations();
    } catch (error) {
      console.error('Error saving location:', error);
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个地点吗？')) return;
    
    try {
      await adminDeleteLocation(id);
      alert('删除成功');
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('删除失败');
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    const categoriesStr = typeof location.categories === 'string' ? location.categories : JSON.stringify(location.categories || []);
    const parsedImages = Array.isArray(location.images) ? location.images : (typeof location.images === 'string' ? JSON.parse(location.images || '[]') : []);
    
    // 解析openingHours
    let openingHours = {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    };
    if (location.openingHours) {
      const oh = typeof location.openingHours === 'string' ? JSON.parse(location.openingHours) : location.openingHours;
      if (oh && typeof oh === 'object' && !oh.note) {
        // 如果是按天分别的格式
        openingHours = {
          monday: oh.monday || '',
          tuesday: oh.tuesday || '',
          wednesday: oh.wednesday || '',
          thursday: oh.thursday || '',
          friday: oh.friday || '',
          saturday: oh.saturday || '',
          sunday: oh.sunday || ''
        };
      }
    }

    setFormData({
      name: location.name || '',
      nameCN: location.nameCN || '',
      address: location.address || '',
      addressCN: location.addressCN || '',
      city: location.city || 'Shanghai',
      district: location.district || '',
      description: location.description || '',
      descriptionCN: location.descriptionCN || '',
      categories: categoriesStr,
      phone: location.phone || '',
      website: location.website || '',
      rating: location.rating || 0,
      openingHours: openingHours,
      images: parsedImages,
      coverImage: location.coverImage || (parsedImages.length > 0 ? parsedImages[0] : '')
    });
    setShowForm(true);
    setSelectedFiles([]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameCN: '',
      address: '',
      addressCN: '',
      city: 'Shanghai',
      district: '',
      description: '',
      descriptionCN: '',
      categories: '[]',
      phone: '',
      website: '',
      rating: 0,
      openingHours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      },
      images: [],
      coverImage: ''
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

    const locationId = editingLocation?.id;
    if (!locationId) {
      alert('请先保存地点，然后再上传图片');
      return;
    }

    try {
      setUploadingImages(true);
      const response = await adminUploadImages('locations', locationId, selectedFiles);
      
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
      const updatedImages = formData.images.filter(img => img !== imageUrl);
      const updatedCoverImage = formData.coverImage === imageUrl ? (updatedImages[0] || '') : formData.coverImage;
      
      setFormData({
        ...formData,
        images: updatedImages,
        coverImage: updatedCoverImage
      });

      if (editingLocation?.id) {
        try {
          const filepath = imageUrl.split('/uploads/')[1];
          if (filepath) {
            await adminDeleteImage('locations', editingLocation.id, `uploads/${filepath}`);
          }
        } catch (error) {
          console.error('Delete file error:', error);
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
        <h1>地点管理 Locations Management</h1>
        <div className="header-actions">
          <Link to="/admin/dashboard" className="back-button">返回首页</Link>
          <button onClick={() => { setShowForm(true); setEditingLocation(null); resetForm(); }} className="add-button">
            添加地点
          </button>
        </div>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索地点名称、地址或描述..."
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
            <h2>{editingLocation ? '编辑地点' : '添加地点'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>名称 (EN) *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>名称 (CN)</label>
                  <input
                    type="text"
                    value={formData.nameCN}
                    onChange={(e) => setFormData({ ...formData, nameCN: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>地址 (EN) *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>地址 (CN)</label>
                  <input
                    type="text"
                    value={formData.addressCN}
                    onChange={(e) => setFormData({ ...formData, addressCN: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>城市</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Shanghai"
                  />
                </div>
                <div className="form-group">
                  <label>区域 *</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                    placeholder="e.g. Xuhui, Huangpu"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>评分</label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>电话</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>网站</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>🕐 营业时间 Opening Hours</label>
                <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                  格式：09:00 - 21:00 或留空表示不营业
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.9em', marginBottom: '5px', fontWeight: '500' }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </label>
                      <input
                        type="text"
                        value={formData.openingHours[day] || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          openingHours: {
                            ...formData.openingHours,
                            [day]: e.target.value
                          }
                        })}
                        placeholder="09:00 - 21:00"
                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>描述 (EN) *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>描述 (CN)</label>
                  <textarea
                    value={formData.descriptionCN}
                    onChange={(e) => setFormData({ ...formData, descriptionCN: e.target.value })}
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>分类 (JSON数组)</label>
                <textarea
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  rows="2"
                  placeholder='["shopping", "tourism"]'
                />
              </div>

              <div className="form-group">
                <label>图片管理 ({formData.images.length}/20)</label>
                
                {editingLocation && editingLocation.id && (
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

                {formData.images.length > 0 && (
                  <div className="images-grid">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className={`image-item ${formData.coverImage === imageUrl ? 'cover-image' : ''}`}>
                        <img src={imageUrl} alt={`Location ${index + 1}`} />
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

              <div className="form-actions">
                <button type="submit" className="save-button">保存</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingLocation(null); resetForm(); }} className="cancel-button">
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
              <th>地址</th>
              <th>城市</th>
              <th>区域</th>
              <th>评分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((location) => (
              <tr key={location.id}>
                <td>{location.id}</td>
                <td>{location.name}</td>
                <td>{location.address}</td>
                <td>{location.city || 'Shanghai'}</td>
                <td>{location.district}</td>
                <td>{location.rating || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(location)} className="edit-button">编辑</button>
                  <button onClick={() => handleDelete(location.id)} className="delete-button">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {locations.length === 0 && !loading && <div className="empty-state">暂无地点</div>}
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

export default LocationsManage;
