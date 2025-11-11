import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import { FaCloudUploadAlt, FaCamera, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { api } from '../services/api';

const UploadContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const UploadTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DropzoneArea = styled.div`
  border: 2px dashed ${props => props.isDragActive ? '#007BFF' : '#ccc'};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.isDragActive ? '#f0f8ff' : '#fafafa'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #007BFF;
    background: #f0f8ff;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: #007BFF;
  margin-bottom: 16px;
`;

const UploadText = styled.div`
  font-size: 16px;
  color: #666;
  margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
  font-size: 14px;
  color: #999;
`;

const OCRResult = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007BFF;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ResultTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const Confidence = styled.span`
  font-size: 12px;
  color: ${props => props.confidence > 0.9 ? '#28a745' : props.confidence > 0.7 ? '#ffc107' : '#dc3545'};
  font-weight: 600;
`;

const ResultContent = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const Button = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: #007BFF;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #545b62;
    }
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007BFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const OCRUploader = ({ onOCRResult, disabled }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOCRResult] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setOCRResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setOCRResult(response.data);
        
        // 自动应用识别结果
        if (onOCRResult) {
          onOCRResult(response.data);
        }
      } else {
        toast.error('OCR识别失败: ' + response.data.message);
      }
    } catch (error) {
      console.error('OCR upload error:', error);
      toast.error('上传失败: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsProcessing(false);
    }
  }, [onOCRResult]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: disabled || isProcessing
  });

  const handleApplyResult = () => {
    if (ocrResult && onOCRResult) {
      onOCRResult(ocrResult);
      toast.success('识别结果已应用');
    }
  };

  const handleClearResult = () => {
    setOCRResult(null);
    toast.info('识别结果已清除');
  };

  return (
    <UploadContainer>
      <UploadTitle>
        <FaCamera />
        OCR智能识别
      </UploadTitle>

      <DropzoneArea 
        {...getRootProps()} 
        isDragActive={isDragActive}
        disabled={disabled || isProcessing}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <LoadingOverlay>
            <LoadingSpinner />
          </LoadingOverlay>
        ) : (
          <>
            <UploadIcon>
              {isDragActive ? <FaImage /> : <FaCloudUploadAlt />}
            </UploadIcon>
            <UploadText>
              {isDragActive ? '释放鼠标上传文件' : '点击或拖拽上传投注单图片'}
            </UploadText>
            <UploadSubtext>
              支持 JPG、PNG、GIF 格式，最大 10MB
            </UploadSubtext>
          </>
        )}
      </DropzoneArea>

      {ocrResult && (
        <OCRResult>
          <ResultHeader>
            <ResultTitle>识别结果</ResultTitle>
            <Confidence confidence={ocrResult.confidence}>
              置信度: {(ocrResult.confidence * 100).toFixed(1)}%
            </Confidence>
          </ResultHeader>
          
          <ResultContent>
            {ocrResult.rawText}
          </ResultContent>

          <ActionButtons>
            <Button 
              className="primary" 
              onClick={handleApplyResult}
              disabled={isProcessing}
            >
              应用结果
            </Button>
            <Button 
              className="secondary" 
              onClick={handleClearResult}
              disabled={isProcessing}
            >
              清除
            </Button>
          </ActionButtons>
        </OCRResult>
      )}
    </UploadContainer>
  );
};

export default OCRUploader;