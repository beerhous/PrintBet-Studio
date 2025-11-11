const express = require('express');
const PrintEngine = require('../../print_engine/src/print-engine');

const router = express.Router();

// ESC/POS打印接口
router.post('/send', async (req, res) => {
  try {
    const {
      printerId,
      escposBase64,
      copies = 1,
      paperWidth = 58,
      cutPaper = true
    } = req.body;

    // 验证必填字段
    if (!escposBase64) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: '打印数据不能为空'
      });
    }

    // 创建打印引擎
    const printEngine = new PrintEngine();
    
    // 发送打印任务
    const result = await printEngine.print({
      printerId,
      escposData: escposBase64,
      copies,
      paperWidth,
      cutPaper
    });

    if (result.success) {
      res.json({
        success: true,
        message: '打印任务已发送',
        jobId: result.jobId,
        printerStatus: result.printerStatus
      });
    } else {
      res.status(500).json({
        error: 'Print failed',
        message: result.message || '打印失败',
        printerStatus: result.printerStatus
      });
    }

  } catch (error) {
    console.error('Print API Error:', error);
    res.status(500).json({
      error: 'Print error',
      message: error.message
    });
  }
});

// 生成ESC/POS打印数据
router.post('/generate', (req, res) => {
  try {
    const {
      textSlip,
      encodeSlip,
      paperWidth = 58,
      fontSize = 'normal',
      align = 'left'
    } = req.body;

    if (!textSlip) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: '投注单内容不能为空'
      });
    }

    // 创建打印引擎
    const printEngine = new PrintEngine();
    
    // 生成ESC/POS指令
    const escposData = printEngine.generateESCPos({
      textSlip,
      encodeSlip,
      paperWidth,
      fontSize,
      align
    });

    res.json({
      success: true,
      escposBase64: escposData.base64,
      escposHex: escposData.hex,
      preview: escposData.preview,
      length: escposData.length
    });

  } catch (error) {
    console.error('Generate ESC/POS Error:', error);
    res.status(500).json({
      error: 'Generate failed',
      message: error.message
    });
  }
});

// 获取打印机列表
router.get('/printers', async (req, res) => {
  try {
    const printEngine = new PrintEngine();
    const printers = await printEngine.getPrinters();
    
    res.json({
      success: true,
      printers
    });
  } catch (error) {
    res.status(500).json({
      error: 'Get printers failed',
      message: error.message
    });
  }
});

// 测试打印机连接
router.post('/test', async (req, res) => {
  try {
    const { printerId, paperWidth = 58 } = req.body;
    
    const printEngine = new PrintEngine();
    const result = await printEngine.testPrinter({
      printerId,
      paperWidth
    });
    
    if (result.success) {
      res.json({
        success: true,
        message: '打印机测试成功',
        printerStatus: result.printerStatus
      });
    } else {
      res.status(500).json({
        error: 'Printer test failed',
        message: result.message,
        printerStatus: result.printerStatus
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

// 获取打印机状态
router.get('/status/:printerId', async (req, res) => {
  try {
    const { printerId } = req.params;
    const printEngine = new PrintEngine();
    const status = await printEngine.getPrinterStatus(printerId);
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    res.status(500).json({
      error: 'Get status failed',
      message: error.message
    });
  }
});

// 预览打印效果
router.post('/preview', (req, res) => {
  try {
    const {
      textSlip,
      encodeSlip,
      paperWidth = 58,
      fontSize = 'normal'
    } = req.body;

    if (!textSlip) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: '投注单内容不能为空'
      });
    }

    const printEngine = new PrintEngine();
    const preview = printEngine.generatePreview({
      textSlip,
      encodeSlip,
      paperWidth,
      fontSize
    });

    res.json({
      success: true,
      preview,
      dimensions: {
        width: paperWidth,
        height: preview.length * 0.35 // 估算高度
      }
    });

  } catch (error) {
    console.error('Preview Error:', error);
    res.status(500).json({
      error: 'Preview failed',
      message: error.message
    });
  }
});

module.exports = router;