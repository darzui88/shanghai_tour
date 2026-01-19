import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { adminUploadImages } from '../../services/api';

const RichTextEditor = ({ value, onChange, guideId }) => {
  const quillRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // 配置图片处理器
      const imageHandler = async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          // 检查guideId是否存在
          if (!guideId) {
            alert('请先保存攻略基本信息，然后再添加图片');
            return;
          }

          await uploadImage(file, quill);
        };
      };

      // 处理剪贴板图片
      const handlePaste = async (e) => {
        const clipboardData = e.clipboardData || e.originalEvent?.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        let hasImage = false;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            e.stopPropagation();
            hasImage = true;
            
            const blob = items[i].getAsFile();
            
            // 检查guideId是否存在
            if (!guideId) {
              alert('请先保存攻略基本信息，然后再粘贴图片');
              return;
            }

            // 将blob转换为File对象
            const file = new File([blob], `paste-${Date.now()}.png`, { 
              type: blob.type || 'image/png' 
            });
            await uploadImage(file, quill);
            break;
          }
        }
      };

      // 添加剪贴板监听
      quill.root.addEventListener('paste', handlePaste);

      // 添加图片按钮处理器
      const toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', imageHandler);

      return () => {
        quill.root.removeEventListener('paste', handlePaste);
      };
    }
  }, [guideId]);

  const uploadImage = async (file, quill) => {
    if (!guideId) {
      alert('请先保存攻略基本信息，然后再添加图片');
      return;
    }

    try {
      setUploading(true);
      
      // 获取当前光标位置
      const range = quill.getSelection(true);
      const index = range ? range.index : quill.getLength();
      
      // 插入临时占位符
      quill.insertText(index, '\n[上传中...]\n', 'user');
      const placeholderIndex = index + 1;

      // 上传图片
      const response = await adminUploadImages('guides', guideId, [file]);
      
      if (response.data.files && response.data.files.length > 0) {
        const imageUrl = response.data.files[0].url;
        
        // 删除占位符并插入图片
        quill.deleteText(placeholderIndex - 1, 12); // 删除"\n[上传中...]\n"
        quill.insertEmbed(placeholderIndex - 1, 'image', imageUrl, 'user');
        quill.setSelection(placeholderIndex, 0);
      } else {
        throw new Error('上传失败：未返回图片URL');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败: ' + (error.response?.data?.error || error.message));
      
      // 尝试删除占位符
      try {
        const currentRange = quill.getSelection(true);
        if (currentRange) {
          const content = quill.getText();
          const placeholderPos = content.indexOf('[上传中...]');
          if (placeholderPos !== -1) {
            quill.deleteText(placeholderPos - 1, 12);
          }
        }
      } catch (e) {
        console.error('删除占位符失败:', e);
      }
    } finally {
      setUploading(false);
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  return (
    <div style={{ position: 'relative' }}>
      {uploading && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          上传中...
        </div>
      )}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        style={{ minHeight: '400px' }}
        placeholder="输入攻略内容，支持粘贴图片..."
      />
      <div style={{ 
        marginTop: '10px', 
        fontSize: '12px', 
        color: '#666',
        padding: '8px',
        background: '#f5f5f5',
        borderRadius: '4px'
      }}>
        💡 提示：可以直接从剪贴板粘贴图片，或点击工具栏的图片按钮上传
      </div>
    </div>
  );
};

export default RichTextEditor;
