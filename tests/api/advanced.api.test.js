const Assert = require('../../utils/Assert.js');

/**
 * 高级API测试示例 - 展示断言库的丰富功能
 * 测试目标: 演示各种断言方法的使用
 */
module.exports = async function(testUtils) {
  console.log('🔬 开始高级API测试: 断言库功能演示');
  
  const baseURL = 'https://jsonplaceholder.typicode.com';
  const agent = testUtils ? testUtils.getHttpAgent(baseURL) : null;
  const fetchOptions = agent ? { agent } : {};
  
  try {
    // 测试1: 数据类型和结构验证
    console.log('📊 测试数据类型和结构验证...');
    const usersResponse = await fetch(`${baseURL}/users`, fetchOptions);
    Assert.httpOk(usersResponse, '获取用户列表失败');
    
    const users = await usersResponse.json();
    Assert.isArray(users, '用户数据应为数组');
    Assert.arrayNotEmpty(users, '用户列表不应为空');
    Assert.greaterThan(users.length, 5, '用户数量应大于5');
    
    // 验证第一个用户的数据结构
    const firstUser = users[0];
    Assert.isObject(firstUser, '用户对象类型错误');
    Assert.isNumber(firstUser.id, '用户ID应为数字');
    Assert.isString(firstUser.name, '用户名应为字符串');
    Assert.isString(firstUser.email, '邮箱应为字符串');
    
    // 验证邮箱格式
    Assert.contains(firstUser.email, '@', '邮箱格式不正确');
    Assert.contains(firstUser.email, '.', '邮箱格式不正确');
    
    console.log('✓ 数据类型和结构验证通过');
    
    // 测试2: 字符串断言
    console.log('📝 测试字符串断言...');
    const postResponse = await fetch(`${baseURL}/posts/1`, fetchOptions);
    Assert.httpStatus(postResponse, 200, 'POST获取状态码错误');
    
    const post = await postResponse.json();
    Assert.isString(post.title, '文章标题应为字符串');
    Assert.isString(post.body, '文章内容应为字符串');
    
    // 字符串长度和内容验证
    Assert.greaterThan(post.title.length, 0, '文章标题不应为空');
    Assert.greaterThan(post.body.length, 10, '文章内容长度应大于10');
    
    console.log('✓ 字符串断言验证通过');
    
    // 测试3: 数值范围断言
    console.log('🔢 测试数值范围断言...');
    Assert.inRange(post.userId, 1, 10, '用户ID应在1-10范围内');
    Assert.inRange(post.id, 1, 100, '文章ID应在1-100范围内');
    
    console.log('✓ 数值范围断言验证通过');
    
    // 测试4: 响应时间断言
    console.log('⏱️ 测试响应时间断言...');
    const startTime = Date.now();
    const timeTestResponse = await fetch(`${baseURL}/posts?_limit=5`, fetchOptions);
    const responseTime = Date.now() - startTime;
    
    Assert.httpOk(timeTestResponse, '响应时间测试请求失败');
    Assert.responseTime(responseTime, 3000, 'API响应时间过慢');
    Assert.lessThan(responseTime, 5000, '响应时间应小于5秒');
    
    console.log(`✓ 响应时间断言验证通过 (${responseTime}ms)`);
    
    // 测试5: 数组操作断言
    console.log('📋 测试数组操作断言...');
    const postsData = await timeTestResponse.json();
    Assert.isArray(postsData, '文章数据应为数组');
    Assert.arrayLength(postsData, 5, '文章数量应为5');
    
    // 验证数组中包含特定元素
    const postIds = postsData.map(p => p.id);
    Assert.arrayContains(postIds, 1, '文章ID数组应包含1');
    
    console.log('✓ 数组操作断言验证通过');
    
    // 测试6: 深度对象比较
    console.log('🔍 测试深度对象比较...');
    const expectedStructure = {
      userId: 'number',
      id: 'number',
      title: 'string',
      body: 'string'
    };
    
    const actualStructure = {
      userId: typeof post.userId,
      id: typeof post.id,
      title: typeof post.title,
      body: typeof post.body
    };
    
    Assert.deepEquals(actualStructure, expectedStructure, '对象结构不匹配');
    
    console.log('✓ 深度对象比较验证通过');
    
    // 测试7: 异常处理断言
    console.log('⚠️ 测试异常处理断言...');
    
    // 测试404错误
    await Assert.throws(async () => {
      const response = await fetch(`${baseURL}/posts/99999`, fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    }, 'HTTP 404', '应该抛出404错误');
    
    console.log('✓ 异常处理断言验证通过');
    
    // 测试8: 正则表达式匹配
    console.log('🔤 测试正则表达式匹配...');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    Assert.matches(firstUser.email, emailPattern, '邮箱格式不符合正则表达式');
    
    console.log('✓ 正则表达式匹配验证通过');
    
    console.log('🎉 高级API测试完成，所有断言验证通过');
    
  } catch (error) {
    console.error('❌ 高级API测试失败:', error.message);
    throw error;
  }
};