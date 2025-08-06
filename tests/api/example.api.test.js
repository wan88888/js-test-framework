// Node.js 18+ 内置 fetch API，无需引入
const Assert = require('../../utils/Assert.js');

/**
 * API测试示例 - 使用Fetch API进行RESTful API测试
 * 测试目标: 验证API端点的功能、响应格式和错误处理
 */
module.exports = async function(testUtils) {
  console.log('🌐 开始API测试: RESTful API功能验证');
  
  const baseURL = 'https://jsonplaceholder.typicode.com';
  
  // 使用HTTP Agent进行连接复用
  const agent = testUtils ? testUtils.getHttpAgent(baseURL) : null;
  const fetchOptions = agent ? { agent } : {};
  
  try {
    // 测试1: GET请求 - 获取单个资源
    console.log('📥 测试GET请求 - 获取单个用户...');
    const getUserResponse = await fetch(`${baseURL}/users/1`, fetchOptions);
    
    Assert.httpOk(getUserResponse, 'GET请求失败');
    
    const userData = await getUserResponse.json();
    
    // 验证响应数据结构
    const requiredFields = ['id', 'name', 'email', 'username'];
    for (const field of requiredFields) {
      Assert.exists(userData[field], `用户数据缺少必需字段: ${field}`);
    }
    
    // 验证数据类型
    Assert.isNumber(userData.id, '用户ID应为数字');
    Assert.isString(userData.name, '用户名应为字符串');
    Assert.contains(userData.email, '@', '邮箱格式不正确');
    
    console.log(`✓ GET请求成功，用户: ${userData.name} (${userData.email})`);
    
    // 测试2: POST请求 - 创建新资源
    console.log('📤 测试POST请求 - 创建新文章...');
    const newPost = {
      title: 'Test Article from JS Framework',
      body: 'This is a test article created by our JavaScript testing framework.',
      userId: 1
    };
    
    const createPostResponse = await fetch(`${baseURL}/posts`, {
      ...fetchOptions,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost)
    });
    
    Assert.httpStatus(createPostResponse, 201, 'POST请求状态码不正确');
    
    const createdPost = await createPostResponse.json();
    
    Assert.exists(createdPost.id, '创建的文章没有返回ID');
    Assert.equals(createdPost.title, newPost.title, '创建的文章标题不匹配');
    Assert.equals(createdPost.userId, newPost.userId, '创建的文章用户ID不匹配');
    
    console.log(`✓ POST请求成功，创建文章ID: ${createdPost.id}`);
    
    // 测试3: PUT请求 - 更新资源
    console.log('🔄 测试PUT请求 - 更新文章...');
    const updatedPost = {
      id: 1,
      title: 'Updated Test Article',
      body: 'This article has been updated by our testing framework.',
      userId: 1
    };
    
    const updatePostResponse = await fetch(`${baseURL}/posts/1`, {
      ...fetchOptions,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPost)
    });
    
    Assert.httpOk(updatePostResponse, 'PUT请求失败');
    
    const updatedPostData = await updatePostResponse.json();
    
    Assert.equals(updatedPostData.title, updatedPost.title, '更新的文章标题不匹配');
    Assert.equals(updatedPostData.id, updatedPost.id, '更新的文章ID不匹配');
    
    console.log(`✓ PUT请求成功，文章已更新`);
    
    // 测试4: DELETE请求 - 删除资源
    console.log('🗑️  测试DELETE请求 - 删除文章...');
    const deletePostResponse = await fetch(`${baseURL}/posts/1`, {
      ...fetchOptions,
      method: 'DELETE'
    });
    
    Assert.httpOk(deletePostResponse, 'DELETE请求失败');
    
    console.log(`✓ DELETE请求成功，文章已删除`);
    
    // 测试5: 响应时间测试
    console.log('⏱️  测试API响应时间...');
    const startTime = Date.now();
    const timeTestResponse = await fetch(`${baseURL}/posts`, fetchOptions);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    Assert.httpOk(timeTestResponse, '响应时间测试请求失败');
    Assert.responseTime(responseTime, 5000, 'API响应时间过慢');
    
    console.log(`✓ API响应时间: ${responseTime}ms`);
    
    if (responseTime > 3000) {
      console.log('⚠️  API响应时间较慢，可能需要优化');
    }
    
    // 测试6: 并发请求测试
    console.log('🔄 测试并发请求...');
    const concurrentRequests = [];
    for (let i = 1; i <= 5; i++) {
      concurrentRequests.push(fetch(`${baseURL}/users/${i}`, fetchOptions));
    }
    
    const concurrentStartTime = Date.now();
    const concurrentResponses = await Promise.all(concurrentRequests);
    const concurrentEndTime = Date.now();
    const concurrentDuration = concurrentEndTime - concurrentStartTime;
    
    // 验证所有请求都成功
    concurrentResponses.forEach((response, index) => {
      Assert.httpOk(response, `并发请求${index + 1}失败`);
    });
    
    // 验证并发性能
    Assert.lessThan(concurrentDuration, 10000, '并发请求总耗时过长');
    Assert.arrayLength(concurrentResponses, 5, '并发请求数量不正确');
    
    console.log(`✓ 并发请求测试成功，5个请求耗时: ${concurrentEndTime - concurrentStartTime}ms`);
    
    console.log('🎉 API测试完成，所有检查通过');
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    throw error;
  }
};