/**
 * MongoDB 컬렉션 초기화 스크립트
 * products 컬렉션을 명시적으로 생성하고 인덱스를 설정합니다.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_ATLAS_URL || 'mongodb://localhost:27017/shopingmall';

const initCollections = async () => {
  try {
    console.log('MongoDB 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    
    console.log(`\n📦 데이터베이스: ${dbName}`);
    console.log('컬렉션 초기화 시작...\n');

    // products 컬렉션 확인 및 생성
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    
    if (!collectionNames.includes('products')) {
      console.log('📝 products 컬렉션 생성 중...');
      await db.createCollection('products');
      console.log('✅ products 컬렉션이 생성되었습니다.');
    } else {
      console.log('✅ products 컬렉션이 이미 존재합니다.');
    }

    // users 컬렉션 확인
    if (!collectionNames.includes('users')) {
      console.log('📝 users 컬렉션 생성 중...');
      await db.createCollection('users');
      console.log('✅ users 컬렉션이 생성되었습니다.');
    } else {
      console.log('✅ users 컬렉션이 이미 존재합니다.');
    }

    // 인덱스 생성
    console.log('\n🔍 인덱스 생성 중...');
    
    const productsCollection = db.collection('products');
    
    // SKU 인덱스 (unique)
    try {
      await productsCollection.createIndex({ sku: 1 }, { unique: true });
      console.log('✅ products.sku 인덱스 생성 완료');
    } catch (err) {
      if (err.code === 85) {
        console.log('ℹ️  products.sku 인덱스가 이미 존재합니다.');
      } else {
        console.log('⚠️  products.sku 인덱스 생성 실패:', err.message);
      }
    }

    // category 인덱스
    try {
      await productsCollection.createIndex({ category: 1 });
      console.log('✅ products.category 인덱스 생성 완료');
    } catch (err) {
      console.log('ℹ️  products.category 인덱스가 이미 존재합니다.');
    }

    // status 인덱스
    try {
      await productsCollection.createIndex({ status: 1 });
      console.log('✅ products.status 인덱스 생성 완료');
    } catch (err) {
      console.log('ℹ️  products.status 인덱스가 이미 존재합니다.');
    }

    // createdAt 인덱스
    try {
      await productsCollection.createIndex({ createdAt: -1 });
      console.log('✅ products.createdAt 인덱스 생성 완료');
    } catch (err) {
      console.log('ℹ️  products.createdAt 인덱스가 이미 존재합니다.');
    }

    // users 컬렉션 인덱스
    const usersCollection = db.collection('users');
    
    try {
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('✅ users.email 인덱스 생성 완료');
    } catch (err) {
      console.log('ℹ️  users.email 인덱스가 이미 존재합니다.');
    }

    console.log('\n✅ 모든 컬렉션과 인덱스가 준비되었습니다!');
    console.log('\n📊 현재 컬렉션 목록:');
    const finalCollections = await db.listCollections().toArray();
    finalCollections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ 작업 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// 스크립트 실행
initCollections();

