#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Reporter = require('./reporter.js');

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.reporter = new Reporter();
    this.config = {
      testDir: './tests',
      timeout: 30000,
      headless: true,
      parallel: false
    };
  }

  // 加载配置文件
  loadConfig(configPath = './test.config.js') {
    if (fs.existsSync(configPath)) {
      const config = require(path.resolve(configPath));
      this.config = { ...this.config, ...config };
    }
  }

  // 发现测试文件
  discoverTests(testType = null) {
    const testDir = path.resolve(this.config.testDir);
    if (!fs.existsSync(testDir)) {
      console.log('测试目录不存在，创建示例测试文件...');
      this.createExampleTests();
    }

    const files = this.getTestFiles(testDir, testType);
    this.tests = files.map(file => ({
      file,
      type: this.getTestType(file),
      name: path.basename(file, '.js')
    }));
  }

  // 获取测试文件
  getTestFiles(dir, testType) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!testType || item === testType) {
          files.push(...this.getTestFiles(fullPath, null));
        }
      } else if (item.endsWith('.test.js') || item.endsWith('.spec.js')) {
        if (!testType || this.getTestType(fullPath) === testType) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  // 判断测试类型
  getTestType(filePath) {
    if (filePath.includes('/ui/') || filePath.includes('ui.test.js')) {
      return 'ui';
    } else if (filePath.includes('/api/') || filePath.includes('api.test.js')) {
      return 'api';
    }
    return 'unknown';
  }

  // 运行所有测试
  async runTests() {
    console.log(`\n🚀 开始运行 ${this.tests.length} 个测试...\n`);
    
    const startTime = Date.now();
    
    for (const test of this.tests) {
      await this.runSingleTest(test);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // 生成报告
    await this.reporter.generateReport(this.results, duration);
    
    // 输出摘要
    this.printSummary(duration);
    
    // 返回退出码
    const failed = this.results.filter(r => r.status === 'failed').length;
    process.exit(failed > 0 ? 1 : 0);
  }

  // 运行单个测试
  async runSingleTest(test) {
    console.log(`📝 运行测试: ${test.name} (${test.type})`);
    
    const result = {
      name: test.name,
      type: test.type,
      file: test.file,
      status: 'pending',
      duration: 0,
      error: null,
      details: null
    };
    
    const startTime = Date.now();
    
    try {
      // 动态加载并运行测试
      delete require.cache[require.resolve(test.file)];
      const testModule = require(test.file);
      
      if (typeof testModule === 'function') {
        await testModule();
      } else if (testModule.default && typeof testModule.default === 'function') {
        await testModule.default();
      } else {
        throw new Error('测试文件必须导出一个函数');
      }
      
      result.status = 'passed';
      console.log(`✅ ${test.name} - 通过`);
    } catch (error) {
      result.status = 'failed';
      result.error = error.message;
      result.details = error.stack;
      console.log(`❌ ${test.name} - 失败: ${error.message}`);
    }
    
    result.duration = Date.now() - startTime;
    this.results.push(result);
  }

  // 打印测试摘要
  printSummary(duration) {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试摘要');
    console.log('='.repeat(50));
    console.log(`总计: ${total}`);
    console.log(`✅ 通过: ${passed}`);
    console.log(`❌ 失败: ${failed}`);
    console.log(`⏱️  耗时: ${duration}ms`);
    console.log('='.repeat(50));
  }

  // 创建示例测试文件
  createExampleTests() {
    const testDir = path.resolve(this.config.testDir);
    
    // 创建目录结构
    fs.mkdirSync(path.join(testDir, 'ui'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'api'), { recursive: true });
    
    // 创建示例UI测试
    const uiTestContent = `const puppeteer = require('puppeteer');

module.exports = async function() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://example.com');
    const title = await page.title();
    
    if (!title.includes('Example')) {
      throw new Error('页面标题不正确');
    }
    
    console.log('✓ 页面标题验证通过');
  } finally {
    await browser.close();
  }
};`;
    
    // 创建示例API测试
    const apiTestContent = `const fetch = require('node-fetch');

module.exports = async function() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
  
  if (!response.ok) {
    throw new Error('API请求失败');
  }
  
  const data = await response.json();
  
  if (!data.id || !data.title) {
    throw new Error('API响应数据格式不正确');
  }
  
  console.log('✓ API响应验证通过');
};`;
    
    fs.writeFileSync(path.join(testDir, 'ui', 'example.ui.test.js'), uiTestContent);
    fs.writeFileSync(path.join(testDir, 'api', 'example.api.test.js'), apiTestContent);
    
    console.log('✅ 已创建示例测试文件');
  }
}

// 命令行参数解析
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: null,
    report: false,
    help: false
  };
  
  for (const arg of args) {
    if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1];
    } else if (arg === '--report') {
      options.report = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }
  
  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
📚 JavaScript 测试框架使用说明
`);
  console.log('用法:');
  console.log('  npm test                    # 运行所有测试');
  console.log('  npm run test:ui             # 只运行UI测试');
  console.log('  npm run test:api            # 只运行API测试');
  console.log('  npm run test:report         # 运行测试并生成详细报告');
  console.log('');
  console.log('选项:');
  console.log('  --type=ui|api              # 指定测试类型');
  console.log('  --report                    # 生成详细报告');
  console.log('  --help, -h                  # 显示帮助信息');
  console.log('');
}

// 主函数
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    return;
  }
  
  const runner = new TestRunner();
  runner.loadConfig();
  runner.discoverTests(options.type);
  
  if (runner.tests.length === 0) {
    console.log('❌ 没有找到测试文件');
    process.exit(1);
  }
  
  await runner.runTests();
}

// 如果直接运行此文件
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 运行测试时发生错误:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;