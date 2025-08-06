const { Worker } = require('worker_threads');
const path = require('path');

/**
 * 测试工具类 - 提供并行执行、资源管理等功能
 */
class TestUtils {
  constructor() {
    this.browserPool = [];
    this.maxBrowsers = 3;
    this.httpAgents = new Map();
  }

  /**
   * 获取可复用的浏览器实例
   */
  async getBrowser() {
    if (this.browserPool.length > 0) {
      return this.browserPool.pop();
    }
    
    const puppeteer = require('puppeteer');
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  /**
   * 归还浏览器实例到池中
   */
  async returnBrowser(browser) {
    if (this.browserPool.length < this.maxBrowsers) {
      // 清理页面但保留浏览器
      const pages = await browser.pages();
      for (const page of pages) {
        if (page.url() !== 'about:blank') {
          await page.close();
        }
      }
      this.browserPool.push(browser);
    } else {
      await browser.close();
    }
  }

  /**
   * 获取HTTP Agent（用于连接复用）
   */
  getHttpAgent(baseURL) {
    if (!this.httpAgents.has(baseURL)) {
      const { Agent } = require('https');
      this.httpAgents.set(baseURL, new Agent({
        keepAlive: true,
        maxSockets: 10
      }));
    }
    return this.httpAgents.get(baseURL);
  }

  /**
   * 清理所有资源
   */
  async cleanup() {
    // 关闭所有浏览器
    for (const browser of this.browserPool) {
      await browser.close();
    }
    this.browserPool = [];

    // 销毁HTTP Agents
    for (const agent of this.httpAgents.values()) {
      agent.destroy();
    }
    this.httpAgents.clear();
  }
}

/**
 * 并行测试执行器
 */
class ParallelExecutor {
  constructor(maxWorkers = 4) {
    this.maxWorkers = maxWorkers;
    this.activeWorkers = 0;
    this.queue = [];
    this.results = [];
  }

  /**
   * 并行执行测试
   */
  async executeTests(tests) {
    return new Promise((resolve) => {
      this.queue = [...tests];
      this.results = [];
      this.completedCount = 0;
      this.totalTests = tests.length;
      
      const checkComplete = () => {
        if (this.completedCount === this.totalTests) {
          resolve(this.results);
        }
      };

      // 启动初始workers
      for (let i = 0; i < Math.min(this.maxWorkers, tests.length); i++) {
        this.startWorker(checkComplete);
      }
    });
  }

  /**
   * 启动单个worker
   */
  async startWorker(onComplete) {
    if (this.queue.length === 0) return;
    
    const test = this.queue.shift();
    this.activeWorkers++;

    try {
      const result = await this.runSingleTest(test);
      this.results.push(result);
    } catch (error) {
      this.results.push({
        ...test,
        status: 'failed',
        error: error.message,
        duration: 0
      });
    }

    this.activeWorkers--;
    this.completedCount++;
    
    // 继续处理队列中的测试
    if (this.queue.length > 0) {
      this.startWorker(onComplete);
    }
    
    onComplete();
  }

  /**
   * 执行单个测试（支持重试）
   */
  async runSingleTest(test, retryCount = 0) {
    const maxRetries = 2;
    const startTime = Date.now();
    
    try {
      // 动态加载测试模块
      delete require.cache[require.resolve(test.file)];
      const testModule = require(test.file);
      
      if (typeof testModule === 'function') {
        await testModule();
      } else {
        throw new Error('测试文件必须导出一个函数');
      }
      
      return {
        ...test,
        status: 'passed',
        duration: Date.now() - startTime,
        error: null
      };
    } catch (error) {
      // 重试逻辑
      if (retryCount < maxRetries && this.shouldRetry(error)) {
        console.log(`🔄 重试测试 ${test.name} (${retryCount + 1}/${maxRetries})`);
        await this.delay(1000 * (retryCount + 1)); // 递增延迟
        return this.runSingleTest(test, retryCount + 1);
      }
      
      return {
        ...test,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message,
        retryCount
      };
    }
  }

  /**
   * 判断是否应该重试
   */
  shouldRetry(error) {
    const retryableErrors = [
      'timeout',
      'network',
      'ECONNRESET',
      'ENOTFOUND',
      'Node is either not clickable'
    ];
    
    return retryableErrors.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = {
  TestUtils,
  ParallelExecutor
};