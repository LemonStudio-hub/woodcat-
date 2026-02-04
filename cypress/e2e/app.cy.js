/// <reference types="cypress" />

describe('Woodcat Game Collection E2E Tests', () => {
  beforeEach(() => {
    // 访问Vue版本的首页
    cy.visit('/index-vue.html');
  });

  it('访问首页并验证基本结构', () => {
    // 验证页面标题
    cy.title().should('include', '木头猫');
    
    // 验证Header组件
    cy.get('.header').should('exist');
    cy.get('.logo h1').should('contain', '木头猫');
    cy.get('.slogan').should('contain', '发现有趣的小游戏');
    
    // 验证导航菜单
    cy.get('.nav').should('exist');
    cy.get('.nav-link').should('have.length.at.least', 3);
    cy.get('.nav-link').eq(0).should('contain', '首页');
    cy.get('.nav-link').eq(1).should('contain', '游戏');
    cy.get('.nav-link').eq(2).should('contain', '排行榜');
    
    // 验证Hero组件
    cy.get('.hero').should('exist');
    cy.get('.hero h2').should('contain', '欢迎来到木头猫游戏世界');
    
    // 验证GamesSection组件
    cy.get('.games-section').should('exist');
    cy.get('.games-section h3').should('contain', '精选游戏');
    
    // 验证游戏卡片
    cy.get('.game-card').should('have.length.at.least', 1);
    
    // 验证Leaderboard组件
    cy.get('.leaderboard').should('exist');
    
    // 验证页脚
    cy.get('.footer').should('exist');
    cy.get('.copyright-notice').should('contain', '© 2026 木头猫');
  });

  it('测试导航菜单功能', () => {
    // 点击游戏链接
    cy.get('.nav-link').contains('游戏').click();
    
    // 验证页面滚动到游戏部分
    cy.get('.games-section').should('be.visible');
    
    // 点击排行榜链接
    cy.get('.nav-link').contains('排行榜').click();
    
    // 验证页面滚动到排行榜部分
    cy.get('.leaderboard').should('be.visible');
    
    // 点击首页链接
    cy.get('.nav-link').contains('首页').click();
    
    // 验证页面滚动到顶部
    cy.window().then((win) => {
      expect(win.scrollY).to.be.lessThan(100);
    });
  });

  it('测试移动端菜单功能', () => {
    // 设置屏幕尺寸为移动端
    cy.viewport('iphone-x');
    
    // 验证桌面导航隐藏
    cy.get('.desktop-nav').should('not.be.visible');
    
    // 验证移动端菜单按钮显示
    cy.get('.mobile-menu-btn').should('be.visible');
    
    // 点击移动端菜单按钮
    cy.get('.mobile-menu-btn').click();
    
    // 验证导航菜单打开
    cy.get('.nav.mobile-open').should('be.visible');
    
    // 点击关闭菜单
    cy.get('.nav-link').first().click();
    
    // 验证导航菜单关闭
    cy.get('.nav.mobile-open').should('not.be.visible');
  });

  it('测试游戏卡片交互', () => {
    // 验证游戏卡片存在
    cy.get('.game-card').should('have.length.at.least', 1);
    
    // 点击第一个游戏卡片
    cy.get('.game-card').first().click();
    
    // 验证页面跳转到游戏页面
    cy.url().should('include', '/games/');
  });

  it('测试排行榜功能', () => {
    // 滚动到排行榜部分
    cy.get('.leaderboard').scrollIntoView();
    
    // 验证排行榜表格存在
    cy.get('.leaderboard-table').should('exist');
    
    // 验证排行榜表头
    cy.get('.leaderboard-table th').should('have.length', 5);
    cy.get('.leaderboard-table th').eq(0).should('contain', '排名');
    cy.get('.leaderboard-table th').eq(1).should('contain', '玩家');
    cy.get('.leaderboard-table th').eq(2).should('contain', '分数');
    cy.get('.leaderboard-table th').eq(3).should('contain', '游戏');
    cy.get('.leaderboard-table th').eq(4).should('contain', '日期');
  });

  it('测试响应式设计', () => {
    // 测试桌面端布局
    cy.viewport('macbook-13');
    cy.get('.desktop-nav').should('be.visible');
    cy.get('.mobile-menu-btn').should('not.be.visible');
    cy.get('.games-grid').should('have.css', 'display', 'grid');
    
    // 测试平板端布局
    cy.viewport('ipad-2');
    cy.get('.desktop-nav').should('be.visible');
    cy.get('.mobile-menu-btn').should('not.be.visible');
    
    // 测试移动端布局
    cy.viewport('iphone-x');
    cy.get('.desktop-nav').should('not.be.visible');
    cy.get('.mobile-menu-btn').should('be.visible');
    cy.get('.header').should('have.css', 'padding', '10px 15px');
  });

  it('测试页面加载性能', () => {
    // 测量页面加载时间
    cy.window().then((win) => {
      const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
      expect(loadTime).to.be.lessThan(3000); // 页面加载时间应小于3秒
    });
    
    // 验证所有资源都已加载
    cy.get('img').each(($img) => {
      expect($img[0].naturalWidth).to.be.greaterThan(0);
    });
  });
});
