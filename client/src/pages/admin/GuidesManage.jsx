import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetGuides,
  adminCreateGuide,
  adminUpdateGuide,
  adminDeleteGuide,
  adminUploadImages,
  adminDeleteImage
} from '../../services/api';
import RichTextEditor from '../../components/admin/RichTextEditor';
import './Manage.css';

const GuidesManage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    titleCN: '',
    content: '',
    summary: '',
    category: 'tips',
    isPinned: false,
    isPublished: true,
    coverImage: '',
    tags: [],
    sortOrder: 0
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tagsInput, setTagsInput] = useState(''); // 用于输入标签的临时状态

  const [activeSearchTerm, setActiveSearchTerm] = useState(''); // 实际用于搜索的关键词

  useEffect(() => {
    fetchGuides();
  }, [currentPage, activeSearchTerm]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 50,
        all: 'true' // 管理员可以查看所有攻略
      };
      if (activeSearchTerm.trim()) {
        params.search = activeSearchTerm.trim();
      }
      const response = await adminGetGuides(params);
      setGuides(response.data.guides || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching guides:', error);
      alert('获取攻略列表失败');
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
      // 处理标签：将字符串转换为数组
      const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      const submitData = {
        ...formData,
        tags: tagsArray
      };

      let guideId;
      if (editingGuide) {
        await adminUpdateGuide(editingGuide.id, submitData);
        guideId = editingGuide.id;
        alert('攻略更新成功');
      } else {
        const response = await adminCreateGuide(submitData);
        guideId = response.data.id || response.data.guide?.id;
        if (guideId) {
          setEditingGuide({ id: guideId });
        }
        alert('攻略创建成功，现在可以上传头图了');
      }

      // 如果有选中的文件，自动上传头图
      if (guideId && selectedFiles.length > 0) {
        try {
          setUploadingImages(true);
          const response = await adminUploadImages('guides', guideId, [selectedFiles[0]]);
          
          const coverImageUrl = response.data.files[0]?.url;
          if (coverImageUrl) {
            setFormData({
              ...formData,
              coverImage: coverImageUrl
            });
            // 更新editingGuide的coverImage，以便后续编辑时显示
            if (editingGuide) {
              setEditingGuide({ ...editingGuide, coverImage: coverImageUrl });
            }
          }
          
          setSelectedFiles([]);
          alert('头图上传成功');
        } catch (error) {
          console.error('Upload error:', error);
          alert(error.response?.data?.error || '头图上传失败');
        } finally {
          setUploadingImages(false);
        }
      }

      if (editingGuide && editingGuide.id) {
        setShowForm(false);
        setEditingGuide(null);
        resetForm();
      }
      fetchGuides();
    } catch (error) {
      console.error('Error saving guide:', error);
      alert(error.response?.data?.error || '保存失败');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个攻略吗？')) return;
    
    try {
      await adminDeleteGuide(id);
      alert('删除成功');
      fetchGuides();
    } catch (error) {
      console.error('Error deleting guide:', error);
      alert('删除失败');
    }
  };

  const handleEdit = (guide) => {
    setEditingGuide(guide);
    const parsedTags = Array.isArray(guide.tags) ? guide.tags : (typeof guide.tags === 'string' ? JSON.parse(guide.tags || '[]') : []);
    setFormData({
      title: guide.title || '',
      titleCN: guide.titleCN || '',
      content: guide.content || '',
      summary: guide.summary || '',
      category: guide.category || 'tips',
      isPinned: guide.isPinned || false,
      isPublished: guide.isPublished !== undefined ? guide.isPublished : true,
      coverImage: guide.coverImage || '',
      tags: parsedTags,
      sortOrder: guide.sortOrder || 0
    });
    setTagsInput(parsedTags.join(', '));
    setShowForm(true);
    setSelectedFiles([]);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleCN: '',
      content: '',
      summary: '',
      category: 'tips',
      isPinned: false,
      isPublished: true,
      coverImage: '',
      tags: [],
      sortOrder: 0
    });
    setTagsInput('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUploadCoverImage = async () => {
    if (selectedFiles.length === 0) {
      alert('请先选择要上传的头图');
      return;
    }

    const guideId = editingGuide?.id;
    if (!guideId) {
      alert('请先保存攻略基本信息，然后再上传头图');
      return;
    }

    try {
      setUploadingImages(true);
      const response = await adminUploadImages('guides', guideId, [selectedFiles[0]]);
      
      const coverImageUrl = response.data.files[0]?.url;
      if (coverImageUrl) {
        setFormData({
          ...formData,
          coverImage: coverImageUrl
        });
        // 更新editingGuide的coverImage，以便后续编辑时显示
        if (editingGuide) {
          setEditingGuide({ ...editingGuide, coverImage: coverImageUrl });
        }
      }
      
      setSelectedFiles([]);
      alert('头图上传成功');
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.error || '上传失败');
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) {
    return <div className="manage-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="manage-container">
      <div className="manage-header">
        <h1>攻略管理 Guides Management</h1>
        <div className="header-actions">
          <Link to="/admin/dashboard" className="back-button">返回首页</Link>
          <button onClick={() => { setShowForm(true); setEditingGuide(null); resetForm(); }} className="add-button">
            添加攻略
          </button>
        </div>
      </div>

      <div className="search-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="搜索攻略标题、摘要或内容..."
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
          <div className="form-card" style={{ maxWidth: '1000px' }}>
            <h2>{editingGuide ? '编辑攻略' : '添加攻略'}</h2>
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
                  <label>分类 *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="transport">Transport 交通</option>
                    <option value="shopping">Shopping 购物</option>
                    <option value="food">Food 美食</option>
                    <option value="sightseeing">Sightseeing 观光</option>
                    <option value="culture">Culture 文化</option>
                    <option value="tips">Tips 贴士</option>
                    <option value="other">Other 其他</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>排序权重（数字越大越靠前）</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>摘要/简介</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows="3"
                  placeholder="简短介绍这篇攻略的内容..."
                />
              </div>

              <div className="form-group">
                <label>正文内容（富文本编辑器） *</label>
                <RichTextEditor
                  value={formData.content || ''}
                  onChange={(content) => setFormData({ ...formData, content })}
                  guideId={editingGuide?.id}
                />
              </div>

              <div className="form-group">
                <label>标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="例如: 地铁,交通,实用技巧"
                />
              </div>

              <div className="form-group">
                <label>头图</label>
                
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingImages}
                    style={{ marginBottom: '10px' }}
                  />
                  {selectedFiles.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <button
                        type="button"
                        onClick={handleUploadCoverImage}
                        disabled={uploadingImages || !editingGuide?.id}
                        className="upload-button"
                      >
                        {uploadingImages ? '上传中...' : '上传头图'}
                      </button>
                      {!editingGuide?.id && (
                        <span style={{ marginLeft: '10px', color: '#666', fontSize: '0.9em' }}>
                          （请先保存攻略基本信息）
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {formData.coverImage && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={formData.coverImage} 
                      alt="Cover" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, coverImage: '' });
                        setSelectedFiles([]);
                      }}
                      className="delete-image-button"
                      style={{ marginLeft: '10px' }}
                    >
                      删除
                    </button>
                  </div>
                )}

                <details style={{ marginTop: '10px' }}>
                  <summary>或手动输入图片URL</summary>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    style={{ marginTop: '10px', width: '100%', padding: '8px' }}
                  />
                </details>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    />
                    置顶显示
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    />
                    发布状态
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">保存</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingGuide(null); resetForm(); }} className="cancel-button">
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
              <th>置顶</th>
              <th>状态</th>
              <th>浏览量</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id}>
                <td>{guide.id}</td>
                <td>{guide.title}</td>
                <td>{guide.category}</td>
                <td>{guide.isPinned ? '📌 是' : '否'}</td>
                <td>{guide.isPublished ? '✓ 已发布' : '✗ 未发布'}</td>
                <td>{guide.viewCount || 0}</td>
                <td>
                  <button onClick={() => handleEdit(guide)} className="edit-button">编辑</button>
                  <button onClick={() => handleDelete(guide.id)} className="delete-button">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {guides.length === 0 && !loading && <div className="empty-state">暂无攻略</div>}
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

export default GuidesManage;
