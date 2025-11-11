/**
 * OCR引擎封装
 * 基于Umi-OCR实现投注单识别
 */

const { PythonShell } = require('python-shell');
const fs = require('fs-extra');
const path = require('path');

class OCREngine {
  constructor() {
    this.isInitialized = false;
    this.config = {
      umiOcrPath: path.join(__dirname, '../umi-ocr'),
      modelPath: path.join(__dirname, '../models'),
      confidenceThreshold: 0.8,
      languages: ['ch', 'en'],
      timeout: 30000
    };
  }

  // 初始化OCR引擎
  async initialize() {
    try {
      console.log('Initializing OCR Engine...');
      
      // 检查Umi-OCR路径
      if (!await fs.pathExists(this.config.umiOcrPath)) {
        console.warn('Umi-OCR path not found, using mock mode');
        this.isInitialized = true;
        return { success: true, mode: 'mock' };
      }

      // 检查模型文件
      if (!await fs.pathExists(this.config.modelPath)) {
        await fs.ensureDir(this.config.modelPath);
      }

      this.isInitialized = true;
      console.log('OCR Engine initialized successfully');
      
      return { 
        success: true, 
        mode: 'production',
        config: this.config 
      };

    } catch (error) {
      console.error('OCR initialization error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // 识别图片
  async recognize(imagePath, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!await fs.pathExists(imagePath)) {
        throw new Error('Image file not found: ' + imagePath);
      }

      // 检查图片格式
      const ext = path.extname(imagePath).toLowerCase();
      const supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff'];
      
      if (!supportedFormats.includes(ext)) {
        throw new Error('Unsupported image format: ' + ext);
      }

      // 在生产环境中调用真实的OCR引擎
      if (await fs.pathExists(this.config.umiOcrPath)) {
        return await this.callUmiOCR(imagePath, options);
      } else {
        // 在开发环境中返回模拟结果
        return await this.mockRecognize(imagePath, options);
      }

    } catch (error) {
      console.error('OCR recognition error:', error);
      return {
        success: false,
        error: error.message,
        text: '',
        confidence: 0
      };
    }
  }

  // 调用Umi-OCR
  async callUmiOCR(imagePath, options) {
    try {
      const pythonOptions = {
        mode: 'text',
        pythonPath: 'python',
        pythonOptions: ['-u'],
        scriptPath: this.config.umiOcrPath,
        args: [
          '--image', imagePath,
          '--lang', this.config.languages.join(','),
          '--confidence', this.config.confidenceThreshold.toString()
        ]
      };

      // 如果有额外的OCR选项，添加到参数中
      if (options.detection) {
        pythonOptions.args.push('--detection', options.detection);
      }
      
      if (options.recognition) {
        pythonOptions.args.push('--recognition', options.recognition);
      }

      const result = await PythonShell.run('umi_ocr.py', pythonOptions);
      
      // 解析OCR结果
      const ocrOutput = result.join('\n');
      return this.parseOCRResult(ocrOutput);

    } catch (error) {
      console.error('Umi-OCR call error:', error);
      return {
        success: false,
        error: error.message,
        text: '',
        confidence: 0
      };
    }
  }

  // 模拟识别（开发模式）
  async mockRecognize(imagePath, options) {
    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // 根据文件名返回不同的模拟结果
    const filename = path.basename(imagePath).toLowerCase();
    
    if (filename.includes('basketball')) {
      return {
        success: true,
        text: `竞彩篮球
周一001 湖人VS勇士
胜负 主胜
周二002 篮网VS凯尔特人  
胜分差 主胜6-10
周三003 火箭VS雷霆
大小分 大
倍数:10倍
过关方式:3x1`,
        confidence: 0.95,
        blocks: [
          { text: '竞彩篮球', confidence: 0.98, bbox: [0, 0, 100, 30] },
          { text: '周一001 湖人VS勇士', confidence: 0.92, bbox: [0, 40, 200, 70] },
          { text: '胜负 主胜', confidence: 0.95, bbox: [0, 80, 150, 110] }
        ],
        mode: 'mock'
      };
    }
    
    if (filename.includes('football')) {
      return {
        success: true,
        text: `竞彩足球
周四004 曼城VS利物浦
比分 2:1
周五005 皇马VS巴萨
总进球 3球
倍数:5倍
过关方式:2x1`,
        confidence: 0.92,
        blocks: [
          { text: '竞彩足球', confidence: 0.96, bbox: [0, 0, 100, 30] },
          { text: '周四004 曼城VS利物浦', confidence: 0.89, bbox: [0, 40, 220, 70] },
          { text: '比分 2:1', confidence: 0.94, bbox: [0, 80, 120, 110] }
        ],
        mode: 'mock'
      };
    }
    
    if (filename.includes('dlt')) {
      return {
        success: true,
        text: `大乐透
前区:05,12,23,28,35
后区:03,08
追加:是
倍数:2倍`,
        confidence: 0.98,
        blocks: [
          { text: '大乐透', confidence: 0.99, bbox: [0, 0, 80, 30] },
          { text: '前区:05,12,23,28,35', confidence: 0.97, bbox: [0, 40, 250, 70] },
          { text: '后区:03,08', confidence: 0.96, bbox: [0, 80, 150, 110] }
        ],
        mode: 'mock'
      };
    }

    // 默认模拟结果
    return {
      success: true,
      text: `彩票投注单
竞彩篮球
周一001 湖人VS勇士
胜负 主胜
倍数:1倍`,
      confidence: 0.90 + Math.random() * 0.1,
      blocks: [
        { text: '彩票投注单', confidence: 0.95, bbox: [0, 0, 120, 30] },
        { text: '竞彩篮球', confidence: 0.93, bbox: [0, 40, 100, 70] },
        { text: '周一001 湖人VS勇士', confidence: 0.91, bbox: [0, 80, 200, 110] }
      ],
      mode: 'mock'
    };
  }

  // 解析OCR结果
  parseOCRResult(output) {
    try {
      // 尝试解析JSON格式的输出
      if (output.trim().startsWith('{')) {
        return JSON.parse(output);
      }

      // 解析文本格式的输出
      const lines = output.split('\n').filter(line => line.trim());
      
      let confidence = 0.85;
      let text = output;
      
      // 查找置信度信息
      const confidenceMatch = output.match(/confidence[:\s]+([0-9.]+)/i);
      if (confidenceMatch) {
        confidence = parseFloat(confidenceMatch[1]);
      }

      return {
        success: true,
        text,
        confidence,
        blocks: lines.map((line, index) => ({
          text: line.trim(),
          confidence: confidence - index * 0.01, // 逐行降低置信度
          bbox: [0, index * 30, line.length * 10, (index + 1) * 30]
        })),
        mode: 'production'
      };

    } catch (error) {
      console.error('Parse OCR result error:', error);
      return {
        success: true,
        text: output,
        confidence: 0.8,
        blocks: [],
        mode: 'production'
      };
    }
  }

  // 批量识别
  async batchRecognize(imagePaths, options = {}) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      try {
        const result = await this.recognize(imagePath, options);
        results.push({
          imagePath,
          ...result
        });
      } catch (error) {
        results.push({
          imagePath,
          success: false,
          error: error.message,
          text: '',
          confidence: 0
        });
      }
    }
    
    return results;
  }

  // 获取OCR引擎状态
  getStatus() {
    return {
      initialized: this.isInitialized,
      mode: this.isInitialized ? 
        (fs.existsSync(this.config.umiOcrPath) ? 'production' : 'mock') : 
        'not_initialized',
      config: this.config
    };
  }

  // 配置OCR引擎
  configure(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    return {
      success: true,
      config: this.config
    };
  }

  // 清理资源
  async cleanup() {
    try {
      // 清理临时文件
      const tempDir = path.join(__dirname, '../temp');
      if (await fs.pathExists(tempDir)) {
        await fs.remove(tempDir);
      }
      
      return {
        success: true,
        message: 'OCR engine cleaned up'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = OCREngine;