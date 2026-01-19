const axios = require('axios');

async function testServer() {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    console.log('测试服务器连接...\n');
    
    // 测试健康检查
    console.log('1. 测试健康检查端点...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ 健康检查:', health.data);
    console.log('');
    
    // 测试商品列表
    console.log('2. 测试商品列表...');
    const products = await axios.get(`${baseURL}/products`);
    console.log(`✅ 获取到 ${products.data.products?.length || products.data.length} 个商品`);
    if (products.data.products && products.data.products.length > 0) {
      console.log('   示例商品:', products.data.products[0].name, '- ¥' + products.data.products[0].price);
    }
    console.log('');
    
    // 测试地点列表
    console.log('3. 测试地点列表...');
    const locations = await axios.get(`${baseURL}/locations`);
    console.log(`✅ 获取到 ${locations.data.locations?.length || locations.data.length} 个地点`);
    if (locations.data.locations && locations.data.locations.length > 0) {
      console.log('   示例地点:', locations.data.locations[0].name);
    }
    console.log('');
    
    // 测试活动列表
    console.log('4. 测试活动列表...');
    const events = await axios.get(`${baseURL}/events`);
    console.log(`✅ 获取到 ${events.data.events?.length || events.data.length || 0} 个活动`);
    console.log('');
    
    console.log('✅ 所有测试通过！服务器运行正常！');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ 错误: 无法连接到服务器 (端口 5000)');
      console.error('   请确保服务器正在运行: npm run server');
    } else {
      console.error('❌ 错误:', error.message);
      if (error.response) {
        console.error('   状态码:', error.response.status);
        console.error('   响应:', error.response.data);
      }
    }
    process.exit(1);
  }
}

testServer();
