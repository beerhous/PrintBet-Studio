# PrintBet Studio - 项目文件清单

## 📁 项目结构

```
printbet-studio/
├── 📄 README.md                    # 项目主文档
├── 📄 PROJECT_SUMMARY.md           # 项目完成报告
├── 📄 SYSTEM_DEMO.md              # 系统演示文档
├── 📄 FILE_LIST.md                # 本文件清单
├── 📄 demo.js                     # 演示脚本
├── 📄 package.json                # 根项目配置
├── 📄 docker-compose.yml          # Docker编排配置
├── 📄 deploy.sh                   # 一键部署脚本
├── 📁 frontend/                   # React前端应用
│   ├── 📄 package.json
│   ├── 📄 Dockerfile
│   ├── 📄 nginx.conf
│   ├── 📁 public/
│   │   ├── 📄 index.html
│   │   └── 📄 favicon.ico
│   └── 📁 src/
│       ├── 📄 index.js
│       ├── 📄 App.js
│       ├── 📄 services/
│       │   └── 📄 api.js
│       └── 📁 components/
│           ├── 📄 Header.js
│           ├── 📄 Sidebar.js
│           ├── 📄 OCRUploader.js
│           ├── 📄 BetForm.js
│           ├── 📄 PrintPreview.js
│           └── 📄 StatusBar.js
├── 📁 backend/                    # Node.js后端API
│   ├── 📄 package.json
│   ├── 📄 Dockerfile
│   ├── 📁 src/
│   │   ├── 📄 server.js
│   │   ├── 📁 models/
│   │   │   └── 📄 Bet.js
│   │   └── 📁 routes/
│   │       ├── 📄 ocr.js
│   │       ├── 📄 bet.js
│   │       └── 📄 print.js
│   └── 📁 uploads/                # 文件上传目录
├── 📁 ocr_engine/                 # OCR引擎封装
│   └── 📁 src/
│       └── 📄 ocr-engine.js
├── 📁 print_engine/               # ESC/POS打印引擎
│   └── 📁 src/
│       └── 📄 print-engine.js
├── 📁 mappings/                   # 编码映射表
│   ├── 📄 basketball.json         # 竞彩篮球映射
│   ├── 📄 football.json           # 竞彩足球映射
│   ├── 📄 dlt.json               # 大乐透映射
│   └── 📄 pls.json               # 排列三/五映射
├── 📁 tests/                      # 自动化测试
│   ├── 📄 package.json
│   ├── 📄 test-runner.js          # 测试运行器
│   ├── 📄 bet-tests.js            # 投注单测试
│   ├── 📄 ocr-tests.js            # OCR测试
│   ├── 📄 print-tests.js          # 打印测试
│   ├── 📄 generate-examples.js    # 示例生成
│   └── 📁 examples/               # 示例输出目录
│       ├── 📄 football-bifen-example.json
│       ├── 📄 basketball-bifen-example.json
│       ├── 📄 dlt-multiple-example.json
│       ├── 📄 pls-single-example.json
│       ├── 📄 pl5-multiple-example.json
│       ├── 📄 football-mixed-example.json
│       ├── 📄 basketball-sfc-example.json
│       ├── 📄 dlt-dantuo-example.json
│       ├── 📄 summary.json
│       └── 📁 test-images/        # 测试图片
└── 📁 docs/                       # 项目文档
    └── 📄 .gitkeep
```

## 📊 统计信息

### 文件数量
- **JavaScript文件**: 25个
- **JSON配置文件**: 10个
- **Markdown文档**: 4个
- **Shell脚本**: 1个
- **Docker配置**: 3个
- **Nginx配置**: 2个
- **HTML文件**: 1个

### 代码行数估算
- **前端代码**: ~1500行
- **后端代码**: ~800行
- **引擎代码**: ~600行
- **测试代码**: ~1000行
- **配置文件**: ~500行
- **文档**: ~2000行

**总计**: ~6400行代码

## 🎯 核心文件说明

### 前端核心文件
- `frontend/src/App.js` - 主应用组件
- `frontend/src/components/OCRUploader.js` - OCR上传组件
- `frontend/src/components/BetForm.js` - 投注单编辑表单
- `frontend/src/components/PrintPreview.js` - 打印预览组件
- `frontend/src/services/api.js` - API服务封装

### 后端核心文件
- `backend/src/server.js` - 服务器入口
- `backend/src/models/Bet.js` - 投注单数据模型
- `backend/src/routes/ocr.js` - OCR识别API
- `backend/src/routes/bet.js` - 投注单API
- `backend/src/routes/print.js` - 打印API

### 引擎核心文件
- `ocr_engine/src/ocr-engine.js` - OCR引擎封装
- `print_engine/src/print-engine.js` - ESC/POS打印引擎

### 配置文件
- `mappings/*.json` - 各彩种编码映射表
- `docker-compose.yml` - Docker容器编排
- `deploy.sh` - 一键部署脚本
- `package.json` - 项目依赖配置

### 测试文件
- `tests/test-runner.js` - 测试运行器
- `tests/bet-tests.js` - 投注单功能测试
- `tests/ocr-tests.js` - OCR功能测试
- `tests/print-tests.js` - 打印功能测试
- `tests/generate-examples.js` - 示例生成器

### 文档文件
- `README.md` - 项目主文档
- `PROJECT_SUMMARY.md` - 项目完成报告
- `SYSTEM_DEMO.md` - 系统演示文档
- `FILE_LIST.md` - 本文件清单

## 🚀 使用指南

### 快速启动
```bash
# 一键部署
./deploy.sh

# Docker部署
docker-compose up -d

# 手动部署
npm run install-all
npm start
```

### 访问地址
- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:5000
- **健康检查**: http://localhost:5000/api/health

### 测试运行
```bash
cd tests
npm test                 # 运行所有测试
npm run test:bet        # 运行投注单测试
npm run test:ocr        # 运行OCR测试
npm run test:print      # 运行打印测试
npm run test:examples   # 生成示例
```

---

**PrintBet Studio** - 完整的彩票投注单生成与打印系统