const puppeteer = require('puppeteer');

async function testFrontendRegister() {
  let browser;
  
  try {
    console.log('启动浏览器...');
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // 监听控制台消息
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('浏览器错误:', msg.text());
      }
    });
    
    console.log('访问注册页面...');
    await page.goto('http://localhost:5173/auth?mode=register', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // 等待注册表单加载
    await page.waitForSelector('input[id="username"]', { timeout: 5000 });
    console.log('注册表单已加载');
    
    // 测试1: 成功注册
    console.log('\n=== 测试1: 成功注册 ===');
    const testUser = {
      username: '前端测试用户',
      email: 'frontend-test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };
    
    await page.type('input[id="username"]', testUser.username);
    await page.type('input[id="email"]', testUser.email);
    await page.type('input[id="password"]', testUser.password);
    await page.type('input[id="confirmPassword"]', testUser.confirmPassword);
    
    // 点击注册按钮
    await page.click('button[type="submit"]');
    
    // 等待响应
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 检查是否跳转到仪表盘
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ 注册成功，已跳转到仪表盘');
    } else {
      console.log('❌ 注册失败或未跳转');
      
      // 检查是否有错误消息
      const errorElement = await page.$('.text-red-600');
      if (errorElement) {
        const errorText = await page.evaluate(el => el.textContent, errorElement);
        console.log('错误消息:', errorText);
      }
    }
    
    // 返回注册页面测试其他情况
    await page.goto('http://localhost:5173/auth?mode=register', { 
      waitUntil: 'networkidle0' 
    });
    await page.waitForSelector('input[id="username"]', { timeout: 5000 });
    
    // 测试2: 重复邮箱注册
    console.log('\n=== 测试2: 重复邮箱注册 ===');
    await page.evaluate(() => {
      document.querySelector('input[id="username"]').value = '';
      document.querySelector('input[id="email"]').value = '';
      document.querySelector('input[id="password"]').value = '';
      document.querySelector('input[id="confirmPassword"]').value = '';
    });
    
    await page.type('input[id="username"]', '重复用户');
    await page.type('input[id="email"]', testUser.email); // 使用相同邮箱
    await page.type('input[id="password"]', testUser.password);
    await page.type('input[id="confirmPassword"]', testUser.confirmPassword);
    
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 检查错误消息
    const errorElement = await page.$('.text-red-600');
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.log('✅ 重复邮箱验证成功，错误消息:', errorText);
    } else {
      console.log('❌ 重复邮箱验证失败，未显示错误消息');
    }
    
    // 测试3: 弱密码
    console.log('\n=== 测试3: 弱密码验证 ===');
    await page.evaluate(() => {
      document.querySelector('input[id="username"]').value = '';
      document.querySelector('input[id="email"]').value = '';
      document.querySelector('input[id="password"]').value = '';
      document.querySelector('input[id="confirmPassword"]').value = '';
    });
    
    await page.type('input[id="username"]', '弱密码用户');
    await page.type('input[id="email"]', 'weak-password@example.com');
    await page.type('input[id="password"]', '123'); // 弱密码
    await page.type('input[id="confirmPassword"]', '123');
    
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 检查密码强度提示或错误消息
    const passwordError = await page.$('input[id="password"] + p.text-red-600');
    if (passwordError) {
      const errorText = await page.evaluate(el => el.textContent, passwordError);
      console.log('✅ 弱密码验证成功，错误消息:', errorText);
    } else {
      console.log('❌ 弱密码验证失败，未显示错误消息');
    }
    
    console.log('\n=== 前端注册测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testFrontendRegister();