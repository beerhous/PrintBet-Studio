#!/usr/bin/env node

/**
 * PrintBet Studio 演示脚本
 * 展示系统的核心功能
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🎯 PrintBet Studio - 系统演示\n'));
console.log(chalk.gray('='.repeat(60)));

// 演示投注单生成
async function demonstrateBetGeneration() {
  console.log(chalk.yellow('\n📋 1. 投注单生成演示'));
  
  // 足球比分示例
  const footballBet = {
    playType: 'football',
    playName: '竞彩足球',
    passType: '2x1',
    multiplier: 5,
    bets: [
      { match: '周四004', type: 'BIFEN', choice: '2:1' },
      { match: '周五005', type: 'BIFEN', choice: '1:0' }
    ],
    createTime: '2025-11-11 09:00:00',
    totalBets: 2,
    totalAmount: 20,
    encode: '1004|21:1005|10',
    textSlip: `#投注单
TIME=2025-11-11 09:00:00
PLAY=竞彩足球
PASS=2x1
1004>BIFEN=2:1
1005>BIFEN=1:0
MULTI=5倍
TOTAL=20元
ENCODE=1004|21:1005|10
@`
  };

  console.log(chalk.cyan('   足球比分投注单:'));
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(footballBet.textSlip);
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(chalk.yellow(`   ENCODE: ${footballBet.encode}`));
  console.log(chalk.yellow(`   总金额: ¥${footballBet.totalAmount}`));

  // 篮球比分示例
  const basketballBet = {
    playType: 'basketball',
    playName: '竞彩篮球',
    passType: '3x1',
    multiplier: 10,
    bets: [
      { match: '周一001', type: 'SF', choice: '主胜' },
      { match: '周二002', type: 'BIFEN', choice: '98:95' },
      { match: '周三003', type: 'SFC', choice: '主胜6-10' }
    ],
    createTime: '2025-11-11 09:00:00',
    totalBets: 3,
    totalAmount: 60,
    encode: '1001|3:1002|98:1003|12',
    textSlip: `#投注单
TIME=2025-11-11 09:00:00
PLAY=竞彩篮球
PASS=3x1
1001>SF=主胜
1002>BIFEN=98:95
1003>SFC=主胜6-10
MULTI=10倍
TOTAL=60元
ENCODE=1001|3:1002|98:1003|12
@`
  };

  console.log(chalk.cyan('\n   篮球比分投注单:'));
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(basketballBet.textSlip);
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(chalk.yellow(`   ENCODE: ${basketballBet.encode}`));
  console.log(chalk.yellow(`   总金额: ¥${basketballBet.totalAmount}`));

  // 大乐透复式示例
  const dltBet = {
    playType: 'dlt',
    playName: '大乐透',
    multiplier: 2,
    bets: [{
      type: 'multiple',
      front: ['05', '12', '18', '23', '28', '31', '35'],
      back: ['03', '08', '11'],
      added: 1
    }],
    createTime: '2025-11-11 09:00:00',
    totalBets: 21,
    totalAmount: 126,
    encode: 'DLT|FR:05,12,18,23,28,31,35|BK:03,08,11|A:1',
    textSlip: `#投注单
TIME=2025-11-11 09:00:00
PLAY=大乐透
MULTI=2倍
TOTAL=126元
ENCODE=DLT|FR:05,12,18,23,28,31,35|BK:03,08,11|A:1
@`
  };

  console.log(chalk.cyan('\n   大乐透复式投注单:'));
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(dltBet.textSlip);
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(chalk.yellow(`   ENCODE: ${dltBet.encode}`));
  console.log(chalk.yellow(`   总金额: ¥${dltBet.totalAmount}`));
  console.log(chalk.yellow(`   注数: ${dltBet.totalBets}注`));
}

// 演示ESC/POS打印指令
function demonstrateESCPos() {
  console.log(chalk.yellow('\n🖨️  2. ESC/POS打印指令演示'));
  
  const escposExample = {
    base64: 'JEVTQFBPUyBUZXN0IERhdGE=',
    hex: '1B400A5465737420446174610A',
    preview: `┌─────────────────────────┐
│      彩票投注单          │
├─────────────────────────┤
│TIME=2025-11-11 09:00:00 │
│PLAY=竞彩篮球            │
│PASS=3x1                │
│1001>SF=主胜            │
│MULTI=10倍              │
│TOTAL=60元              │
│1001|3                  │
└─────────────────────────┘`
  };

  console.log(chalk.cyan('   ESC/POS指令示例:'));
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(chalk.yellow('   Base64: '), escposExample.base64);
  console.log(chalk.yellow('   Hex:    '), escposExample.hex);
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(escposExample.preview);
}

// 演示OCR功能
function demonstrateOCR() {
  console.log(chalk.yellow('\n📷 3. OCR识别功能演示'));
  
  const ocrExample = {
    text: `竞彩篮球
周一001 湖人VS勇士
胜负 主胜
周二002 篮网VS凯尔特人  
胜分差 主胜6-10
周三003 火箭VS雷霆
大小分 大
倍数:10倍
过关方式:3x1`,
    parsed: {
      playType: 'basketball',
      multiplier: 10,
      passType: '3x1',
      results: [
        { match: '周一001', type: 'SF', choice: '主胜', confidence: 0.95 },
        { match: '周二002', type: 'SFC', choice: '主胜6-10', confidence: 0.92 },
        { match: '周三003', type: 'DXF', choice: '大', confidence: 0.94 }
      ]
    }
  };

  console.log(chalk.cyan('   OCR识别结果:'));
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(ocrExample.text);
  console.log(chalk.gray('   ' + '-'.repeat(40)));
  console.log(chalk.yellow('   解析结果:'));
  console.log(chalk.white(`   彩种: ${ocrExample.parsed.playType}`));
  console.log(chalk.white(`   倍数: ${ocrExample.parsed.multiplier}倍`));
  console.log(chalk.white(`   过关: ${ocrExample.parsed.passType}`));
  console.log(chalk.white(`   识别到 ${ocrExample.parsed.results.length} 个投注项`));
}

// 演示系统架构
function demonstrateArchitecture() {
  console.log(chalk.yellow('\n🏗️  4. 系统架构演示'));
  
  const architecture = `
┌─────────────────────────────────────────────────────────┐
│                    PrintBet Studio                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   React     │  │   Node.js   │  │    OCR      │     │
│  │  Frontend   │  │   Backend   │  │   Engine    │     │
│  │             │  │             │  │             │     │
│  │ • 上传组件  │  │ • API服务  │  │ • Umi-OCR  │     │
│  │ • 表单编辑  │  │ • 业务逻辑 │  │ • 图像识别 │     │
│  │ • 预览组件  │  │ • 编码生成 │  │ • 文本解析 │     │
│  │ • 打印组件  │  │ • ESC/POS  │  │ • 置信度   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                           │                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Print     │  │   Mapping   │  │    Test     │     │
│  │   Engine    │  │   Tables    │  │   Suite     │     │
│  │             │  │             │  │             │     │
│  │ • 指令生成  │  │ • 篮球映射 │  │ • 单元测试 │     │
│  │ • 格式转换  │  │ • 足球映射 │  │ • 集成测试 │     │
│  │ • 预览生成  │  │ • 数字彩   │  │ • 示例生成 │     │
│  │ • 打印控制  │  │ • 编码规则 │  │ • 性能测试 │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
`;
  
  console.log(architecture);
}

// 演示项目结构
function demonstrateProjectStructure() {
  console.log(chalk.yellow('\n📁 5. 项目结构演示'));
  
  const structure = `
printbet-studio/
├── frontend/              # React前端应用
│   ├── src/
│   │   ├── components/    # UI组件
│   │   ├── services/      # API服务
│   │   └── App.js         # 主应用
│   ├── public/            # 静态资源
│   └── package.json
├── backend/               # Node.js后端
│   ├── src/
│   │   ├── routes/        # API路由
│   │   ├── models/        # 数据模型
│   │   └── server.js      # 服务器
│   └── package.json
├── ocr_engine/            # OCR引擎封装
│   └── src/
│       └── ocr-engine.js  # OCR核心逻辑
├── print_engine/          # 打印引擎
│   └── src/
│       └── print-engine.js # ESC/POS引擎
├── mappings/              # 编码映射表
│   ├── basketball.json    # 篮球映射
│   ├── football.json      # 足球映射
│   ├── dlt.json          # 大乐透映射
│   └── pls.json          # 排列三/五映射
├── tests/                 # 自动化测试
│   ├── test-runner.js     # 测试运行器
│   ├── bet-tests.js       # 投注单测试
│   ├── ocr-tests.js       # OCR测试
│   ├── print-tests.js     # 打印测试
│   └── generate-examples.js # 示例生成
├── examples/              # 示例输出
├── docs/                  # 项目文档
├── docker-compose.yml     # Docker配置
├── deploy.sh             # 部署脚本
└── README.md             # 项目说明
`;
  
  console.log(structure);
}

// 主函数
async function main() {
  try {
    await demonstrateBetGeneration();
    await demonstrateESCPos();
    await demonstrateOCR();
    await demonstrateArchitecture();
    await demonstrateProjectStructure();
    
    console.log(chalk.green.bold('\n🎉 PrintBet Studio 演示完成！'));
    console.log(chalk.gray('='.repeat(60)));
    console.log(chalk.cyan('\n📋 项目特色:'));
    console.log(chalk.white('   • 完整的彩票投注单生成与打印系统'));
    console.log(chalk.white('   • 支持OCR智能识别和手动编辑'));
    console.log(chalk.white('   • 生成标准的ESC/POS打印指令'));
    console.log(chalk.white('   • 专业的店员操作界面'));
    console.log(chalk.white('   • 完整的自动化测试覆盖'));
    console.log(chalk.white('   • 10个完整的示例投注单'));
    console.log(chalk.white('   • 支持多种彩种和玩法'));
    console.log(chalk.cyan('\n🔧 技术栈:'));
    console.log(chalk.white('   • 前端: React + Styled Components'));
    console.log(chalk.white('   • 后端: Node.js + Express'));
    console.log(chalk.white('   • OCR: Umi-OCR封装'));
    console.log(chalk.white('   • 打印: ESC/POS引擎'));
    console.log(chalk.white('   • 测试: Jest + 自定义测试框架'));
    console.log(chalk.cyan('\n📁 示例位置: tests/examples/'));
    console.log(chalk.cyan('🚀 启动方式: ./deploy.sh'));
    console.log(chalk.gray('='.repeat(60)));
    
  } catch (error) {
    console.error(chalk.red('演示出错:'), error.message);
  }
}

// 运行演示
main();