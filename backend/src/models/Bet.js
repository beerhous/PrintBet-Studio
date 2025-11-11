const moment = require('moment');
const fs = require('fs-extra');
const path = require('path');

class Bet {
  constructor() {
    this.id = null;
    this.playType = null;
    this.playName = null;
    this.passType = null;
    this.bets = [];
    this.multiplier = 1;
    this.totalAmount = 0;
    this.totalBets = 0;
    this.createTime = null;
    this.encode = null;
    this.textSlip = null;
  }

  // 加载映射表
  static loadMappings(playType) {
    const mappingPath = path.join(__dirname, '../../../mappings', `${playType}.json`);
    if (fs.existsSync(mappingPath)) {
      return fs.readJsonSync(mappingPath);
    }
    throw new Error(`Mapping file not found for playType: ${playType}`);
  }

  // 生成场次编码
  static generateMatchCode(weekDay, number) {
    const weekMap = {
      '一': 1, '二': 2, '三': 3, '四': 4, 
      '五': 5, '六': 6, '日': 7
    };
    
    const weekNum = weekMap[weekDay] || 1;
    const matchNum = number.toString().padStart(3, '0');
    return `${weekNum}${matchNum}`;
  }

  // 解析场次字符串
  static parseMatchString(matchStr) {
    const match = matchStr.match(/周([一二三四五六日])(\d{3})/);
    if (match) {
      const [, weekDay, number] = match;
      return {
        weekDay,
        number: parseInt(number),
        code: this.generateMatchCode(weekDay, number)
      };
    }
    return null;
  }

  // 计算注数
  calculateBetCount() {
    if (this.playType === 'basketball' || this.playType === 'football') {
      // 竞彩注数计算
      const betCounts = this.bets.map(bet => {
        if (bet.type === 'BIFEN') {
          // 比分玩法，每个选项算一注
          return bet.choice.split(',').length;
        } else {
          // 其他玩法，每个选项算一注
          return 1;
        }
      });
      
      // 计算过关方式的注数
      const passMatch = this.passType.match(/(\d+)x1/);
      if (passMatch) {
        const passCount = parseInt(passMatch[1]);
        return betCounts.reduce((sum, count) => sum + count, 0);
      }
    } else if (this.playType === 'dlt') {
      // 大乐透注数计算
      return 1; // 简化处理
    } else if (this.playType === 'pls') {
      // 排列三/五注数计算
      return 1; // 简化处理
    }
    
    return this.bets.length;
  }

  // 生成投注单文本
  generateTextSlip() {
    const lines = [];
    lines.push('#投注单');
    lines.push(`TIME=${this.createTime}`);
    lines.push(`PLAY=${this.playName}`);
    lines.push(`PASS=${this.passType}`);
    
    this.bets.forEach(bet => {
      const matchInfo = this.parseMatchString(bet.match);
      const matchCode = matchInfo ? matchInfo.code : bet.match;
      lines.push(`${matchCode}>${bet.type}=${bet.choice}`);
    });
    
    lines.push(`MULTI=${this.multiplier}倍`);
    lines.push(`TOTAL=${this.totalAmount}元`);
    lines.push(`ENCODE=${this.encode}`);
    lines.push('@');
    
    this.textSlip = lines.join('\n');
    return this.textSlip;
  }

  // 生成机器编码
  generateEncode() {
    if (this.playType === 'basketball' || this.playType === 'football') {
      const mappings = Bet.loadMappings(this.playType);
      const encodeParts = [];
      
      this.bets.forEach(bet => {
        const matchInfo = this.parseMatchString(bet.match);
        const matchCode = matchInfo ? matchInfo.code : bet.match;
        
        if (mappings.mappings[bet.type]) {
          const typeMapping = mappings.mappings[bet.type];
          let optionCode = '';
          
          if (bet.type === 'BIFEN') {
            // 比分编码
            if (typeMapping.scoreMapping && typeMapping.scoreMapping[bet.choice]) {
              optionCode = typeMapping.scoreMapping[bet.choice];
            }
          } else {
            // 其他玩法编码
            if (typeMapping.options && typeMapping.options[bet.choice]) {
              optionCode = typeMapping.options[bet.choice];
            }
          }
          
          if (optionCode) {
            encodeParts.push(`${matchCode}|${optionCode}`);
          }
        }
      });
      
      this.encode = encodeParts.join(':');
    } else if (this.playType === 'dlt') {
      // 大乐透编码
      const betData = this.bets[0]; // 大乐透单张投注单
      let encode = 'DLT';
      
      if (betData.front && betData.back) {
        encode += `|FR:${betData.front.join(',')}|BK:${betData.back.join(',')}`;
        encode += `|A:${betData.added || '0'}`;
      }
      
      this.encode = encode;
    } else if (this.playType === 'pls') {
      // 排列三/五编码
      const betData = this.bets[0];
      let encode = betData.gameType === 'pls5' ? 'PL5' : 'PLS';
      
      if (betData.numbers) {
        encode += `|N:${betData.numbers.join(',')}`;
      } else if (betData.sum) {
        encode += `|HZ:${betData.sum}`;
      }
      
      this.encode = encode;
    }
    
    return this.encode;
  }

  // 创建投注单
  static create(data) {
    const bet = new Bet();
    bet.id = require('uuid').v4();
    bet.playType = data.playType;
    bet.playName = data.playName || Bet.loadMappings(data.playType).playName;
    bet.passType = data.passType || '1x1';
    bet.bets = data.bets || [];
    bet.multiplier = data.multiplier || 1;
    bet.createTime = moment().format('YYYY-MM-DD HH:mm:ss');
    
    // 计算注数和金额
    bet.totalBets = bet.calculateBetCount();
    
    // 计算总金额
    if (bet.playType === 'dlt') {
      const mappings = Bet.loadMappings('dlt');
      const added = data.bets[0].added || 0;
      bet.totalAmount = (bet.totalBets * mappings.price.base + 
                        (added ? bet.totalBets * mappings.price.added : 0)) * bet.multiplier;
    } else {
      bet.totalAmount = bet.totalBets * 2 * bet.multiplier; // 默认每注2元
    }
    
    // 生成编码和文本
    bet.generateEncode();
    bet.generateTextSlip();
    
    return bet;
  }

  // 验证投注单数据
  validate() {
    const errors = [];
    
    if (!this.playType) {
      errors.push('彩种类型不能为空');
    }
    
    if (!this.bets || this.bets.length === 0) {
      errors.push('投注内容不能为空');
    }
    
    if (this.multiplier < 1 || this.multiplier > 999) {
      errors.push('倍数必须在1-999之间');
    }
    
    // 验证每个投注项
    this.bets.forEach((bet, index) => {
      if (!bet.match) {
        errors.push(`第${index + 1}注场次不能为空`);
      }
      
      if (!bet.type) {
        errors.push(`第${index + 1}注玩法不能为空`);
      }
      
      if (!bet.choice) {
        errors.push(`第${index + 1}注选项不能为空`);
      }
    });
    
    return errors;
  }

  // 转换为JSON
  toJSON() {
    return {
      id: this.id,
      playType: this.playType,
      playName: this.playName,
      passType: this.passType,
      bets: this.bets,
      multiplier: this.multiplier,
      totalAmount: this.totalAmount,
      totalBets: this.totalBets,
      createTime: this.createTime,
      encode: this.encode,
      textSlip: this.textSlip
    };
  }
}

module.exports = Bet;