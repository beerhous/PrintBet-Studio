/**
 * ESC/POS 打印引擎
 * 支持58mm和80mm热敏打印机
 */

class PrintEngine {
  constructor() {
    this.printers = new Map();
    this.initializeDefaultPrinters();
  }

  // 初始化默认打印机配置
  initializeDefaultPrinters() {
    this.printers.set('PRN001', {
      id: 'PRN001',
      name: '默认58mm打印机',
      type: 'thermal',
      interface: 'usb',
      paperWidth: 58,
      status: 'online',
      isDefault: true
    });

    this.printers.set('PRN002', {
      id: 'PRN002', 
      name: '网络80mm打印机',
      type: 'thermal',
      interface: 'network',
      ip: '192.168.1.100',
      port: 9100,
      paperWidth: 80,
      status: 'online'
    });
  }

  // ESC/POS 指令定义
  get ESC() {
    return {
      // 初始化
      INIT: '\x1B\x40',
      
      // 对齐方式
      ALIGN_LEFT: '\x1B\x61\x00',
      ALIGN_CENTER: '\x1B\x61\x01', 
      ALIGN_RIGHT: '\x1B\x61\x02',
      
      // 字体大小
      FONT_NORMAL: '\x1B\x21\x00',
      FONT_DOUBLE_HEIGHT: '\x1B\x21\x10',
      FONT_DOUBLE_WIDTH: '\x1B\x21\x20',
      FONT_DOUBLE_BOTH: '\x1B\x21\x30',
      
      // 字体样式
      BOLD_ON: '\x1B\x45\x01',
      BOLD_OFF: '\x1B\x45\x00',
      
      // 行间距
      LINE_SPACING_DEFAULT: '\x1B\x32',
      LINE_SPACING_SET: '\x1B\x33',
      
      // 切纸
      CUT_PARTIAL: '\x1D\x56\x01',
      CUT_FULL: '\x1D\x56\x00',
      
      // 打开钱箱
      CASH_DRAWER: '\x1B\x70\x00\x19\xFA',
      
      // 条码
      BARCODE_HEIGHT: '\x1D\x68',
      BARCODE_WIDTH: '\x1D\x77',
      BARCODE_FONT: '\x1D\x66',
      BARCODE_PRINT: '\x1D\x6B'
    };
  }

  // 生成ESC/POS打印指令
  generateESCPos(options) {
    const {
      textSlip,
      encodeSlip,
      paperWidth = 58,
      fontSize = 'normal',
      align = 'left'
    } = options;

    let commands = [];
    
    // 1. 初始化打印机
    commands.push(this.ESC.INIT);
    
    // 2. 设置对齐方式
    switch (align) {
      case 'center':
        commands.push(this.ESC.ALIGN_CENTER);
        break;
      case 'right':
        commands.push(this.ESC.ALIGN_RIGHT);
        break;
      default:
        commands.push(this.ESC.ALIGN_LEFT);
    }
    
    // 3. 设置字体大小
    switch (fontSize) {
      case 'double':
        commands.push(this.ESC.FONT_DOUBLE_BOTH);
        break;
      case 'large':
        commands.push(this.ESC.FONT_DOUBLE_HEIGHT);
        break;
      default:
        commands.push(this.ESC.FONT_NORMAL);
    }
    
    // 4. 打印标题（加粗）
    commands.push(this.ESC.BOLD_ON);
    commands.push('彩票投注单\n');
    commands.push(this.ESC.BOLD_OFF);
    
    // 5. 打印分隔线
    commands.push(this.generateSeparator(paperWidth));
    
    // 6. 打印投注内容
    const lines = textSlip.split('\n');
    lines.forEach(line => {
      if (line.startsWith('#投注单')) {
        // 跳过标题，已经打印
        return;
      }
      
      if (line.startsWith('@')) {
        // 结束符，打印分隔线
        commands.push(this.generateSeparator(paperWidth));
      } else if (line.startsWith('ENCODE=')) {
        // 打印机器编码（居中，加粗）
        commands.push(this.ESC.ALIGN_CENTER);
        commands.push(this.ESC.BOLD_ON);
        commands.push(line + '\n');
        commands.push(this.ESC.BOLD_OFF);
        commands.push(this.ESC.ALIGN_LEFT);
      } else {
        // 普通文本
        commands.push(line + '\n');
      }
    });
    
    // 7. 打印二维码（如果encodeSlip存在）
    if (encodeSlip) {
      commands.push('\n');
      commands.push(this.ESC.ALIGN_CENTER);
      commands.push('扫码兑奖\n');
      // 这里可以添加二维码生成指令
    }
    
    // 8. 切纸
    commands.push('\n\n\n'); // 留出足够的空白
    commands.push(this.ESC.CUT_PARTIAL);
    
    // 9. 组合所有指令
    const escposString = commands.join('');
    
    // 转换为Base64和Hex
    const buffer = Buffer.from(escposString, 'utf8');
    const base64 = buffer.toString('base64');
    const hex = buffer.toString('hex').toUpperCase();
    
    return {
      base64,
      hex,
      string: escposString,
      length: buffer.length,
      preview: this.generatePreview(textSlip, encodeSlip, paperWidth)
    };
  }

  // 生成分隔线
  generateSeparator(paperWidth) {
    const width = paperWidth === 80 ? 32 : 24;
    return '-'.repeat(width) + '\n';
  }

  // 生成文本预览
  generatePreview(textSlip, encodeSlip, paperWidth = 58) {
    const lines = textSlip.split('\n');
    const preview = [];
    const width = paperWidth === 80 ? 32 : 24;
    
    preview.push('┌' + '─'.repeat(width - 2) + '┐');
    
    lines.forEach(line => {
      if (line.startsWith('#投注单')) {
        preview.push('│' + '彩票投注单'.padStart((width - 2 + '彩票投注单'.length) / 2).padEnd(width - 2) + '│');
      } else if (line.startsWith('@')) {
        preview.push('└' + '─'.repeat(width - 2) + '┘');
      } else if (line.startsWith('ENCODE=')) {
        preview.push('│' + line.substring(7).padStart((width - 2 + line.substring(7).length) / 2).padEnd(width - 2) + '│');
      } else if (line.trim()) {
        preview.push('│' + line.padEnd(width - 2) + '│');
      } else {
        preview.push('│' + ' '.repeat(width - 2) + '│');
      }
    });
    
    return preview.join('\n');
  }

  // 获取打印机列表
  async getPrinters() {
    return Array.from(this.printers.values());
  }

  // 获取打印机状态
  async getPrinterStatus(printerId) {
    const printer = this.printers.get(printerId);
    if (!printer) {
      throw new Error('Printer not found');
    }
    
    // 模拟状态检查
    return {
      online: printer.status === 'online',
      ready: printer.status === 'online',
      paperOut: false,
      coverOpen: false,
      cutterError: false,
      status: printer.status
    };
  }

  // 测试打印机
  async testPrinter(options) {
    const { printerId, paperWidth = 58 } = options;
    
    try {
      const status = await this.getPrinterStatus(printerId);
      
      if (!status.online) {
        return {
          success: false,
          message: '打印机离线',
          printerStatus: status
        };
      }

      // 生成测试页
      const testText = `#测试页
TIME=${new Date().toLocaleString()}
打印机测试
打印机ID:${printerId}
纸张宽度:${paperWidth}mm
测试成功！
@
`;

      const escposData = this.generateESCPos({
        textSlip: testText,
        paperWidth
      });

      // 这里应该实际发送给打印机
      console.log('Test print data generated:', escposData.length, 'bytes');

      return {
        success: true,
        message: '测试页已发送',
        printerStatus: status,
        jobId: 'TEST_' + Date.now()
      };

    } catch (error) {
      return {
        success: false,
        message: error.message,
        printerStatus: { online: false, status: 'error' }
      };
    }
  }

  // 执行打印
  async print(options) {
    const { 
      printerId, 
      escposData, 
      copies = 1,
      paperWidth = 58,
      cutPaper = true 
    } = options;

    try {
      // 验证打印机状态
      const status = await this.getPrinterStatus(printerId);
      
      if (!status.online) {
        return {
          success: false,
          message: '打印机离线',
          printerStatus: status
        };
      }

      if (status.paperOut) {
        return {
          success: false,
          message: '打印机缺纸',
          printerStatus: status
        };
      }

      // 解码ESC/POS数据
      let buffer;
      if (typeof escposData === 'string') {
        // Base64格式
        if (escposData.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
          buffer = Buffer.from(escposData, 'base64');
        } else {
          // Hex格式
          buffer = Buffer.from(escposData, 'hex');
        }
      } else {
        buffer = Buffer.from(escposData);
      }

      // 这里应该实际发送给打印机
      console.log(`Printing to ${printerId}:`, buffer.length, 'bytes, copies:', copies);

      // 模拟打印延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        message: '打印任务已发送',
        jobId: 'JOB_' + Date.now(),
        printerStatus: status,
        details: {
          dataLength: buffer.length,
          copies,
          paperWidth,
          cutPaper
        }
      };

    } catch (error) {
      console.error('Print error:', error);
      return {
        success: false,
        message: error.message,
        printerStatus: { online: false, status: 'error' }
      };
    }
  }

  // 添加打印机
  addPrinter(printerConfig) {
    const id = printerConfig.id || 'PRN_' + Date.now();
    this.printers.set(id, {
      id,
      ...printerConfig,
      status: 'online'
    });
    return id;
  }

  // 移除打印机
  removePrinter(printerId) {
    return this.printers.delete(printerId);
  }
}

module.exports = PrintEngine;