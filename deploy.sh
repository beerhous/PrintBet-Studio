#!/bin/bash

# PrintBet Studio 部署脚本

set -e

echo "🎯 PrintBet Studio 部署脚本"
echo "==============================="

# 检查环境
command -v node >/dev/null 2>&1 || { echo "❌ Node.js 未安装"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm 未安装"; exit 1; }

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 安装根目录依赖
echo -e "${BLUE}📦 安装根目录依赖...${NC}"
npm install

# 安装后端依赖
echo -e "${BLUE}📦 安装后端依赖...${NC}"
cd backend
npm install
cd ..

# 安装前端依赖
echo -e "${BLUE}📦 安装前端依赖...${NC}"
cd frontend
npm install
cd ..

# 安装测试依赖
echo -e "${BLUE}📦 安装测试依赖...${NC}"
cd tests
npm install
cd ..

# 创建必要的目录
echo -e "${BLUE}📁 创建必要目录...${NC}"
mkdir -p backend/uploads
mkdir -p logs

# 运行测试
echo -e "${YELLOW}🧪 运行测试...${NC}"
cd tests
npm test
cd ..

# 构建前端
echo -e "${BLUE}🔨 构建前端...${NC}"
cd frontend
npm run build
cd ..

# 生成示例
echo -e "${BLUE}✨ 生成示例投注单...${NC}"
cd tests
npm run test:examples
cd ..

# 启动应用
echo -e "${GREEN}🚀 启动应用...${NC}"

# 启动后端（后台运行）
cd backend
nohup npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ 后端已启动 (PID: $BACKEND_PID)${NC}"
cd ..

# 等待后端启动
sleep 5

# 检查后端是否正常运行
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo -e "${GREEN}✅ 后端健康检查通过${NC}"
else
    echo -e "${RED}❌ 后端启动失败${NC}"
    exit 1
fi

# 启动前端（开发模式）
cd frontend
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ 前端已启动 (PID: $FRONTEND_PID)${NC}"
cd ..

echo ""
echo -e "${GREEN}🎉 PrintBet Studio 部署完成！${NC}"
echo "==============================="
echo -e "🌐 前端地址: ${BLUE}http://localhost:3000${NC}"
echo -e "🔌 API地址: ${BLUE}http://localhost:5000${NC}"
echo -e "📊 健康检查: ${BLUE}http://localhost:5000/api/health${NC}"
echo ""
echo "📋 使用说明:"
echo "1. 打开浏览器访问 http://localhost:3000"
echo "2. 上传投注单图片进行OCR识别"
echo "3. 编辑投注内容并生成打印指令"
echo "4. 发送打印任务到打印机"
echo ""
echo "🔧 管理命令:"
echo "  查看后端日志: tail -f logs/backend.log"
echo "  查看前端日志: tail -f logs/frontend.log"
echo "  停止后端: kill $BACKEND_PID"
echo "  停止前端: kill $FRONTEND_PID"
echo ""
echo -e "${YELLOW}💡 提示: 示例投注单已生成在 tests/examples/ 目录${NC}"