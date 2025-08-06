/**
 * 测试框架配置文件
 * 用于自定义测试行为、环境设置和报告选项
 */

module.exports = {
  // 测试目录配置
  testDir: './tests',
  
  // 测试超时设置（毫秒）
  timeout: 30000,
  
  // Puppeteer配置
  puppeteer: {
    headless: true,
    slowMo: 0,
    devtools: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1280,
      height: 720
    }
  },
  
  // API测试配置
  api: {
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    retries: 3,
    headers: {
      'User-Agent': 'JS-Test-Framework/1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  
  // 报告配置
  reporting: {
    enabled: true,
    formats: ['html', 'json'],
    outputDir: './reports',
    includeScreenshots: true,
    includeLogs: true
  },
  
  // 并发配置
  parallel: {
    enabled: true,
    maxWorkers: 4
  },
  
  // 重试配置
  retry: {
    enabled: true,
    maxRetries: 2,
    retryDelay: 1000
  },
  
  // 环境变量
  env: {
    NODE_ENV: 'test',
    DEBUG: false
  },
  
  // 测试过滤器
  filters: {
    // 包含的测试类型
    include: ['ui', 'api'],
    // 排除的测试文件
    exclude: [],
    // 只运行匹配的测试名称
    grep: null
  },
  
  // 钩子函数
  hooks: {
    // 测试开始前执行
    beforeAll: async () => {
      console.log('🚀 测试套件开始执行...');
    },
    
    // 测试结束后执行
    afterAll: async () => {
      console.log('✅ 测试套件执行完成');
    },
    
    // 每个测试前执行
    beforeEach: async (testInfo) => {
      // console.log(`📝 开始执行测试: ${testInfo.name}`);
    },
    
    // 每个测试后执行
    afterEach: async (testInfo) => {
      // console.log(`📋 测试完成: ${testInfo.name} - ${testInfo.status}`);
    }
  },
  
  // 自定义断言配置
  assertions: {
    // 是否启用软断言（不会立即停止测试）
    soft: false,
    // 断言超时时间
    timeout: 5000
  },
  
  // 日志配置
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    console: true,
    file: false,
    logFile: './reports/test.log'
  },
  
  // 性能监控
  performance: {
    enabled: true,
    thresholds: {
      // API响应时间阈值（毫秒）
      apiResponseTime: 3000,
      // 页面加载时间阈值（毫秒）
      pageLoadTime: 5000,
      // 内存使用阈值（MB）
      memoryUsage: 100
    }
  },
  
  // 截图配置
  screenshots: {
    // 何时截图: 'always', 'on-failure', 'never'
    mode: 'on-failure',
    // 截图质量 (0-100)
    quality: 80,
    // 是否全页截图
    fullPage: true
  },
  
  // 数据驱动测试
  data: {
    // 测试数据文件路径
    dataDir: './test-data',
    // 支持的数据格式
    formats: ['json', 'csv', 'yaml']
  },
  
  // 模拟和存根配置
  mocking: {
    enabled: false,
    mockDir: './mocks',
    // 网络请求模拟
    networkMocking: false
  }
};