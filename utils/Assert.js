/**
 * 断言库 - 提供丰富的断言方法和友好的错误信息
 */
class Assert {
  /**
   * 基础断言
   */
  static isTrue(value, message = '期望值为true') {
    if (value !== true) {
      throw new Error(`${message}，实际值: ${value}`);
    }
  }

  static isFalse(value, message = '期望值为false') {
    if (value !== false) {
      throw new Error(`${message}，实际值: ${value}`);
    }
  }

  static equals(actual, expected, message = '值不相等') {
    if (actual !== expected) {
      throw new Error(`${message}\n期望: ${expected}\n实际: ${actual}`);
    }
  }

  static notEquals(actual, expected, message = '值不应该相等') {
    if (actual === expected) {
      throw new Error(`${message}\n值: ${actual}`);
    }
  }

  static deepEquals(actual, expected, message = '对象深度比较不相等') {
    if (!this._deepEqual(actual, expected)) {
      throw new Error(`${message}\n期望: ${JSON.stringify(expected, null, 2)}\n实际: ${JSON.stringify(actual, null, 2)}`);
    }
  }

  /**
   * 类型断言
   */
  static isString(value, message = '期望值为字符串') {
    if (typeof value !== 'string') {
      throw new Error(`${message}，实际类型: ${typeof value}`);
    }
  }

  static isNumber(value, message = '期望值为数字') {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${message}，实际类型: ${typeof value}`);
    }
  }

  static isObject(value, message = '期望值为对象') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`${message}，实际类型: ${typeof value}`);
    }
  }

  static isArray(value, message = '期望值为数组') {
    if (!Array.isArray(value)) {
      throw new Error(`${message}，实际类型: ${typeof value}`);
    }
  }

  static isFunction(value, message = '期望值为函数') {
    if (typeof value !== 'function') {
      throw new Error(`${message}，实际类型: ${typeof value}`);
    }
  }

  /**
   * 存在性断言
   */
  static exists(value, message = '期望值存在') {
    if (value === null || value === undefined) {
      throw new Error(`${message}，实际值: ${value}`);
    }
  }

  static notExists(value, message = '期望值不存在') {
    if (value !== null && value !== undefined) {
      throw new Error(`${message}，实际值: ${value}`);
    }
  }

  /**
   * 字符串断言
   */
  static contains(str, substring, message = '字符串不包含指定子串') {
    if (typeof str !== 'string' || !str.includes(substring)) {
      throw new Error(`${message}\n字符串: "${str}"\n期望包含: "${substring}"`);
    }
  }

  static notContains(str, substring, message = '字符串不应包含指定子串') {
    if (typeof str === 'string' && str.includes(substring)) {
      throw new Error(`${message}\n字符串: "${str}"\n不应包含: "${substring}"`);
    }
  }

  static startsWith(str, prefix, message = '字符串不以指定前缀开始') {
    if (typeof str !== 'string' || !str.startsWith(prefix)) {
      throw new Error(`${message}\n字符串: "${str}"\n期望前缀: "${prefix}"`);
    }
  }

  static endsWith(str, suffix, message = '字符串不以指定后缀结束') {
    if (typeof str !== 'string' || !str.endsWith(suffix)) {
      throw new Error(`${message}\n字符串: "${str}"\n期望后缀: "${suffix}"`);
    }
  }

  static matches(str, pattern, message = '字符串不匹配正则表达式') {
    if (typeof str !== 'string' || !pattern.test(str)) {
      throw new Error(`${message}\n字符串: "${str}"\n正则: ${pattern}`);
    }
  }

  /**
   * 数值断言
   */
  static greaterThan(actual, expected, message = '数值不大于期望值') {
    if (actual <= expected) {
      throw new Error(`${message}\n实际: ${actual}\n期望大于: ${expected}`);
    }
  }

  static greaterThanOrEqual(actual, expected, message = '数值不大于等于期望值') {
    if (actual < expected) {
      throw new Error(`${message}\n实际: ${actual}\n期望大于等于: ${expected}`);
    }
  }

  static lessThan(actual, expected, message = '数值不小于期望值') {
    if (actual >= expected) {
      throw new Error(`${message}\n实际: ${actual}\n期望小于: ${expected}`);
    }
  }

  static lessThanOrEqual(actual, expected, message = '数值不小于等于期望值') {
    if (actual > expected) {
      throw new Error(`${message}\n实际: ${actual}\n期望小于等于: ${expected}`);
    }
  }

  static inRange(value, min, max, message = '数值不在指定范围内') {
    if (value < min || value > max) {
      throw new Error(`${message}\n实际: ${value}\n期望范围: [${min}, ${max}]`);
    }
  }

  /**
   * 数组断言
   */
  static arrayLength(arr, expectedLength, message = '数组长度不匹配') {
    if (!Array.isArray(arr) || arr.length !== expectedLength) {
      throw new Error(`${message}\n实际长度: ${Array.isArray(arr) ? arr.length : 'not array'}\n期望长度: ${expectedLength}`);
    }
  }

  static arrayContains(arr, item, message = '数组不包含指定元素') {
    if (!Array.isArray(arr) || !arr.includes(item)) {
      throw new Error(`${message}\n数组: ${JSON.stringify(arr)}\n期望包含: ${JSON.stringify(item)}`);
    }
  }

  static arrayNotEmpty(arr, message = '数组不应为空') {
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error(`${message}\n实际: ${JSON.stringify(arr)}`);
    }
  }

  /**
   * HTTP响应断言
   */
  static httpStatus(response, expectedStatus, message = 'HTTP状态码不匹配') {
    if (response.status !== expectedStatus) {
      throw new Error(`${message}\n实际状态码: ${response.status}\n期望状态码: ${expectedStatus}`);
    }
  }

  static httpOk(response, message = 'HTTP响应不成功') {
    if (!response.ok) {
      throw new Error(`${message}\n状态码: ${response.status}\n状态文本: ${response.statusText}`);
    }
  }

  static responseTime(duration, maxTime, message = '响应时间超出限制') {
    if (duration > maxTime) {
      throw new Error(`${message}\n实际耗时: ${duration}ms\n最大允许: ${maxTime}ms`);
    }
  }

  /**
   * 异步断言
   */
  static async throws(asyncFn, expectedError, message = '期望抛出异常但没有') {
    try {
      await asyncFn();
      throw new Error(`${message}`);
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(`${message}\n期望错误包含: "${expectedError}"\n实际错误: "${error.message}"`);
      }
    }
  }

  static async notThrows(asyncFn, message = '不期望抛出异常但抛出了') {
    try {
      await asyncFn();
    } catch (error) {
      throw new Error(`${message}\n异常: ${error.message}`);
    }
  }

  /**
   * 页面元素断言（用于UI测试）
   */
  static async elementExists(page, selector, message = '页面元素不存在') {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`${message}\n选择器: ${selector}`);
    }
  }

  static async elementNotExists(page, selector, message = '页面元素不应存在') {
    const element = await page.$(selector);
    if (element) {
      throw new Error(`${message}\n选择器: ${selector}`);
    }
  }

  static async elementVisible(page, selector, message = '页面元素不可见') {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`${message}\n选择器: ${selector}\n原因: 元素不存在`);
    }
    
    const isVisible = await element.isIntersectingViewport();
    if (!isVisible) {
      throw new Error(`${message}\n选择器: ${selector}\n原因: 元素不在视口中`);
    }
  }

  static async elementText(page, selector, expectedText, message = '元素文本不匹配') {
    const element = await page.$(selector);
    if (!element) {
      throw new Error(`${message}\n选择器: ${selector}\n原因: 元素不存在`);
    }
    
    const actualText = await page.evaluate(el => el.textContent, element);
    if (actualText !== expectedText) {
      throw new Error(`${message}\n选择器: ${selector}\n期望文本: "${expectedText}"\n实际文本: "${actualText}"`);
    }
  }

  /**
   * 工具方法
   */
  static _deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (typeof a === 'object') {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      if (keysA.length !== keysB.length) return false;
      
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this._deepEqual(a[key], b[key])) return false;
      }
      
      return true;
    }
    
    return false;
  }
}

module.exports = Assert;