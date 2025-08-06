const puppeteer = require('puppeteer');
const Assert = require('../../utils/Assert.js');

/**
 * UI测试示例 - 表单交互测试
 * 测试目标: 演示资源复用和断言库在UI测试中的应用
 */
module.exports = async function(testUtils) {
  console.log('📝 开始UI测试: 表单交互功能验证');
  
  // 使用资源池获取浏览器实例
  const browser = testUtils ? await testUtils.getBrowser() : await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // 设置视口大小
    await page.setViewport({ width: 1280, height: 720 });
    
    // 测试1: 访问Google搜索页面（作为表单测试示例）
    console.log('🌐 访问Google搜索页面...');
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    Assert.exists(title, '页面标题不存在');
    console.log('✓ 页面加载成功，标题:', title);
    
    // 测试2: 验证搜索表单元素存在
    console.log('🔍 验证搜索表单元素...');
    await Assert.elementExists(page, 'form', '表单元素不存在');
    
    // 尝试找到搜索输入框（Google有多种可能的选择器）
    const searchSelectors = ['input[name="q"]', 'textarea[name="q"]', '[name="q"]'];
    let searchInput = null;
    for (const selector of searchSelectors) {
      searchInput = await page.$(selector);
      if (searchInput) {
        console.log(`✓ 找到搜索输入框: ${selector}`);
        break;
      }
    }
    Assert.exists(searchInput, '搜索输入框不存在');
    console.log('✓ 搜索表单元素验证通过');
    
    // 测试3: 搜索输入测试
    console.log('📝 测试搜索输入...');
    const searchQuery = 'JavaScript测试框架';
    
    // 清空搜索框并输入搜索词
    const searchSelector = searchInput ? 
      (await searchInput.evaluate(el => el.getAttribute('name')) === 'q' ? `[name="q"]` : 'input[name="q"]') : 
      'input[name="q"]';
    
    await page.focus(searchSelector);
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type(searchSelector, searchQuery);
    
    console.log('✓ 搜索词输入完成');
    
    // 测试4: 验证输入值
    console.log('✅ 验证输入值...');
    const inputValue = await page.$eval(searchSelector, el => el.value);
    Assert.contains(inputValue, searchQuery, '搜索输入值不匹配');
    
    console.log('✓ 输入值验证通过');
    
    // 测试5: 搜索建议测试
    console.log('🔍 测试搜索建议...');
    
    // 等待搜索建议出现
    try {
      await page.waitForSelector('[role="listbox"], .erkvQe, .aajZCb', { timeout: 3000 });
      console.log('✓ 搜索建议出现');
    } catch (error) {
      console.log('⚠️ 搜索建议未出现（可能被阻止或页面结构变化）');
    }
    
    console.log('✓ 搜索功能测试完成');
    
    // 测试6: 页面性能测试
    console.log('⚡ 测试页面性能...');
    const metrics = await page.metrics();
    
    Assert.exists(metrics.Nodes, '页面节点数据不存在');
    Assert.exists(metrics.JSHeapUsedSize, 'JS堆内存数据不存在');
    
    Assert.greaterThan(metrics.Nodes, 0, '页面节点数应大于0');
    Assert.greaterThan(metrics.JSHeapUsedSize, 0, 'JS堆内存使用应大于0');
    
    // 内存使用不应过高（100MB）
    const memoryUsageMB = metrics.JSHeapUsedSize / (1024 * 1024);
    Assert.lessThan(memoryUsageMB, 100, 'JS堆内存使用过高');
    
    console.log(`✓ 页面性能指标 - DOM节点: ${metrics.Nodes}, JS堆: ${Math.round(memoryUsageMB)}MB`);
    
    // 测试7: 响应式设计测试
    console.log('📱 测试响应式设计...');
    
    // 测试移动端视口
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle2' });
    
    // 验证在移动端视口下搜索表单仍然可见
    await Assert.elementVisible(page, 'form', '移动端视口下表单不可见');
    
    // 恢复桌面视口
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('✓ 响应式设计测试通过');
    
    console.log('🎉 搜索表单UI测试完成，所有检查通过');
    
  } catch (error) {
    console.error('❌ 搜索表单UI测试失败:', error.message);
    
    // 错误时截图
    try {
      await page.screenshot({ 
        path: './reports/form-interaction-error-screenshot.png',
        fullPage: true
      });
      console.log('📸 错误截图已保存到 ./reports/form-interaction-error-screenshot.png');
    } catch (screenshotError) {
      console.log('截图保存失败:', screenshotError.message);
    }
    
    throw error;
  } finally {
    // 使用资源池归还浏览器实例
    if (testUtils) {
      await testUtils.returnBrowser(browser);
    } else {
      await browser.close();
    }
  }
};