// Node.js 18+ 内置 fetch API，无需引入

/**
 * API测试示例 - 使用Fetch API进行RESTful API测试
 * 测试目标: 验证API端点的功能、响应格式和错误处理
 */
module.exports = async function() {
  console.log('🌐 开始API测试: RESTful API功能验证');
  
  const baseURL = 'https://jsonplaceholder.typicode.com';
  
  try {
    // 测试1: GET请求 - 获取单个资源
    console.log('📥 测试GET请求 - 获取单个用户...');
    const getUserResponse = await fetch(`${baseURL}/users/1`);
    
    if (!getUserResponse.ok) {
      throw new Error(`GET请求失败: ${getUserResponse.status} ${getUserResponse.statusText}`);
    }
    
    const userData = await getUserResponse.json();
    
    // 验证响应数据结构
    const requiredFields = ['id', 'name', 'email', 'username'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`用户数据缺少必需字段: ${field}`);
      }
    }
    
    console.log(`✓ GET请求成功，用户: ${userData.name} (${userData.email})`);
    
    // 测试2: POST请求 - 创建新资源
    console.log('📤 测试POST请求 - 创建新文章...');
    const newPost = {
      title: 'Test Article from JS Framework',
      body: 'This is a test article created by our JavaScript testing framework.',
      userId: 1
    };
    
    const createPostResponse = await fetch(`${baseURL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost)
    });
    
    if (!createPostResponse.ok) {
      throw new Error(`POST请求失败: ${createPostResponse.status}`);
    }
    
    const createdPost = await createPostResponse.json();
    
    if (!createdPost.id) {
      throw new Error('创建的文章没有返回ID');
    }
    
    if (createdPost.title !== newPost.title) {
      throw new Error('创建的文章标题不匹配');
    }
    
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
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedPost)
    });
    
    if (!updatePostResponse.ok) {
      throw new Error(`PUT请求失败: ${updatePostResponse.status}`);
    }
    
    const updatedPostData = await updatePostResponse.json();
    
    if (updatedPostData.title !== updatedPost.title) {
      throw new Error('更新的文章标题不匹配');
    }
    
    console.log(`✓ PUT请求成功，文章已更新`);
    
    // 测试4: DELETE请求 - 删除资源
    console.log('🗑️  测试DELETE请求 - 删除文章...');
    const deletePostResponse = await fetch(`${baseURL}/posts/1`, {
      method: 'DELETE'
    });
    
    if (!deletePostResponse.ok) {
      throw new Error(`DELETE请求失败: ${deletePostResponse.status}`);
    }
    
    console.log(`✓ DELETE请求成功，文章已删除`);
    
    // 测试5: 响应时间测试
    console.log('⏱️  测试API响应时间...');
    const startTime = Date.now();
    const timeTestResponse = await fetch(`${baseURL}/posts`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (!timeTestResponse.ok) {
      throw new Error('响应时间测试请求失败');
    }
    
    console.log(`✓ API响应时间: ${responseTime}ms`);
    
    if (responseTime > 5000) {
      console.log('⚠️  API响应时间较慢，可能需要优化');
    }
    
    // 测试6: 并发请求测试
    console.log('🔄 测试并发请求...');
    const concurrentRequests = [];
    for (let i = 1; i <= 5; i++) {
      concurrentRequests.push(fetch(`${baseURL}/users/${i}`));
    }
    
    const concurrentStartTime = Date.now();
    const concurrentResponses = await Promise.all(concurrentRequests);
    const concurrentEndTime = Date.now();
    
    const allSuccessful = concurrentResponses.every(response => response.ok);
    if (!allSuccessful) {
      throw new Error('部分并发请求失败');
    }
    
    console.log(`✓ 并发请求测试成功，5个请求耗时: ${concurrentEndTime - concurrentStartTime}ms`);
    
    console.log('🎉 API测试完成，所有检查通过');
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    throw error;
  }
};