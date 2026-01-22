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
    openingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
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
      };
      
      // 处理price字段：如果为空或无效，删除
      if (formData.price && formData.price.trim()) {
        try {
          submitData.price = typeof formData.price === 'string' ? JSON.parse(formData.price) : formData.price;
        } catch (e) {
          // 如果JSON解析失败，尝试使用默认值
          submitData.price = { note: formData.price };
        }
      } else {
        delete submitData.price;
      }
      
      // 处理日期字段：只有当日期不为空时才转换，空值则删除
      if (formData.startDate && formData.startDate.trim()) {
        try {
          const date = new Date(formData.startDate);
          if (!isNaN(date.getTime())) {
            submitData.startDate = date.toISOString();
          } else {
            delete submitData.startDate;
          }
        } catch (e) {
          delete submitData.startDate;
        }
      } else {
        delete submitData.startDate;
      }
      
      if (formData.endDate && formData.endDate.trim()) {
        try {
          const date = new Date(formData.endDate);
          if (!isNaN(date.getTime())) {
            submitData.endDate = date.toISOString();
          } else {
            delete submitData.endDate;
          }
        } catch (e) {
          delete submitData.endDate;
        }
      } else {
        delete submitData.endDate;
      }
      
      // 处理openingHours：清理空值
      if (formData.openingHours) {
        const cleanedHours = {};
        Object.entries(formData.openingHours).forEach(([day, hours]) => {
          if (hours && hours.trim()) {
            cleanedHours[day] = hours.trim();
          }
        });
        // 如果至少有一个非空值，则包含openingHours
        if (Object.keys(cleanedHours).length > 0) {
          submitData.openingHours = cleanedHours;
        } else {
          delete submitData.openingHours;
        }
      }
      
      // 清理其他非必填字段的空值
      const nonRequiredFields = [
        'titleCN', 'descriptionCN', 'venueName', 'venueAddress', 
        'city', 'district', 'startTime', 'endTime', 'listImage'
      ];
      
      nonRequiredFields.forEach(field => {
        if (submitData[field] === '' || submitData[field] === null || submitData[field] === undefined) {
          delete submitData[field];
        }
      });
      
      // 处理images数组：如果为空数组，删除
      if (submitData.images && Array.isArray(submitData.images) && submitData.images.length === 0) {
        delete submitData.images;
      }
      
      // 如果listImage不在images中，也要删除
      if (submitData.listImage && submitData.images && !submitData.images.includes(submitData.listImage)) {
        submitData.listImage = submitData.images[0] || '';
        if (!submitData.listImage) {
          delete submitData.listImage;
        }
      }

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
      }

      // 如果活动ID存在且有选中的文件，自动上传
      if (eventId && selectedFiles.length > 0) {
        try {
          setUploadingImages(true);
          const response = await adminUploadImages('events', eventId, selectedFiles);
          
          const newImages = response.data.files.map(f => f.url);
          const updatedImages = [...(submitData.images || []), ...newImages];
          
          // 更新活动，添加新上传的图片
          await adminUpdateEvent(eventId, {
            images: updatedImages,
            listImage: submitData.listImage || newImages[0] || (submitData.listImage || '')
          });
          
          // 更新表单状态
          setFormData({
            ...formData,
            images: updatedImages,
            listImage: submitData.listImage || newImages[0] || formData.listImage
          });
          
          // 清空已上传的文件
          selectedFiles.forEach(file => {
            URL.revokeObjectURL(URL.createObjectURL(file));
          });
          setSelectedFiles([]);
          
          if (!editingEvent) {
            alert(`活动创建成功，并已上传 ${newImages.length} 张图片`);
          } else {
            alert(`活动更新成功，并已上传 ${newImages.length} 张图片`);
          }
        } catch (error) {
          console.error('Upload images error:', error);
          const action = editingEvent ? '更新' : '创建';
          alert(`活动${action}成功，但图片上传失败：${error.response?.data?.error || error.message}`);
        } finally {
          setUploadingImages(false);
        }
      } else {
        if (!editingEvent) {
          alert('活动创建成功');
        }
      }

      // 只有在编辑模式下且没有待上传图片时才关闭表单
      const shouldClose = editingEvent?.id && selectedFiles.length === 0 && !uploadingImages;
      if (shouldClose) {
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
    
    // 解析openingHours
    let parsedOpeningHours = {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    };
    if (event.openingHours) {
      if (typeof event.openingHours === 'string') {
        try {
          parsedOpeningHours = { ...parsedOpeningHours, ...JSON.parse(event.openingHours) };
        } catch (e) {
          console.error('Error parsing openingHours:', e);
        }
      } else if (typeof event.openingHours === 'object') {
        parsedOpeningHours = { ...parsedOpeningHours, ...event.openingHours };
      }
    }
    
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
      openingHours: parsedOpeningHours,
      price: priceStr,
      featured: event.featured || false,
      images: parsedImages,
      listImage: event.listImage || (parsedImages.length > 0 ? parsedImages[0] : '')
    });
    setShowForm(true);
    setSelectedFiles([]);
  };

  const resetForm = () => {
    // 释放所有预览图片的URL
    selectedFiles.forEach(file => {
      URL.revokeObjectURL(URL.createObjectURL(file));
    });
    
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
      openingHours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
      },
      price: JSON.stringify({ note: 'Free' }),
      featured: false,
      images: [],
      listImage: ''
    });
    setSelectedFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = formData.images.length + selectedFiles.length + files.length;
    
    if (totalImages > 20) {
      alert(`最多只能上传20张图片。当前已有 ${formData.images.length} 张，已选择 ${selectedFiles.length} 张，本次选择 ${files.length} 张`);
      return;
    }
    
    // 验证文件类型
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('只能上传图片文件');
      return;
    }
    
    // 验证文件大小（例如限制为5MB）
    const largeFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      alert('图片文件大小不能超过5MB');
      return;
    }
    
    setSelectedFiles([...selectedFiles, ...files]);
    // 清空input的值，允许重复选择同一文件
    e.target.value = '';
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      alert('请先选择要上传的图片');
      return;
    }

    // 使用editingEvent.id或者从表单状态中获取ID
    const eventId = editingEvent?.id;
    if (!eventId) {
      alert('请先保存活动，然后再上传图片');
      return;
    }

    try {
      setUploadingImages(true);
      const response = await adminUploadImages('events', eventId, selectedFiles);
      
      const newImages = response.data.files.map(f => f.url);
      const updatedImages = [...formData.images, ...newImages];
      
      setFormData({
        ...formData,
        images: updatedImages,
        listImage: formData.listImage || newImages[0]
      });
      
      setSelectedFiles([]);
      alert(`成功上传 ${newImages.length} 张图片`);
      
      // 刷新活动列表以显示新图片
      await fetchEvents();
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
      const eventId = editingEvent?.id;
      const updatedImages = formData.images.filter(img => img !== imageUrl);
      const updatedListImage = formData.listImage === imageUrl ? (updatedImages[0] || '') : formData.listImage;
      
      // 先更新表单状态
      const updatedFormData = {
        ...formData,
        images: updatedImages,
        listImage: updatedListImage
      };
      setFormData(updatedFormData);

      // 如果有活动ID，删除服务器上的文件并更新数据库
      if (eventId) {
        try {
          const filepath = imageUrl.split('/uploads/')[1];
          if (filepath) {
            await adminDeleteImage('events', eventId, `uploads/${filepath}`);
          }
          
          // 更新活动数据
          await adminUpdateEvent(eventId, {
            images: updatedImages,
            listImage: updatedListImage
          });
          
          // 刷新活动列表
          await fetchEvents();
        } catch (error) {
          console.error('Delete file error:', error);
          alert('删除服务器文件失败，但已从表单中移除');
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('删除失败');
    }
  };

  const handleSetListImage = async (imageUrl) => {
    const eventId = editingEvent?.id;
    
    // 先更新表单状态
    setFormData({
      ...formData,
      listImage: imageUrl
    });
    
    // 如果有活动ID，更新数据库
    if (eventId) {
      try {
        await adminUpdateEvent(eventId, {
          listImage: imageUrl
        });
        // 刷新活动列表
        await fetchEvents();
      } catch (error) {
        console.error('Update cover image error:', error);
        alert('更新封面图片失败');
      }
    }
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
                  <label>开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>结束日期</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
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
                <label>营业时间 (Opening Hours)</label>
                <div className="opening-hours-form">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="form-row" style={{ marginBottom: '8px' }}>
                      <label style={{ minWidth: '100px', textTransform: 'capitalize' }}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}:
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
                        placeholder="e.g. 09:00 - 21:00 or Closed"
                        style={{ flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
                <small className="form-hint">
                  格式：09:00 - 21:00 或 Closed（留空表示不显示）
                </small>
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
                <label>图片管理 ({formData.images.length + selectedFiles.length}/20)</label>
                
                {/* 上传图片功能 - 总是显示 */}
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploadingImages || (formData.images.length + selectedFiles.length) >= 20}
                    style={{ marginBottom: '10px' }}
                  />
                  {selectedFiles.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <p style={{ color: '#666', fontSize: '12px', margin: '5px 0' }}>
                        已选择 {selectedFiles.length} 张图片，将在保存活动时自动上传
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {selectedFiles.map((file, index) => (
                          <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = selectedFiles.filter((_, i) => i !== index);
                                setSelectedFiles(newFiles);
                                // 释放URL对象
                                URL.revokeObjectURL(URL.createObjectURL(file));
                              }}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(formData.images.length + selectedFiles.length) >= 20 && (
                    <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '8px' }}>
                      已达到最大图片数量（20张）
                    </p>
                  )}
                </div>
                
                {/* 如果正在编辑且有活动ID，显示立即上传按钮 */}
                {editingEvent?.id && selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={uploadingImages}
                    className="upload-button"
                    style={{ marginTop: '10px' }}
                  >
                    {uploadingImages ? '上传中...' : `立即上传 ${selectedFiles.length} 张图片`}
                  </button>
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
                <td>{event.startDate ? new Date(event.startDate).toLocaleDateString() : 'TBA'}</td>
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
