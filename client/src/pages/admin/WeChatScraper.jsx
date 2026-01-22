import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { scrapeWeChatArticle } from '../../services/api';
import './Manage.css';

// 定义每种数据类型的字段配置模板
const fieldTemplates = {
  location: [
    { key: 'name', label: '名称 (name)', required: true, type: 'text' },
    { key: 'nameCN', label: '中文名称 (nameCN)', required: false, type: 'text' },
    { key: 'address', label: '地址 (address)', required: true, type: 'text' },
    { key: 'addressCN', label: '中文地址 (addressCN)', required: false, type: 'text' },
    { key: 'district', label: '区域 (district)', required: true, type: 'text' },
    { key: 'description', label: '描述 (description)', required: true, type: 'html' },
    { key: 'descriptionCN', label: '中文描述 (descriptionCN)', required: false, type: 'html' },
    { key: 'phone', label: '电话 (phone)', required: false, type: 'text' },
    { key: 'website', label: '网站 (website)', required: false, type: 'text' },
    { key: 'openingHours', label: '营业时间 (openingHours)', required: false, type: 'json' },
    { key: 'coverImage', label: '封面图 (coverImage)', required: false, type: 'image' },
  ],
  product: [
    { key: 'name', label: '名称 (name)', required: true, type: 'text' },
    { key: 'nameCN', label: '中文名称 (nameCN)', required: false, type: 'text' },
    { key: 'description', label: '描述 (description)', required: true, type: 'html' },
    { key: 'descriptionCN', label: '中文描述 (descriptionCN)', required: false, type: 'html' },
    { key: 'price', label: '价格 (price)', required: true, type: 'number' },
    { key: 'originalPrice', label: '原价 (originalPrice)', required: false, type: 'number' },
    { key: 'coverImage', label: '封面图 (coverImage)', required: false, type: 'image' },
    { key: 'images', label: '图片列表 (images)', required: false, type: 'images' },
  ],
  event: [
    { key: 'title', label: '标题 (title)', required: true, type: 'text' },
    { key: 'titleCN', label: '中文标题 (titleCN)', required: false, type: 'text' },
    { key: 'description', label: '描述 (description)', required: true, type: 'html' },
    { key: 'descriptionCN', label: '中文描述 (descriptionCN)', required: false, type: 'html' },
    { key: 'startDate', label: '开始日期 (startDate)', required: false, type: 'date' },
    { key: 'endDate', label: '结束日期 (endDate)', required: false, type: 'date' },
    { key: 'startTime', label: '开始时间 (startTime)', required: false, type: 'text' },
    { key: 'endTime', label: '结束时间 (endTime)', required: false, type: 'text' },
    { key: 'venueName', label: '地点名称 (venueName)', required: false, type: 'text' },
    { key: 'venueAddress', label: '地点地址 (venueAddress)', required: false, type: 'text' },
    { key: 'openingHours', label: '营业时间 (openingHours)', required: false, type: 'json' },
    { key: 'price', label: '价格信息 (price)', required: false, type: 'json' },
    { key: 'coverImage', label: '封面图 (coverImage)', required: false, type: 'image' },
  ],
  guide: [
    { key: 'title', label: '标题 (title)', required: true, type: 'text' },
    { key: 'titleCN', label: '中文标题 (titleCN)', required: false, type: 'text' },
    { key: 'content', label: '正文内容 (content)', required: true, type: 'html' },
    { key: 'summary', label: '摘要 (summary)', required: false, type: 'text' },
    { key: 'coverImage', label: '封面图 (coverImage)', required: false, type: 'image' },
    { key: 'tags', label: '标签 (tags)', required: false, type: 'json' },
  ],
};

const WeChatScraper = () => {
  const [articleUrl, setArticleUrl] = useState('');
  const [dataType, setDataType] = useState('guide');
  const [fieldMappings, setFieldMappings] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 当数据类型改变时，初始化字段映射
  React.useEffect(() => {
    const template = fieldTemplates[dataType] || [];
    const mappings = {};
    template.forEach(field => {
      mappings[field.key] = '';
    });
    setFieldMappings(mappings);
  }, [dataType]);

  const handleFieldMappingChange = (fieldKey, value) => {
    setFieldMappings(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!articleUrl.trim()) {
      setError('请输入文章URL');
      return;
    }

    if (!articleUrl.includes('mp.weixin.qq.com')) {
      setError('请输入有效的微信公众号文章URL');
      return;
    }

    // 检查必需字段是否都已填写
    const template = fieldTemplates[dataType] || [];
    const missingFields = template
      .filter(field => field.required && !fieldMappings[field.key]?.trim())
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      setError(`请填写必需字段的选择器：${missingFields.join('、')}`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await scrapeWeChatArticle({
        url: articleUrl,
        dataType,
        fieldMappings
      });
      
      setResult(response.data);
    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message || '抓取失败';
      
      // 如果有验证错误，显示详细信息
      if (err.response?.data?.validationErrors) {
        const validationErrors = err.response.data.validationErrors
          .map(e => `${e.field}: ${e.message}`)
          .join('\n');
        errorMessage = `数据验证失败：\n${validationErrors}`;
      }
      
      // 如果有数据库错误，添加详细信息
      if (err.response?.data?.databaseError) {
        const dbError = err.response.data.databaseError;
        errorMessage += `\n数据库错误：${dbError.sqlMessage || dbError.code || '未知错误'}`;
      }
      
      // 如果有调试信息，在控制台显示
      if (err.response?.data?.errorDetails) {
        console.error('详细错误信息:', err.response.data.errorDetails);
      }
      
      setError(errorMessage);
      console.error('Scraping error:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const currentTemplate = fieldTemplates[dataType] || [];

  return (
    <div className="admin-manage">
      <div className="manage-header">
        <h1>微信公众号文章抓取</h1>
        <Link to="/admin/dashboard" className="back-link">← 返回Dashboard</Link>
      </div>

      <div className="manage-content">
        <form onSubmit={handleSubmit} className="scraper-form">
          {/* URL输入 */}
          <div className="form-group">
            <label htmlFor="articleUrl">文章URL *</label>
            <input
              type="url"
              id="articleUrl"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://mp.weixin.qq.com/s/xxxxx"
              required
              disabled={loading}
            />
            <small className="form-hint">
              请输入要抓取的微信公众号文章链接
            </small>
          </div>

          {/* 数据类型选择 */}
          <div className="form-group">
            <label htmlFor="dataType">数据类型 *</label>
            <select
              id="dataType"
              value={dataType}
              onChange={(e) => setDataType(e.target.value)}
              required
              disabled={loading}
            >
              <option value="location">地点 (Location)</option>
              <option value="product">商品 (Product)</option>
              <option value="event">活动 (Event)</option>
              <option value="guide">攻略 (Guide)</option>
            </select>
            <small className="form-hint">
              选择抓取的数据要存入哪种类型
            </small>
          </div>

          {/* 字段映射配置 */}
          <div className="form-group">
            <label>字段映射配置 *</label>
            <div className="field-mappings">
              <p className="field-mappings-hint">
                为每个字段填写CSS选择器或HTML代码片段，系统将自动识别并提取对应内容。
                <br />
                <strong>提示：</strong>可以输入CSS选择器（如：<code>section</code>, <code>p</code>, <code>.class-name</code>, <code>#id-name</code>），也可以直接粘贴HTML代码片段，系统会自动提取选择器。
                <br />
                例如：<code>section</code> 或 <code>&lt;section&gt;...&lt;/section&gt;</code>
              </p>
              
              {currentTemplate.map(field => (
                <div key={field.key} className="field-mapping-item">
                  <label htmlFor={`field-${field.key}`}>
                    {field.label}
                    {field.required && <span className="required"> *</span>}
                    <span className="field-type">({field.type})</span>
                  </label>
                  <input
                    type="text"
                    id={`field-${field.key}`}
                    value={fieldMappings[field.key] || ''}
                    onChange={(e) => handleFieldMappingChange(field.key, e.target.value)}
                    placeholder={field.type === 'html' ? '例如：section 或 <section>...</section>' : field.type === 'text' ? '例如：p 或 <p>...</p>' : '例如：#id-name 或 .class-name'}
                    required={field.required}
                    disabled={loading}
                  />
                  <small className="field-hint">
                    {field.type === 'html' && '可以输入CSS选择器或HTML片段，系统将提取完整的HTML内容（保留格式）'}
                    {field.type === 'text' && '可以输入CSS选择器或HTML片段，系统将提取纯文本内容'}
                    {field.type === 'image' && '可以输入CSS选择器或HTML片段，系统将提取第一个匹配的图片URL'}
                    {field.type === 'images' && '可以输入CSS选择器或HTML片段，系统将提取所有匹配的图片URL（数组）'}
                    {field.type === 'number' && '可以输入CSS选择器或HTML片段，系统将提取数字'}
                    {field.type === 'date' && '可以输入CSS选择器或HTML片段，系统将尝试解析日期'}
                    {field.type === 'json' && '可以输入CSS选择器或HTML片段，系统将尝试解析JSON数据'}
                  </small>
                </div>
              ))}
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="error-message" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <strong>错误信息：</strong>
              <br />
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '正在抓取...' : '开始抓取'}
            </button>
          </div>
        </form>

        {/* 抓取结果 */}
        {result && (
          <div className="scraper-result">
            <h2>抓取结果</h2>
            {result.success ? (
              <div className="success-message">
                <p>✅ 抓取成功！</p>
                <p>已保存到数据库，ID: {result.dataId}</p>
                <pre className="result-data">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="error-message">
                <p>❌ 抓取失败</p>
                <p>{result.message}</p>
                {result.debugInfo && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#fff3cd', borderRadius: '4px' }}>
                    <strong>调试信息：</strong>
                    <pre style={{ marginTop: '8px', fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
                      {JSON.stringify(result.debugInfo, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeChatScraper;
