FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p uploads temp

# 设置权限
RUN chown -R node:node /app

USER node

EXPOSE 5000

CMD ["npm", "start"]