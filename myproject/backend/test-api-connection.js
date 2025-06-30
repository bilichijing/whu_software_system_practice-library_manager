const axios = require('axios');
const apiConfig = require('./config/api-config');

// 测试学校图书馆API连接
async function testLibraryApiConnection() {
  console.log('🔍 开始测试学校图书馆API连接...\n');
  
  const client = axios.create({
    baseURL: apiConfig.libraryApiBaseUrl,
    timeout: 10000,
    headers: {
      ...apiConfig.requestConfig.headers,
      'Authorization': `Bearer ${apiConfig.apiKey}`,
      'X-API-Secret': apiConfig.apiSecret
    }
  });

  try {
    // 测试1: 检查API基础连接
    console.log('📡 测试1: 检查API基础连接...');
    const response = await client.get('/health');
    console.log('✅ API基础连接成功');
    console.log('   响应状态:', response.status);
    console.log('   响应数据:', response.data);
    
  } catch (error) {
    console.log('❌ API基础连接失败');
    console.log('   错误信息:', error.message);
    
    if (error.response) {
      console.log('   状态码:', error.response.status);
      console.log('   响应数据:', error.response.data);
    }
  }

  try {
    // 测试2: 获取房间信息
    console.log('\n📡 测试2: 获取房间信息...');
    const roomsResponse = await client.get(apiConfig.endpoints.rooms);
    console.log('✅ 获取房间信息成功');
    console.log('   房间数量:', roomsResponse.data.length || 0);
    
  } catch (error) {
    console.log('❌ 获取房间信息失败');
    console.log('   错误信息:', error.message);
  }

  try {
    // 测试3: 获取座位信息
    console.log('\n📡 测试3: 获取座位信息...');
    const seatsResponse = await client.get(apiConfig.endpoints.seats);
    console.log('✅ 获取座位信息成功');
    console.log('   座位数量:', seatsResponse.data.length || 0);
    
  } catch (error) {
    console.log('❌ 获取座位信息失败');
    console.log('   错误信息:', error.message);
  }

  console.log('\n📊 测试总结:');
  console.log('   API基础URL:', apiConfig.libraryApiBaseUrl);
  console.log('   是否启用API:', process.env.USE_LIBRARY_API === 'true' ? '是' : '否');
  console.log('   API密钥配置:', apiConfig.apiKey ? '已配置' : '未配置');
  console.log('   API密钥配置:', apiConfig.apiSecret ? '已配置' : '未配置');
}

// 测试本地数据库连接
function testLocalDatabase() {
  console.log('\n🔍 开始测试本地数据库连接...\n');
  
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
      console.log('❌ 本地数据库连接失败');
      console.log('   错误信息:', err.message);
    } else {
      console.log('✅ 本地数据库连接成功');
      
      // 测试查询
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
          console.log('❌ 本地数据库查询失败');
          console.log('   错误信息:', err.message);
        } else {
          console.log('✅ 本地数据库查询成功');
          console.log('   用户数量:', row.count);
        }
        db.close();
      });
    }
  });
}

// 主函数
async function main() {
  console.log('🚀 图书馆座位预约系统 - API连接测试\n');
  
  // 测试本地数据库
  testLocalDatabase();
  
  // 如果配置了学校API，则测试API连接
  if (process.env.USE_LIBRARY_API === 'true') {
    await testLibraryApiConnection();
  } else {
    console.log('\n📝 提示: 学校图书馆API未启用');
    console.log('   要启用API测试，请设置环境变量: USE_LIBRARY_API=true');
  }
  
  console.log('\n✨ 测试完成！');
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testLibraryApiConnection,
  testLocalDatabase
}; 