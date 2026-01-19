import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetEvents,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  adminUploadImages,
  adminDeleteImage
} from '../../services/api';
import './Manage.css';

const EventsManage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    titleCN: '',
    description: '',
    descriptionCN: '',
    category: 'other',
    venueName: '',
    venueAddress: '',
    city: '',
    district: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    price: JSON.stringify({ note: 'Free' }),
    featured: false,
    images: [],
    listImage: ''
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 实际用于搜索的关键词

  useEffect(() => {
    fetchEvents();
  }, [currentPage, activeSearchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 50,
        all: 'true' // 管理员可以查看所有活动
      };
      if (activeSearchTerm.trim()) {
        params.search = activeSearchTerm.trim();
      }
      const response = await adminGetEvents(params);
      setEvents(response.data.events || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('获取活动列表失败');
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
      const submitData = {
        ...formData,
        price: typeof formData.price === 'string' ? JSON.parse(formData.price) : formData.price,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      let eventId;
      if (editingEvent) {
        await adminUpdateEvent(editingEvent.id, submitData);
        eventId = editingEvent.id;
        alert('活动更新成功');
      } else {
        const response = await adminCreateEvent(submitData);
        eventId = response.data.id || response.data.event?.id;
        if (eventId) {
          setEditingEvent({ id: eventId });
        }
        alert('活动创建成功，现在可以上传图片了');
      }

      // 如果活动ID存在且有选中的文件，自动上传
      if (eventId && selectedFiles.length > 0) {
        await handleUploadImages();
      }

      // 只有在编辑模式下才关闭表单
      if (editingEvent && editingEvent.id) {
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
      }
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个活动吗？')) return;
    
    try {
      await adminDeleteEvent(id);
      alert('删除成功');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('删除失败');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    const priceStr = typeof event.price === 'string' ? event.price : JSON.stringify(event.price || { note: 'Free' });
    const parsedImages = Array.isArray(event.images) ? event.images : (typeof event.images === 'string' ? JSON.parse(event.images || '[]') : []);
    setFormData({
      title: event.title || '',
      titleCN: event.titleCN || '',
      description: event.description || '',
      descriptionCN: event.descriptionCN || '',
      category: event.category || 'other',
      venueName: event.venueName || '',
      venueAddress: event.venueAddress || '',
      city: event.city || '',
      district: event.district || '',
      startDate: event.startDate ? event.startDate.split('T')[0] : '',
      endDate: event.endDate ? event.endDate.split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      price: priceStr,
      featured: event.featured || false,
      images: parsedImages,
      listImage: event.listImage || (parsedImages.length > 0 ? parsedImages[0] : '')
    });
    setShowForm(true);
    setSelectedFiles([]);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleCN: '',
      description: '',
      descriptionCN: '',
      category: 'other',
      venueName: '',
      venueAddress: '',
      city: '',
      district: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      price: JSON.stringify({ note: 'Free' }),
      featured: false,
      images: [],
      listImage: ''
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

    const eventId = editingEvent?.id;
    if (!eventId) {
      alert('请先保存活动，然后再上传图片');
      return;
    }

    try {
      setUploadingImages(true);
      const response = await adminUploadImages('events', eventId, selectedFiles);
      
      const newImages = response.data.files.map(f => f.url);
      setFormData({
        ...formData,
        images: [...formData.images, ...newImages],
        listImage: formData.listImage || newImages[0]
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
      const updatedListImage = formData.listImage === imageUrl ? (updatedImages[0] || '') : formData.listImage;
      
      setFormData({
        ...formData,
        images: updatedImages,
        listImage: updatedListImage
      });

      if (editingEvent?.id) {
        try {
          const filepath = imageUrl.split('/uploads/')[1];
          if (filepath) {
            await adminDeleteImage('events', editingEvent.id, `uploads/${filepath}`);
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

  const handleSetListImage = (imageUrl) => {
    setFormData({
      ...formData,
      listImage: imageUrl
    });
  };

  if (loading) {
    return <div className="manage-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="manage-container">
      <div className="manage-header">
        <h1>活动管理 Events Management</h1>
        <div className="header-actions">
          <Link to="/admin/dashboard" className="back-button">返回首页</Link>
          <button onClick={() => { setShowForm(true); setEditingEvent(null); resetForm(); }} className="add-button">
            添加活动
          </button>
        </div>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索活动标题或描述..."
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
            <h2>{editingEvent ? '编辑活动' : '添加活动'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>标题 (EN) *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>标题 (CN)</label>
                  <input
                    type="text"
                    value={formData.titleCN}
                    onChange={(e) => setFormData({ ...formData, titleCN: e.target.value })}
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

              <div className="form-row">
                <div className="form-group">
                  <label>分类 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="exhibition">展览 Exhibition</option>
                    <option value="concert">音乐会 Concert</option>
                    <option value="festival">节日 Festival</option>
                    <option value="workshop">工作坊 Workshop</option>
                    <option value="sports">体育 Sports</option>
                    <option value="food">美食 Food</option>
                    <option value="art">艺术 Art</option>
                    <option value="music">音乐 Music</option>
                    <option value="other">其他 Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>是否推荐</label>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>地点名称</label>
                  <input
                    type="text"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>地点地址</label>
                  <input
                    type="text"
                    value={formData.venueAddress}
                    onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
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
                  <label>区</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="e.g. Xuhui, Huangpu"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>开始日期 *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>结束日期 *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>开始时间</label>
                  <input
                    type="text"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 7:30 PM"
                  />
                </div>
                <div className="form-group">
                  <label>结束时间</label>
                  <input
                    type="text"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 10:00 PM"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>价格信息 (JSON)</label>
                <textarea
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  rows="3"
                  placeholder='{"note": "Free"} or {"amount": 100, "currency": "CNY", "note": "¥100"}'
                />
              </div>

              <div className="form-group">
                <label>图片管理 ({formData.images.length}/20)</label>
                
                {editingEvent && editingEvent.id && (
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
                      <div key={index} className={`image-item ${formData.listImage === imageUrl ? 'cover-image' : ''}`}>
                        <img src={imageUrl} alt={`Event ${index + 1}`} />
                        <div className="image-actions">
                          {formData.listImage !== imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleSetListImage(imageUrl)}
                              className="set-cover-button"
                            >
                              设为封面
                            </button>
                          )}
                          {formData.listImage === imageUrl && (
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
                          listImage: formData.listImage || urls[0] || ''
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
                <button type="button" onClick={() => { setShowForm(false); setEditingEvent(null); resetForm(); }} className="cancel-button">
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
              <th>标题</th>
              <th>分类</th>
              <th>地点</th>
              <th>开始日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.id}</td>
                <td>{event.title}</td>
                <td>{event.category}</td>
                <td>{event.venueName || '-'}</td>
                <td>{new Date(event.startDate).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleEdit(event)} className="edit-button">编辑</button>
                  <button onClick={() => handleDelete(event.id)} className="delete-button">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && !loading && <div className="empty-state">暂无活动</div>}
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

export default EventsManage;
