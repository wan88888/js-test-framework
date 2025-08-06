const fs = require('fs');
const path = require('path');

class Reporter {
  constructor() {
    this.reportDir = './reports';
    this.ensureReportDir();
  }

  // 确保报告目录存在
  ensureReportDir() {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  // 清理旧的测试报告
  cleanOldReports() {
    try {
      const files = fs.readdirSync(this.reportDir);
      const reportFiles = files.filter(file => 
        file.startsWith('test-report-') && (file.endsWith('.json') || file.endsWith('.html'))
      );
      
      reportFiles.forEach(file => {
        const filePath = path.join(this.reportDir, file);
        fs.unlinkSync(filePath);
      });
      
      if (reportFiles.length > 0) {
        console.log(`🧹 已清理 ${reportFiles.length} 个旧测试报告`);
      }
    } catch (error) {
      console.warn('清理旧报告时出错:', error.message);
    }
  }

  // 生成测试报告
  async generateReport(results, duration) {
    // 清理旧报告
    this.cleanOldReports();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 生成JSON报告
    await this.generateJSONReport(results, duration, timestamp);
    
    // 生成HTML报告
    await this.generateHTMLReport(results, duration, timestamp);
    
    console.log(`\n📄 测试报告已生成:`);
    console.log(`   JSON: ${path.join(this.reportDir, `test-report-${timestamp}.json`)}`);
    console.log(`   HTML: ${path.join(this.reportDir, `test-report-${timestamp}.html`)}`);
  }

  // 生成JSON报告
  async generateJSONReport(results, duration, timestamp) {
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      summary: this.generateSummary(results),
      results
    };
    
    const filePath = path.join(this.reportDir, `test-report-${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  // 生成HTML报告
  async generateHTMLReport(results, duration, timestamp) {
    const summary = this.generateSummary(results);
    const html = this.generateHTMLTemplate(results, duration, summary);
    
    const filePath = path.join(this.reportDir, `test-report-${timestamp}.html`);
    fs.writeFileSync(filePath, html);
  }

  // 生成测试摘要
  generateSummary(results) {
    const total = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
    
    return {
      total,
      passed,
      failed,
      passRate: parseFloat(passRate)
    };
  }

  // 生成HTML模板
  generateHTMLTemplate(results, duration, summary) {
    const testRows = results.map(result => {
      const statusIcon = result.status === 'passed' ? '✅' : '❌';
      const statusClass = result.status === 'passed' ? 'success' : 'danger';
      const errorDetails = result.error ? `<div class="error-details">${this.escapeHtml(result.error)}</div>` : '';
      
      return `
        <tr class="${statusClass}">
          <td>${statusIcon} ${this.escapeHtml(result.name)}</td>
          <td><span class="badge badge-${result.type}">${result.type.toUpperCase()}</span></td>
          <td><span class="badge badge-${result.status}">${result.status.toUpperCase()}</span></td>
          <td>${result.duration}ms</td>
          <td>${errorDetails}</td>
        </tr>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试报告 - JavaScript 测试框架</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 4px solid #667eea;
        }
        
        .summary-card.success {
            border-left-color: #28a745;
        }
        
        .summary-card.danger {
            border-left-color: #dc3545;
        }
        
        .summary-card h3 {
            font-size: 2em;
            margin-bottom: 10px;
            color: #667eea;
        }
        
        .summary-card.success h3 {
            color: #28a745;
        }
        
        .summary-card.danger h3 {
            color: #dc3545;
        }
        
        .summary-card p {
            color: #666;
            font-weight: 500;
        }
        
        .results {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .results-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .results-header h2 {
            color: #495057;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        
        tr.success {
            background-color: #f8fff9;
        }
        
        tr.danger {
            background-color: #fff5f5;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .badge-ui {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        
        .badge-api {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }
        
        .badge-passed {
            background-color: #e8f5e8;
            color: #2e7d32;
        }
        
        .badge-failed {
            background-color: #ffebee;
            color: #c62828;
        }
        
        .error-details {
            margin-top: 8px;
            padding: 8px;
            background-color: #ffebee;
            border-left: 3px solid #f44336;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #c62828;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            table {
                font-size: 0.9em;
            }
            
            th, td {
                padding: 10px 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 测试报告</h1>
            <p>JavaScript 测试框架 - 生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>${summary.total}</h3>
                <p>总测试数</p>
            </div>
            <div class="summary-card success">
                <h3>${summary.passed}</h3>
                <p>通过测试</p>
            </div>
            <div class="summary-card danger">
                <h3>${summary.failed}</h3>
                <p>失败测试</p>
            </div>
            <div class="summary-card">
                <h3>${summary.passRate}%</h3>
                <p>通过率</p>
            </div>
            <div class="summary-card">
                <h3>${duration}ms</h3>
                <p>总耗时</p>
            </div>
        </div>
        
        <div class="results">
            <div class="results-header">
                <h2>📋 详细结果</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>测试名称</th>
                        <th>类型</th>
                        <th>状态</th>
                        <th>耗时</th>
                        <th>错误信息</th>
                    </tr>
                </thead>
                <tbody>
                    ${testRows}
                </tbody>
            </table>
        </div>
        
        <div class="footer">
            <p>由 JavaScript 测试框架生成 | 基于 Node.js + Puppeteer + Fetch API</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // HTML转义
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // 生成控制台报告
  printConsoleReport(results, duration) {
    const summary = this.generateSummary(results);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 详细测试报告');
    console.log('='.repeat(60));
    
    // 按类型分组显示
    const groupedResults = this.groupResultsByType(results);
    
    Object.keys(groupedResults).forEach(type => {
      console.log(`\n🔍 ${type.toUpperCase()} 测试:`);
      console.log('-'.repeat(40));
      
      groupedResults[type].forEach(result => {
        const icon = result.status === 'passed' ? '✅' : '❌';
        console.log(`${icon} ${result.name} (${result.duration}ms)`);
        
        if (result.error) {
          console.log(`   错误: ${result.error}`);
        }
      });
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`📈 通过率: ${summary.passRate}% (${summary.passed}/${summary.total})`);
    console.log(`⏱️  总耗时: ${duration}ms`);
    console.log('='.repeat(60));
  }

  // 按类型分组结果
  groupResultsByType(results) {
    return results.reduce((groups, result) => {
      const type = result.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(result);
      return groups;
    }, {});
  }
}

module.exports = Reporter;