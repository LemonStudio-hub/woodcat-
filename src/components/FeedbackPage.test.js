import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FeedbackPage from './FeedbackPage.vue';

// 模拟useRouter
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}));

describe('FeedbackPage.vue', () => {
  let wrapper;

  beforeEach(() => {
    // 挂载组件
    wrapper = mount(FeedbackPage);
  });

  it('渲染正确的标题和描述', () => {
    expect(wrapper.text()).toContain('反馈与支持');
    expect(wrapper.text()).toContain('感谢您使用木头猫游戏合集！');
    expect(wrapper.text()).toContain('我们非常重视您的意见和建议，欢迎随时联系我们。');
  });

  it('渲染联系选项卡片', () => {
    const contactCards = wrapper.findAll('.contact-card');
    expect(contactCards.length).toBe(2);
  });

  it('渲染GitHub仓库联系卡片', () => {
    const contactCards = wrapper.findAll('.contact-card');
    const githubCard = contactCards[0];
    expect(githubCard.text()).toContain('GitHub 仓库');
    expect(githubCard.text()).toContain('访问我们的GitHub仓库，查看源代码，提交问题或贡献代码');
    expect(githubCard.text()).toContain('https://github.com/LemonStudio-hub/woodcat-');
  });

  it('渲染邮箱联系卡片', () => {
    const contactCards = wrapper.findAll('.contact-card');
    const emailCard = contactCards[1];
    expect(emailCard.text()).toContain('联系邮箱');
    expect(emailCard.text()).toContain('发送邮件与我们交流，分享您的想法和建议');
    expect(emailCard.text()).toContain('lemonhub@163.com');
  });

  it('渲染操作按钮', () => {
    const actionButtons = wrapper.findAll('.action-btn');
    expect(actionButtons.length).toBe(2);
  });

  it('渲染GitHub访问按钮', () => {
    const githubBtn = wrapper.find('.github-btn');
    expect(githubBtn.exists()).toBe(true);
    expect(githubBtn.text()).toContain('访问仓库');
  });

  it('渲染返回首页按钮', () => {
    const backBtn = wrapper.find('.back-btn');
    expect(backBtn.exists()).toBe(true);
    expect(backBtn.text()).toContain('返回首页');
  });

  it('GitHub按钮有正确的链接', () => {
    const githubLink = wrapper.find('.github-btn');
    expect(githubLink.attributes('href')).toBe('https://github.com/LemonStudio-hub/woodcat-');
    expect(githubLink.attributes('target')).toBe('_blank');
  });

  it('渲染社交链接', () => {
    const socialLinks = wrapper.findAll('.social-link');
    expect(socialLinks.length).toBe(2);
  });

  it('GitHub社交链接有正确的链接', () => {
    const socialLinks = wrapper.findAll('.social-link');
    const githubLink = socialLinks[0];
    expect(githubLink.attributes('href')).toBe('https://github.com/LemonStudio-hub/woodcat-');
    expect(githubLink.attributes('target')).toBe('_blank');
  });

  it('邮箱社交链接有正确的链接', () => {
    const socialLinks = wrapper.findAll('.social-link');
    const emailLink = socialLinks[1];
    expect(emailLink.attributes('href')).toBe('mailto:lemonhub@163.com');
  });

  it('点击GitHub按钮时触发trackClick方法', async () => {
    // 模拟console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const githubBtn = wrapper.find('.github-btn');
    await githubBtn.trigger('click');

    expect(consoleSpy).toHaveBeenCalledWith('Feedback page action: github');
    consoleSpy.mockRestore();
  });

  it('点击GitHub社交链接时触发trackClick方法', async () => {
    // 模拟console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const socialLinks = wrapper.findAll('.social-link');
    const githubLink = socialLinks[0];
    await githubLink.trigger('click');

    expect(consoleSpy).toHaveBeenCalledWith('Feedback page action: github-social');
    consoleSpy.mockRestore();
  });

  it('点击邮箱社交链接时触发trackClick方法', async () => {
    // 模拟console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const socialLinks = wrapper.findAll('.social-link');
    const emailLink = socialLinks[1];
    await emailLink.trigger('click');

    expect(consoleSpy).toHaveBeenCalledWith('Feedback page action: email');
    consoleSpy.mockRestore();
  });

  it('点击返回首页按钮时尝试返回上一页', async () => {
    // 模拟window.history.length
    Object.defineProperty(window.history, 'length', {
      value: 2,
      writable: true
    });

    // 模拟window.history.back
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    const backBtn = wrapper.find('.back-btn');
    await backBtn.trigger('click');

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('历史记录不足时点击返回首页按钮跳转到首页', async () => {
    // 模拟window.history.length
    Object.defineProperty(window.history, 'length', {
      value: 1,
      writable: true
    });

    // 模拟window.location.href
    const locationSpy = vi.spyOn(window.location, 'href', 'set').mockImplementation(() => {});

    const backBtn = wrapper.find('.back-btn');
    await backBtn.trigger('click');

    expect(locationSpy).toHaveBeenCalledWith('/');
    locationSpy.mockRestore();
  });

  it('渲染装饰元素', () => {
    const decorations = wrapper.findAll('.decoration');
    expect(decorations.length).toBe(3);
  });
});
