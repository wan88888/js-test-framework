const puppeteer = require('puppeteer');

/**
 * UI测试示例 - SauceDemo网站登录测试
 * 测试目标: 验证用户登录流程和页面交互功能
 */
module.exports = async function() {
  console.log('🌐 开始UI测试: SauceDemo网站登录流程');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // 设置视口大小
    await page.setViewport({ width: 1280, height: 720 });
    
    // 测试1: 访问SauceDemo登录页面
    console.log('📄 访问SauceDemo登录页面...');
    await page.goto('https://www.saucedemo.com', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    if (!title.includes('Swag Labs')) {
      throw new Error(`页面标题验证失败，期望包含'Swag Labs'，实际: ${title}`);
    }
    console.log('✓ 页面加载成功，标题验证通过');
    
    // 测试2: 验证登录表单元素存在
    console.log('🔍 验证登录表单元素...');
    const usernameInput = await page.$('#user-name');
    const passwordInput = await page.$('#password');
    const loginButton = await page.$('#login-button');
    
    if (!usernameInput || !passwordInput || !loginButton) {
      throw new Error('登录表单元素缺失');
    }
    console.log('✓ 登录表单元素验证通过');
    
    // 测试3: 执行登录操作
    console.log('🔐 执行登录操作...');
    
    // 输入用户名（使用标准用户）
    await page.type('#user-name', 'standard_user');
    console.log('✓ 用户名输入完成');
    
    // 输入密码
    await page.type('#password', 'secret_sauce');
    console.log('✓ 密码输入完成');
    
    // 点击登录按钮
    await page.click('#login-button');
    console.log('✓ 点击登录按钮');
    
    // 测试4: 验证登录成功
    console.log('✅ 验证登录结果...');
    
    // 等待页面跳转到产品页面
    await page.waitForSelector('.inventory_list', { timeout: 10000 });
    
    // 验证URL变化
    const currentUrl = page.url();
    if (!currentUrl.includes('inventory.html')) {
      throw new Error(`登录后URL验证失败，期望包含'inventory.html'，实际: ${currentUrl}`);
    }
    console.log('✓ 登录成功，页面跳转正确');
    
    // 测试5: 验证产品页面元素
    console.log('📦 验证产品页面元素...');
    
    // 检查产品列表
    const productItems = await page.$$('.inventory_item');
    if (productItems.length === 0) {
      throw new Error('产品列表为空');
    }
    console.log(`✓ 找到 ${productItems.length} 个产品`);
    
    // 检查购物车图标
    const cartIcon = await page.$('.shopping_cart_link');
    if (!cartIcon) {
      throw new Error('购物车图标未找到');
    }
    console.log('✓ 购物车图标验证通过');
    
    // 测试6: 添加商品到购物车
    console.log('🛒 测试添加商品到购物车...');
    
    // 点击第一个商品的添加按钮
    const addToCartButton = await page.$('.btn_primary.btn_small.btn_inventory');
    if (addToCartButton) {
      await addToCartButton.click();
      console.log('✓ 商品添加到购物车');
      
      // 验证购物车数量显示
      await page.waitForSelector('.shopping_cart_badge', { timeout: 5000 });
      const cartBadge = await page.$eval('.shopping_cart_badge', el => el.textContent);
      if (cartBadge !== '1') {
        throw new Error(`购物车数量显示错误，期望'1'，实际'${cartBadge}'`);
      }
      console.log('✓ 购物车数量显示正确');
    }
    
    // 测试7: 测试菜单功能
    console.log('📋 测试菜单功能...');
    
    // 点击菜单按钮
    const menuButton = await page.$('#react-burger-menu-btn');
    if (menuButton) {
      await menuButton.click();
      await page.waitForSelector('.bm-menu', { timeout: 5000 });
      console.log('✓ 菜单打开成功');
      
      // 验证登出链接存在
      const logoutLink = await page.$('#logout_sidebar_link');
      if (!logoutLink) {
        throw new Error('登出链接未找到');
      }
      console.log('✓ 登出链接验证通过');
      
      // 菜单功能测试完成，无需关闭
       console.log('✓ 菜单功能测试完成');
    }
    
    // 测试8: 页面性能测试
    console.log('⚡ 测试页面性能...');
    const metrics = await page.metrics();
    console.log(`✓ 页面性能指标 - DOM节点: ${metrics.Nodes}, JS堆大小: ${Math.round(metrics.JSHeapUsedSize / 1024)}KB`);
    
    console.log('🎉 SauceDemo UI测试完成，所有检查通过');
    
  } catch (error) {
    console.error('❌ SauceDemo UI测试失败:', error.message);
    
    // 错误时截图
    try {
      await page.screenshot({ 
        path: './reports/saucedemo-error-screenshot.png',
        fullPage: true
      });
      console.log('📸 错误截图已保存到 ./reports/saucedemo-error-screenshot.png');
    } catch (screenshotError) {
      console.log('截图保存失败:', screenshotError.message);
    }
    
    throw error;
  } finally {
    await browser.close();
  }
};