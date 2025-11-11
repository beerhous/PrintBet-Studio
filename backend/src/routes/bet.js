const express = require('express');
const Bet = require('../models/Bet');

const router = express.Router();

// 创建投注单
router.post('/create', async (req, res) => {
  try {
    const {
      playType,
      passType,
      bets,
      multiplier,
      operatorId
    } = req.body;

    // 验证必填字段
    if (!playType || !bets || !Array.isArray(bets) || bets.length === 0) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: '彩种类型和投注内容不能为空'
      });
    }

    // 创建投注单数据
    const betData = {
      playType,
      passType: passType || '1x1',
      bets,
      multiplier: multiplier || 1,
      operatorId: operatorId || 'OP001'
    };

    // 创建投注单
    const bet = Bet.create(betData);
    
    // 验证投注单
    const validationErrors = bet.validate();
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validationErrors.join(', ')
      });
    }

    console.log('Bet created successfully:', {
      id: bet.id,
      playType: bet.playType,
      totalAmount: bet.totalAmount,
      totalBets: bet.totalBets
    });

    res.json({
      success: true,
      bet: bet.toJSON(),
      textSlip: bet.textSlip,
      encodeSlip: bet.encode,
      totalAmount: bet.totalAmount,
      totalBets: bet.totalBets
    });

  } catch (error) {
    console.error('Create bet error:', error);
    res.status(500).json({
      error: 'Create bet failed',
      message: error.message
    });
  }
});

// 验证投注单
router.post('/validate', (req, res) => {
  try {
    const betData = req.body;
    const bet = Bet.create(betData);
    const errors = bet.validate();
    
    res.json({
      valid: errors.length === 0,
      errors,
      totalAmount: bet.totalAmount,
      totalBets: bet.totalBets
    });
  } catch (error) {
    res.status(400).json({
      error: 'Validation error',
      message: error.message
    });
  }
});

// 计算投注金额
router.post('/calculate', (req, res) => {
  try {
    const { playType, bets, multiplier } = req.body;
    
    // 创建临时投注单用于计算
    const tempBet = Bet.create({
      playType,
      bets: bets || [],
      multiplier: multiplier || 1
    });
    
    res.json({
      totalBets: tempBet.totalBets,
      totalAmount: tempBet.totalAmount,
      pricePerBet: tempBet.totalAmount / (tempBet.totalBets * (multiplier || 1))
    });
  } catch (error) {
    res.status(400).json({
      error: 'Calculation error',
      message: error.message
    });
  }
});

// 获取支持的彩种列表
router.get('/play-types', (req, res) => {
  const playTypes = [
    {
      type: 'basketball',
      name: '竞彩篮球',
      description: '包含胜负、让分胜负、胜分差、大小分、比分等玩法',
      supports: ['single', 'multiple', 'pass']
    },
    {
      type: 'football', 
      name: '竞彩足球',
      description: '包含胜平负、让球胜平负、比分、总进球、半全场等玩法',
      supports: ['single', 'multiple', 'pass']
    },
    {
      type: 'dlt',
      name: '大乐透',
      description: '包含单式、复式、胆拖、追加等玩法',
      supports: ['single', 'multiple', 'dantuo', 'added']
    },
    {
      type: 'pls',
      name: '排列三',
      description: '包含单式、复式、和值等玩法',
      supports: ['single', 'multiple', 'hezhi']
    }
  ];
  
  res.json({
    success: true,
    playTypes
  });
});

// 获取玩法映射表
router.get('/mappings/:playType', (req, res) => {
  try {
    const { playType } = req.params;
    const mappings = Bet.loadMappings(playType);
    
    res.json({
      success: true,
      mappings
    });
  } catch (error) {
    res.status(404).json({
      error: 'Mappings not found',
      message: error.message
    });
  }
});

// 生成示例投注单
router.get('/examples/:playType', (req, res) => {
  const { playType } = req.params;
  let example = null;
  
  switch (playType) {
    case 'basketball':
      example = {
        playType: 'basketball',
        passType: '3x1',
        multiplier: 10,
        bets: [
          { match: '周一001', type: 'SF', choice: '主胜' },
          { match: '周二002', type: 'SFC', choice: '主胜6-10' },
          { match: '周三003', type: 'DXF', choice: '大' }
        ]
      };
      break;
      
    case 'football':
      example = {
        playType: 'football',
        passType: '2x1', 
        multiplier: 5,
        bets: [
          { match: '周四004', type: 'BIFEN', choice: '2:1' },
          { match: '周五005', type: 'TG', choice: '3球' }
        ]
      };
      break;
      
    case 'dlt':
      example = {
        playType: 'dlt',
        multiplier: 2,
        bets: [{
          type: 'multiple',
          front: ['05', '12', '23', '28', '35'],
          back: ['03', '08'],
          added: 1
        }]
      };
      break;
      
    case 'pls':
      example = {
        playType: 'pls',
        multiplier: 1,
        bets: [{
          type: 'single',
          numbers: ['1', '2', '3'],
          gameType: 'pls'
        }]
      };
      break;
  }
  
  if (example) {
    const bet = Bet.create(example);
    res.json({
      success: true,
      example: bet.toJSON()
    });
  } else {
    res.status(404).json({
      error: 'Example not found',
      message: '未找到指定彩种的示例'
    });
  }
});

module.exports = router;