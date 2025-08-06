# JavaScript 测试框架

🎯 一个基于 Node.js、Puppeteer 和原生 Fetch API 的现代化测试框架，专为 Web UI 测试、API 测试、无头浏览器自动化和测试报告生成而设计。

## ✨ 核心特性

- 🌐 **Web UI 测试**: 使用 Puppeteer 进行浏览器自动化测试
- 🔌 **API 测试**: 使用原生 Fetch API 进行 RESTful API 测试  
- 📊 **智能报告**: 自动生成美观的 HTML 和 JSON 格式测试报告
- ⚡ **并发执行**: 支持多线程并发执行测试用例
- 📸 **自动截图**: 测试失败时自动截图保存现场
- 📈 **性能监控**: 实时监控页面性能和 API 响应时间
- ⚙️ **灵活配置**: 通过配置文件完全自定义测试行为
- 🛡️ **错误处理**: 完善的错误处理、重试机制和异常恢复
- 🎨 **现代化UI**: 精美的测试报告界面，支持深色模式
- 🔍 **详细日志**: 完整的测试执行日志和调试信息

## 📁 项目结构

```
js-test-framework/
├── tests/
│   ├── ui/                 # UI 测试文件
│   │   ├── example.ui.test.js
│   │   └── form-interaction.ui.test.js
│   └── api/                # API 测试文件
│       ├── example.api.test.js
│       └── advanced.api.test.js
├── reports/                # 测试报告输出目录
├── runner.js               # 测试运行器
├── reporter.js             # 测试报告生成器
├── test.config.js          # 测试配置文件
└── package.json
```

## 🎯 快速开始

### 📦 安装依赖

```bash
npm install
```

### 🚀 运行测试

```bash
# 运行所有测试（推荐）
npm test

# 只运行 UI 测试
npm run test:ui

# 只运行 API 测试
npm run test:api
```

### 📊 最新测试结果

```
🚀 开始运行 2 个测试...

✅ example.api.test - 通过
   📥 GET请求成功，用户: Leanne Graham
   📤 POST请求成功，创建文章ID: 101
   🔄 PUT请求成功，文章已更新
   🗑️ DELETE请求成功，文章已删除
   ⏱️ API响应时间: 163ms
   🔄 并发请求测试成功，5个请求耗时: 688ms

✅ example.ui.test - 通过
   📄 SauceDemo登录页面访问成功
   🔐 用户登录流程验证通过
   📦 产品页面功能测试通过
   🛒 购物车功能验证成功
   📋 菜单功能测试完成
   ⚡ 页面性能指标 - DOM节点: 330, JS堆: 4383KB

==================================================
📊 测试摘要
==================================================
总计: 2 | ✅ 通过: 2 | ❌ 失败: 0 | ⏱️ 耗时: 7148ms
==================================================
```

## 📖 详细使用指南

### 🌐 编写 UI 测试

在 `tests/ui/` 目录下创建测试文件，文件名以 `.ui.test.js` 结尾：

```javascript
const puppeteer = require('puppeteer');

module.exports = async function() {
  console.log('🌐 开始UI测试: 我的测试');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 访问页面
    await page.goto('https://example.com');
    
    // 验证页面标题
    const title = await page.title();
    if (!title.includes('Expected Title')) {
      throw new Error('页面标题验证失败');
    }
    
    // 更多测试逻辑...
    console.log('✅ UI测试完成');
    
  } catch (error) {
    // 错误截图
    await page.screenshot({ path: './reports/error-screenshot.png' });
    throw error;
  } finally {
    await browser.close();
  }
};
```

### 🔌 编写 API 测试

在 `tests/api/` 目录下创建测试文件，文件名以 `.api.test.js` 结尾：

```javascript
module.exports = async function() {
  console.log('🔌 开始API测试: 我的API测试');
  
  // GET 请求测试
  const response = await fetch('https://api.example.com/users/1');
  if (!response.ok) {
    throw new Error(`GET请求失败: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('✅ GET请求成功:', data.name);
  
  // POST 请求测试
  const postResponse = await fetch('https://api.example.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Test Post', body: 'Test Content' })
  });
  
  if (!postResponse.ok) {
    throw new Error(`POST请求失败: ${postResponse.status}`);
  }
  
  console.log('✅ API测试完成');
};
```
# 运行测试并生成详细报告
npm run test:report

# 创建示例测试文件
node runner.js --create-examples
```

### 命令行选项

```bash
# 指定测试类型
node runner.js --type=ui
node runner.js --type=api

# 生成详细报告
node runner.js --report

# 显示帮助信息
node runner.js --help
```

## 📝 编写测试

### UI 测试示例

在 `tests/ui/` 目录下创建 `.ui.test.js` 文件：

```javascript
const puppeteer = require('puppeteer');

module.exports = async function() {
  console.log('开始UI测试');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://example.com');
    
    // 验证页面标题
    const title = await page.title();
    if (!title.includes('Expected Title')) {
      throw new Error('页面标题验证失败');
    }
    
    // 点击元素
    await page.click('#some-button');
    
    // 等待导航
    await page.waitForNavigation();
    
    console.log('UI测试完成');
    
  } catch (error) {
    // 错误时截图
    await page.screenshot({ path: './reports/error-screenshot.png' });
    throw error;
  } finally {
    await browser.close();
  }
};
```

### API 测试示例

在 `tests/api/` 目录下创建 `.api.test.js` 文件：

```javascript
module.exports = async function() {
  console.log('开始API测试');
  
  // GET 请求
  const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
  if (!response.ok) {
    throw new Error(`GET请求失败: ${response.status}`);
  }
  
  const user = await response.json();
  console.log('获取用户:', user.name);
  
  // POST 请求
  const postResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    })
  });
  
  if (!postResponse.ok) {
    throw new Error(`POST请求失败: ${postResponse.status}`);
  }
  
  const newPost = await postResponse.json();
  console.log('创建文章:', newPost.id);
  
  console.log('API测试完成');
};
```

## ⚙️ 配置

通过 `test.config.js` 文件自定义测试框架行为：

```javascript
module.exports = {
  testDir: './tests',
  timeout: 30000,
  puppeteer: {
    headless: true,
    defaultViewport: { width: 1280, height: 720 }
  },
  reporting: {
    enabled: true,
    formats: ['html', 'json'],
    outputDir: './reports'
  }
};
```

### 主要配置选项

- `testDir`: 测试文件目录
- `timeout`: 测试超时时间
- `puppeteer`: Puppeteer 浏览器配置
- `api`: API 测试相关配置
- `reporting`: 报告生成配置
- `parallel`: 并发执行配置
- `screenshots`: 截图配置

## 📊 测试报告

测试完成后，框架会在 `reports/` 目录下生成：

- **HTML 报告**: 美观的可视化测试报告
- **JSON 报告**: 机器可读的测试结果数据
- **截图文件**: 测试过程中的页面截图

### 报告特性

- 📈 测试统计摘要
- 📋 详细的测试结果列表
- 🖼️ 失败测试的截图
- ⏱️ 性能指标和响应时间
- 🎨 响应式设计，支持移动端查看

## 🔧 高级功能

### 📊 性能监控

```javascript
// 在UI测试中监控性能
const metrics = await page.metrics();
console.log(`DOM节点: ${metrics.Nodes}, JS堆: ${Math.round(metrics.JSHeapUsedSize / 1024)}KB`);

// 在API测试中测量响应时间
const startTime = Date.now();
const response = await fetch(url);
const responseTime = Date.now() - startTime;
console.log(`响应时间: ${responseTime}ms`);
```

框架自动监控：
- API 响应时间
- 页面加载时间
- 内存使用情况
- 并发请求性能

### 🔄 并发测试

```javascript
// 并发执行多个API请求
const promises = urls.map(url => fetch(url));
const responses = await Promise.all(promises);
console.log(`并发请求完成: ${responses.length}个`);
```

- 支持并行执行多个测试
- 并发压力测试
- 资源竞争检测

### 📸 智能截图

```javascript
// 测试失败时自动截图
try {
  // 测试逻辑
} catch (error) {
  await page.screenshot({ 
    path: `./reports/error-${Date.now()}.png`,
    fullPage: true 
  });
  throw error;
}
```

### 🛡️ 错误处理

- 自动重试失败的测试
- 详细的错误堆栈信息
- 失败时自动截图
- 错误分类和统计

### 🔍 数据验证

- API 响应数据结构验证
- 数据类型检查
- 数据完整性验证
- 边界条件测试

## 🎯 最佳实践

### ✅ UI测试最佳实践

- 使用明确的选择器，避免依赖易变的CSS类
- 添加适当的等待时间，确保元素加载完成
- 测试失败时自动截图，便于问题诊断
- 使用页面对象模式组织复杂的UI测试
- 在测试前后清理浏览器状态

### ✅ API测试最佳实践

- 验证HTTP状态码和响应格式
- 测试边界条件和错误场景
- 使用真实的测试数据，避免硬编码
- 监控API响应时间和性能指标
- 实现幂等性测试，确保重复执行安全

### ✅ 通用最佳实践

- 保持测试独立性，避免测试间依赖
- 使用描述性的测试名称和日志输出
- 定期清理测试报告和截图文件
- 在CI/CD流水线中集成自动化测试
- 建立测试数据管理策略

## 🐛 故障排除

### ❓ 常见问题

#### 🔧 安装问题
```bash
# Puppeteer 安装失败
npm install puppeteer --unsafe-perm=true --allow-root

# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

#### ⏱️ 超时问题
```javascript
// 增加超时配置
module.exports = {
  timeouts: {
    test: 60000,    // 增加到60秒
    page: 30000,    // 页面加载超时
    element: 10000  // 元素等待超时
  }
};
```

#### 🎯 元素定位问题
```javascript
// 使用更可靠的等待策略
await page.waitForSelector('#element', { visible: true, timeout: 10000 });
await page.waitForFunction(() => document.readyState === 'complete');
```

#### 🌐 网络问题
```javascript
// API请求重试机制
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    const response = await fetch(url);
    if (response.ok) break;
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
  }
}
```

### 🔍 调试技巧

- 启用详细日志：设置 `DEBUG=puppeteer:*`
- 使用非无头模式：`headless: false`
- 添加调试断点：`await page.waitForTimeout(5000)`
- 检查网络请求：`page.on('request', console.log)`

## 🤝 贡献指南

我们欢迎所有形式的贡献！🎉

### 📋 贡献方式

- 🐛 **报告Bug**：提交详细的问题描述和复现步骤
- 💡 **功能建议**：分享你的想法和改进建议
- 📝 **文档改进**：帮助完善文档和示例
- 🔧 **代码贡献**：提交功能增强和Bug修复

### 🚀 开发流程

1. **Fork** 项目到你的GitHub账户
2. **Clone** 到本地开发环境
3. **创建** 功能分支：`git checkout -b feature/amazing-feature`
4. **开发** 并测试你的更改
5. **提交** 更改：`git commit -m 'Add amazing feature'`
6. **推送** 到分支：`git push origin feature/amazing-feature`
7. **创建** Pull Request

### 📏 代码规范

- 使用ES6+语法
- 添加适当的注释和文档
- 保持代码风格一致
- 编写测试用例
- 遵循现有的项目结构

## 📄 许可证

本项目采用 **MIT License** 开源协议 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关资源

- 📚 [Puppeteer 官方文档](https://pptr.dev/)
- 🌐 [Node.js Fetch API 文档](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch)
- 🧪 [JavaScript 测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
- 🎯 [SauceDemo 测试网站](https://www.saucedemo.com)
- 🔌 [JSONPlaceholder API](https://jsonplaceholder.typicode.com)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个Star！⭐**

**🚀 让我们一起构建更好的测试框架！🚀**

</div>

---

**Happy Testing! 🧪✨**