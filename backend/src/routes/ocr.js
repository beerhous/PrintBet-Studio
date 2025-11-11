const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { PythonShell } = require('python-shell');

const router = express.Router();

// 配置multer上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// OCR识别接口
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file uploaded',
        message: '请上传图片文件'
      });
    }

    const imagePath = req.file.path;
    console.log('Processing OCR for image:', imagePath);

    // 调用OCR引擎进行识别
    const ocrResult = await callOCREngine(imagePath);
    
    if (!ocrResult.success) {
      return res.status(500).json({
        error: 'OCR processing failed',
        message: ocrResult.message || 'OCR识别失败'
      });
    }

    // 解析OCR结果
    const parsedResult = parseOCRText(ocrResult.text);
    
    // 清理上传的文件
    setTimeout(() => {
      fs.remove(imagePath).catch(err => {
        console.error('Failed to remove uploaded file:', err);
      });
    }, 5000);

    res.json({
      success: true,
      rawText: ocrResult.text,
      parsed: parsedResult,
      confidence: ocrResult.confidence || 0.95,
      imageUrl: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error('OCR API Error:', error);
    res.status(500).json({
      error: 'OCR processing error',
      message: error.message
    });
  }
});

// 调用OCR引擎
async function callOCREngine(imagePath) {
  try {
    // 这里我们模拟OCR结果，实际项目中应该调用真实的OCR引擎
    // 如Umi-OCR、PaddleOCR等
    
    const mockResults = [
      {
        text: `竞彩篮球
周一001 湖人VS勇士
胜负 主胜
周二002 篮网VS凯尔特人  
胜分差 主胜6-10
周三003 火箭VS雷霆
大小分 大
倍数:10倍
过关方式:3x1`,
        confidence: 0.95
      },
      {
        text: `竞彩足球
周四004 曼城VS利物浦
比分 2:1
周五005 皇马VS巴萨
总进球 3球
倍数:5倍
过关方式:2x1`,
        confidence: 0.92
      },
      {
        text: `大乐透
前区:05,12,23,28,35
后区:03,08
追加:是
倍数:2倍`,
        confidence: 0.98
      }
    ];
    
    // 随机返回一个模拟结果
    const mockResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    return {
      success: true,
      text: mockResult.text,
      confidence: mockResult.confidence
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

// 解析OCR文本
function parseOCRText(text) {
  const results = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // 检测彩种类型
  let playType = '';
  let playName = '';
  
  if (text.includes('竞彩篮球')) {
    playType = 'basketball';
    playName = '竞彩篮球';
  } else if (text.includes('竞彩足球')) {
    playType = 'football';
    playName = '竞彩足球';
  } else if (text.includes('大乐透')) {
    playType = 'dlt';
    playName = '大乐透';
  } else if (text.includes('排列三') || text.includes('排列五')) {
    playType = 'pls';
    playName = text.includes('排列五') ? '排列五' : '排列三';
  }
  
  // 解析倍数
  let multiplier = 1;
  const multiplierMatch = text.match(/倍数[:：]\s*(\d+)倍?/);
  if (multiplierMatch) {
    multiplier = parseInt(multiplierMatch[1]);
  }
  
  // 解析过关方式
  let passType = '1x1';
  const passMatch = text.match(/过关方式[:：]\s*(\d+x\d+)/);
  if (passMatch) {
    passType = passMatch[1];
  }
  
  // 根据彩种解析具体投注内容
  if (playType === 'basketball' || playType === 'football') {
    // 解析竞彩投注
    const matchPattern = /周[一二三四五六日]\d{3}/g;
    const matches = text.match(matchPattern) || [];
    
    matches.forEach(match => {
      const matchIndex = text.indexOf(match);
      const matchText = text.substring(matchIndex, matchIndex + 100); // 取匹配行后100字符
      
      let type = '';
      let choice = '';
      
      if (playType === 'basketball') {
        // 篮球玩法解析
        if (matchText.includes('胜负')) {
          type = 'SF';
          if (matchText.includes('主胜')) choice = '主胜';
          else if (matchText.includes('主负')) choice = '主负';
        } else if (matchText.includes('让分胜负')) {
          type = 'RFSF';
          if (matchText.includes('让分主胜')) choice = '让分主胜';
          else if (matchText.includes('让分客胜')) choice = '让分客胜';
        } else if (matchText.includes('胜分差')) {
          type = 'SFC';
          const sfcMatch = matchText.match(/主胜(\d+-\d+)/);
          if (sfcMatch) choice = `主胜${sfcMatch[1]}`;
          else {
            const sfcMatch2 = matchText.match(/客胜(\d+-\d+)/);
            if (sfcMatch2) choice = `客胜${sfcMatch2[1]}`;
          }
        } else if (matchText.includes('大小分')) {
          type = 'DXF';
          if (matchText.includes('大')) choice = '大';
          else if (matchText.includes('小')) choice = '小';
        } else if (matchText.includes('比分')) {
          type = 'BIFEN';
          const scoreMatch = matchText.match(/(\d+:\d+)/);
          if (scoreMatch) choice = scoreMatch[1];
        }
      } else if (playType === 'football') {
        // 足球玩法解析
        if (matchText.includes('胜平负')) {
          type = 'SPF';
          if (matchText.includes('主胜')) choice = '主胜';
          else if (matchText.includes('平')) choice = '平';
          else if (matchText.includes('客胜')) choice = '客胜';
        } else if (matchText.includes('让球胜平负')) {
          type = 'RQSPF';
          if (matchText.includes('让球主胜')) choice = '让球主胜';
          else if (matchText.includes('让球平')) choice = '让球平';
          else if (matchText.includes('让球客胜')) choice = '让球客胜';
        } else if (matchText.includes('比分')) {
          type = 'BIFEN';
          const scoreMatch = matchText.match(/(\d+:\d+)/);
          if (scoreMatch) choice = scoreMatch[1];
        } else if (matchText.includes('总进球')) {
          type = 'TG';
          const tgMatch = matchText.match(/(\d+)球/);
          if (tgMatch) choice = `${tgMatch[1]}球`;
        } else if (matchText.includes('半全场')) {
          type = 'BQC';
          const bqcMatch = matchText.match(/([胜负平]{2})/);
          if (bqcMatch) {
            const result = bqcMatch[1];
            choice = result.split('').map(c => {
              if (c === '胜') return '胜';
              if (c === '负') return '负';
              return '平';
            }).join('');
          }
        }
      }
      
      if (type && choice) {
        results.push({
          match,
          type,
          choice,
          confidence: 0.9
        });
      }
    });
    
  } else if (playType === 'dlt') {
    // 解析大乐透投注
    const frontMatch = text.match(/前区[:：]\s*([\d,\s]+)/);
    const backMatch = text.match(/后区[:：]\s*([\d,\s]+)/);
    const addedMatch = text.match(/追加[:：]\s*(是|否|Y|N)/i);
    
    if (frontMatch && backMatch) {
      const frontNumbers = frontMatch[1].split(/[,\s]+/).map(n => n.trim()).filter(n => n);
      const backNumbers = backMatch[1].split(/[,\s]+/).map(n => n.trim()).filter(n => n);
      const added = addedMatch ? (addedMatch[1] === '是' || addedMatch[1].toUpperCase() === 'Y' ? '1' : '0') : '0';
      
      results.push({
        type: 'dlt',
        front: frontNumbers,
        back: backNumbers,
        added,
        confidence: 0.95
      });
    }
    
  } else if (playType === 'pls') {
    // 解析排列三/五投注
    const numbersMatch = text.match(/号码[:：]\s*([\d,\s]+)/);
    const sumMatch = text.match(/和值[:：]\s*(\d+)/);
    
    if (numbersMatch) {
      const numbers = numbersMatch[1].split(/[,\s]+/).map(n => n.trim()).filter(n => n);
      results.push({
        type: 'pls',
        gameType: numbers.length === 5 ? 'pls5' : 'pls',
        numbers,
        confidence: 0.95
      });
    } else if (sumMatch) {
      results.push({
        type: 'pls',
        gameType: 'hezhi',
        sum: sumMatch[1],
        confidence: 0.95
      });
    }
  }
  
  return {
    playType,
    playName,
    multiplier,
    passType,
    results
  };
}

module.exports = router;