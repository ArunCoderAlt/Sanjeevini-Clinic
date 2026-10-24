import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({
  onImageSelect,
  currentImage,
  label = 'Upload Image',
  onUrlChange,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [mode, setMode] = useState('file'); // 'file' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setPreview(currentImage || null);
    if (currentImage && typeof currentImage === 'string') {
      setUrlInput(currentImage);
    }
  }, [currentImage]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      alert('Please select an image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleUrlSubmit = (url) => {
    setUrlInput(url);
    setPreview(url || null);
    if (onUrlChange) {
      onUrlChange(url);
    }
    if (onImageSelect) {
      onImageSelect(url);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setUrlInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    if (onImageSelect) {
      onImageSelect(null);
    }
    if (onUrlChange) {
      onUrlChange('');
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'file' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              mode === 'url' ? 'bg-white text-gray-800 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Image URL
          </button>
        </div>
      </div>

      {!preview ? (
        mode === 'file' ? (
          <div
            className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#1880B8] bg-[#EAF4EE]'
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-[#1880B8]">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP, GIF, SVG (Up to 10MB)</p>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => handleUrlSubmit(e.target.value)}
                placeholder="https://example.com/photo.jpg or /images/..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#1880B8] focus:border-[#1880B8]"
              />
            </div>
          </div>
        )
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-2 group max-w-sm">
          <img
            src={preview}
            alt="Preview"
            className="max-h-44 w-auto object-contain rounded"
            onError={() => {
              // fallback if invalid url
            }}
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 p-1.5 rounded-full text-red-600 transition-colors shadow-sm cursor-pointer"
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
