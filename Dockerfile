# Cloudtype을 위한 Dockerfile
# server 디렉토리를 작업 디렉토리로 사용

FROM node:24

WORKDIR /app

# server 디렉토리의 package.json 복사
COPY server/package*.json ./

# 의존성 설치
RUN npm install

# server 디렉토리의 모든 파일 복사
COPY server/ .

# 포트 노출
EXPOSE 5003

# 서버 시작
CMD ["npm", "start"]

