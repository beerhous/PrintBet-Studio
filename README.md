# PrintBet Studio - 彩票投注单生成与打印系统

## 项目简介

PrintBet Studio 是一个专业的彩票投注单生成与打印系统，支持OCR识别、投注单生成、ESC/POS打印等核心功能。

## 核心功能

- ✅ **OCR识别**: 基于Umi-OCR实现投注单截图自动识别
- ✅ **投注单生成**: 支持竞彩足球、竞彩篮球、大乐透、排列三/五等多种彩种
- ✅ **打印输出**: 生成ESC/POS打印指令，支持58mm/80mm热敏打印机
- ✅ **编码映射**: 可配置的编码映射表，适配不同出票机规范
- ✅ **用户界面**: 专业的店员操作界面，支持快速上传、校对、编辑、打印

## 技术架构

```
printbet-studio/
├── frontend/          # React前端应用
├── backend/           # Node.js后端API
├── ocr_engine/        # OCR识别引擎封装
├── print_engine/      # ESC/POS打印引擎
├── mappings/          # 编码映射表配置
├── tests/             # 自动化测试
└── docs/              # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- Python >= 3.7 (用于OCR引擎)
- Umi-OCR (已集成)

### 一键部署

```bash
# 克隆项目后执行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 手动部署

#### 1. 安装依赖

```bash
# 安装所有依赖
npm run install-all

# 或者分别安装
cd frontend && npm install
cd ../backend && npm install
cd ../tests && npm install
```

#### 2. 运行测试

```bash
cd tests
npm test
```

#### 3. 构建前端

```bash
cd frontend
npm run build
```

#### 4. 启动应用

```bash
# 启动后端
cd backend
npm start &

# 启动前端（开发模式）
cd frontend
npm start
```

### Docker部署

```bash
# 使用Docker Compose部署
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 使用说明

### 1. OCR识别投注单

1. 点击"上传图片"按钮或拖拽图片到上传区域
2. 选择投注单截图或照片（支持JPG、PNG、GIF格式，最大10MB）
3. 系统自动识别并填充投注信息
4. 查看识别结果和置信度，点击"应用结果"填充到投注单

### 2. 手动编辑投注单

1. 在左侧选择彩种类型（竞彩篮球、竞彩足球、大乐透、排列三/五）
2. 在投注表格中填写场次、玩法、选项等信息
3. 系统自动计算注数和金额
4. 支持添加、删除、修改投注项

### 3. 打印投注单

1. 在右侧预览面板选择打印机类型和纸张宽度（58mm/80mm）
2. 设置打印份数（1-10份）
3. 预览打印效果
4. 点击"打印"按钮发送指令到打印机
5. 支持测试打印功能

### 4. 系统状态监控

- 实时显示OCR和打印机状态
- 显示当前总注数和总金额
- 底部状态栏显示系统时间

## 技术架构

### 前端 (React)

- **组件化设计**: 模块化UI组件
- **状态管理**: React Hooks + Context
- **样式方案**: Styled Components
- **文件上传**: React Dropzone
- **通知系统**: React Toastify
- **图标库**: React Icons

### 后端 (Node.js)

- **框架**: Express.js
- **数据库**: 文件系统存储（可扩展）
- **文件上传**: Multer
- **跨域处理**: CORS
- **错误处理**: 统一错误处理中间件

### OCR引擎

- **核心**: Umi-OCR封装
- **支持格式**: JPG, PNG, GIF, BMP
- **识别语言**: 中文、英文
- **置信度**: 可调节阈值（默认0.8）
- **处理模式**: 生产模式 + 模拟模式

### 打印引擎

- **协议**: ESC/POS指令集
- **纸张宽度**: 58mm / 80mm
- **字体大小**: 正常、大、双倍
- **对齐方式**: 左对齐、居中、右对齐
- **切纸指令**: 支持部分切纸和全切纸

## API接口

### OCR识别
```http
POST /api/ocr
Content-Type: multipart/form-data

image: <上传的图片文件>
```

### 创建投注单
```http
POST /api/bet/create
Content-Type: application/json

{
  "playType": "basketball",
  "passType": "3x1",
  "bets": [...],
  "multiplier": 10
}
```

### 打印投注单
```http
POST /api/print/send
Content-Type: application/json

{
  "printerId": "PRN001",
  "escposBase64": "...",
  "copies": 1
}
```

## 编码规范

### 投注单格式
```
#投注单
TIME=2025-11-11 09:00:00
PLAY=竞彩篮球
PASS=3x1
1001>SF=主胜
2002>SFC=主胜6-10
3003>DXF=大
MULTI=10倍
TOTAL=60元
ENCODE=1001|3:2002|12:3003|1
@
```

### 映射表配置

映射表位于 `mappings/` 目录，支持JSON格式配置：
- `basketball.json` - 竞彩篮球玩法映射
- `football.json` - 竞彩足球玩法映射  
- `dlt.json` - 大乐透映射
- `pls.json` - 排列三/五映射

## 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
cd tests && npm test -- --grep "篮球比分"
```

## 功能特性

### 已完成功能

- ✅ **项目骨架搭建** - 完整的项目结构和模块化设计
- ✅ **OCR引擎集成** - 基于Umi-OCR的智能识别系统
- ✅ **投注编码模块** - 支持多种彩种的编码映射
- ✅ **前端UI界面** - React + 现代化UI组件
- ✅ **后端API服务** - Node.js + Express RESTful API
- ✅ **ESC/POS打印模块** - 支持58mm/80mm热敏打印机
- ✅ **自动化测试** - 完整的测试用例和示例生成
- ✅ **示例投注单** - 10个完整的示例，包含足球、篮球、大乐透等

### 核心示例

项目已生成以下三个核心示例：

1. **竞彩足球比分示例** - 包含2:1、1:0等比分投注
2. **竞彩篮球比分示例** - 包含98:95等篮球比分投注  
3. **大乐透复式示例** - 包含7个前区号码、3个后区号码的复式投注

示例文件保存在 `tests/examples/` 目录中，包含：
- 人类可读的textSlip格式
- 机器识别的ENCODE编码
- ESC/POS打印指令（Base64/Hex格式）
- 打印预览效果

### 支持的彩种

- **竞彩篮球**: 胜负、让分胜负、胜分差、大小分、比分
- **竞彩足球**: 胜平负、让球胜平负、比分、总进球、半全场
- **大乐透**: 单式、复式、胆拖、追加
- **排列三/五**: 单式、复式、和值

## 开发计划

- [x] 项目骨架搭建
- [x] OCR引擎集成
- [x] 投注编码模块
- [x] 前端UI界面
- [x] 后端API服务
- [x] ESC/POS打印模块
- [x] 自动化测试
- [x] 示例投注单生成
- [ ] 真实终端适配
- [ ] 多语言支持
- [ ] 云端同步功能
- [ ] 移动端适配

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！