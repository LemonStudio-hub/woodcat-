import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ConnectionStatus from './ConnectionStatus.vue';
import { useAppStore } from '../stores/AppStore';

// 模拟AppStore
vi.mock('../stores/AppStore', () => ({
  useAppStore: vi.fn(() => ({
    setConnectionStatus: vi.fn(),
    connectionStatus: 'online'
  }))
}));

// 模拟navigator.onLine
beforeEach(() => {
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true
  });
});

describe('ConnectionStatus.vue', () => {
  let wrapper;
  let appStore;

  beforeEach(() => {
    // 重置模拟
    appStore = {
      setConnectionStatus: vi.fn(),
      connectionStatus: 'online'
    };
    useAppStore.mockReturnValue(appStore);

    // 挂载组件
    wrapper = mount(ConnectionStatus);
  });

  it('默认显示在线状态', () => {
    expect(wrapper.text()).toContain('在线');
    expect(wrapper.find('.status-dot').classes()).toContain('online');
  });

  it('在线状态时显示绿色状态点', () => {
    const statusDot = wrapper.find('.status-dot');
    expect(statusDot.classes()).toContain('online');
  });

  it('在线状态时显示在线文本', () => {
    const statusText = wrapper.find('.status-text');
    expect(statusText.text()).toBe('在线');
  });

  it('默认不显示详细信息', () => {
    const details = wrapper.find('.status-details');
    expect(details.exists()).toBe(false);
  });

  it('显示详细信息时渲染连接类型和最后更新时间', async () => {
    await wrapper.setProps({ showDetails: true });
    const details = wrapper.find('.status-details');
    expect(details.exists()).toBe(true);
    expect(details.text()).toContain('未知'); // 默认连接类型
    expect(details.text()).toContain('最后更新:');
  });

  it('紧凑模式下应用紧凑样式', async () => {
    await wrapper.setProps({ compact: true });
    expect(wrapper.find('.connection-status').classes()).toContain('compact');
  });

  it('离线状态时显示红色状态点', async () => {
    // 直接修改组件内部的connectionStatus值
    wrapper.vm.connectionStatus = 'offline';
    await wrapper.vm.$nextTick();

    const statusDot = wrapper.find('.status-dot');
    expect(statusDot.classes()).toContain('offline');
  });

  it('离线状态时显示离线文本', async () => {
    // 直接修改组件内部的connectionStatus值
    wrapper.vm.connectionStatus = 'offline';
    await wrapper.vm.$nextTick();

    const statusText = wrapper.find('.status-text');
    expect(statusText.text()).toBe('离线');
  });

  it('在线状态时容器应用在线样式', () => {
    const container = wrapper.find('.connection-status');
    expect(container.classes()).toContain('online');
  });

  it('离线状态时容器应用离线样式', async () => {
    // 直接修改组件内部的connectionStatus值
    wrapper.vm.connectionStatus = 'offline';
    await wrapper.vm.$nextTick();

    const container = wrapper.find('.connection-status');
    expect(container.classes()).toContain('offline');
  });

  it('触发online事件时更新为在线状态', async () => {
    // 先设置为离线状态
    wrapper.vm.connectionStatus = 'offline';
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('离线');

    // 触发online事件
    window.dispatchEvent(new Event('online'));

    // 等待事件处理
    await new Promise(resolve => setTimeout(resolve, 100));

    // 检查状态更新
    expect(wrapper.text()).toContain('在线');
  });

  it('触发offline事件时更新为离线状态', async () => {
    // 模拟在线状态
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    });

    // 重新挂载组件
    wrapper = mount(ConnectionStatus);
    expect(wrapper.text()).toContain('在线');

    // 触发offline事件
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true
    });
    window.dispatchEvent(new Event('offline'));

    // 等待事件处理
    await new Promise(resolve => setTimeout(resolve, 100));

    // 检查状态更新
    expect(wrapper.text()).toContain('离线');
  });
});
