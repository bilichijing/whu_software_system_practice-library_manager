const axios = require('axios');

// 配置
const API_BASE_URL = 'http://localhost:3000';

async function clearDatabase() {
  try {
    console.log('开始清空数据库...');
    
    // 调用清空数据库API（开发模式，无需认证）
    console.log('正在清空数据库记录...');
    const clearResponse = await axios.delete(`${API_BASE_URL}/api/dev/clear-data`);
    
    console.log('清空结果:', clearResponse.data);
    console.log('数据库清空成功！');
    
  } catch (error) {
    console.error('清空数据库失败:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.error('API端点不存在，请检查服务器是否运行');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('无法连接到服务器，请确保后端服务器正在运行');
    }
  }
}

// 运行清空操作
clearDatabase(); 