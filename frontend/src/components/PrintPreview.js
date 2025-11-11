import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPrint, FaEye, FaCog } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { api } from '../services/api';

const PreviewContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrintSettings = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: #666;
`;

const Select = styled.select`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007BFF;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007BFF;
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const PreviewArea = styled.div`
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #fafafa;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  min-height: 200px;
`;

const EmptyPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

const Button = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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

  &:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
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
  border-radius: 12px;
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

const PrintPreview = ({ betData, onPrint, disabled }) => {
  const [previewData, setPreviewData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    printerId: 'PRN001',
    paperWidth: 58,
    copies: 1,
    fontSize: 'normal',
    align: 'left'
  });

  // 当投注数据变化时更新预览
  useEffect(() => {
    if (betData && betData.bets && betData.bets.length > 0) {
      generatePreview();
    } else {
      setPreviewData(null);
    }
  }, [betData, printSettings]);

  const generatePreview = async () => {
    if (!betData || !betData.bets || betData.bets.length === 0) {
      return;
    }

    setIsGenerating(true);

    try {
      // 创建投注单
      const createResult = await api.post('/api/bet/create', betData);
      
      if (createResult.data.success) {
        const { textSlip, encodeSlip } = createResult.data;
        
        // 生成预览数据
        const previewResult = await api.post('/api/print/preview', {
          textSlip,
          encodeSlip,
          paperWidth: printSettings.paperWidth,
          fontSize: printSettings.fontSize,
          align: printSettings.align
        });

        if (previewResult.data.success) {
          setPreviewData({
            ...previewResult.data,
            textSlip,
            encodeSlip
          });
        }
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      toast.error('生成预览失败: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!previewData || !onPrint) return;

    try {
      // 生成ESC/POS数据
      const escposResult = await api.post('/api/print/generate', {
        textSlip: previewData.textSlip,
        encodeSlip: previewData.encodeSlip,
        paperWidth: printSettings.paperWidth,
        fontSize: printSettings.fontSize,
        align: printSettings.align
      });

      if (escposResult.data.success) {
        // 调用父组件的打印函数
        onPrint({
          ...printSettings,
          escposBase64: escposResult.data.escposBase64
        });
      } else {
        toast.error('生成打印数据失败');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('打印失败: ' + error.message);
    }
  };

  const handleSettingChange = (field, value) => {
    setPrintSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestPrint = async () => {
    try {
      const testResult = await api.post('/api/print/test', {
        printerId: printSettings.printerId,
        paperWidth: printSettings.paperWidth
      });

      if (testResult.data.success) {
        toast.success('测试页已发送');
      } else {
        toast.error('测试打印失败: ' + testResult.data.message);
      }
    } catch (error) {
      console.error('Test print error:', error);
      toast.error('测试打印失败: ' + error.message);
    }
  };

  return (
    <PreviewContainer style={{ position: 'relative' }}>
      {disabled && (
        <LoadingOverlay>
          <LoadingSpinner />
        </LoadingOverlay>
      )}

      <PreviewHeader>
        <PreviewTitle>
          <FaEye />
          打印预览
        </PreviewTitle>
      </PreviewHeader>

      <PrintSettings>
        <SettingGroup>
          <Label>打印机</Label>
          <Select
            value={printSettings.printerId}
            onChange={(e) => handleSettingChange('printerId', e.target.value)}
            disabled={disabled}
          >
            <option value="PRN001">默认58mm打印机</option>
            <option value="PRN002">网络80mm打印机</option>
          </Select>
        </SettingGroup>

        <SettingGroup>
          <Label>纸张宽度</Label>
          <Select
            value={printSettings.paperWidth}
            onChange={(e) => handleSettingChange('paperWidth', parseInt(e.target.value))}
            disabled={disabled}
          >
            <option value={58}>58mm</option>
            <option value={80}>80mm</option>
          </Select>
        </SettingGroup>

        <SettingGroup>
          <Label>份数</Label>
          <Input
            type="number"
            min="1"
            max="10"
            value={printSettings.copies}
            onChange={(e) => handleSettingChange('copies', parseInt(e.target.value) || 1)}
            disabled={disabled}
          />
        </SettingGroup>
      </PrintSettings>

      <PreviewArea>
        {previewData ? (
          previewData.preview
        ) : (
          <EmptyPreview>
            暂无投注单数据
          </EmptyPreview>
        )}
      </PreviewArea>

      <ActionButtons>
        <Button 
          className="secondary" 
          onClick={handleTestPrint}
          disabled={disabled}
        >
          <FaCog />
          测试打印
        </Button>
        
        <Button 
          className="primary" 
          onClick={handlePrint}
          disabled={disabled || !previewData}
        >
          <FaPrint />
          打印
        </Button>
      </ActionButtons>
    </PreviewContainer>
  );
};

export default PrintPreview;