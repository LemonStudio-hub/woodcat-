/**
 * 木头猫游戏合集 - Web Worker管理器
 * 提供方便的Web Worker使用接口
 */

const WorkerManager = {
  // Worker实例
  workers: {},

  // 任务队列
  taskQueue: {},

  // 回调函数
  callbacks: {},

  // 任务计数器
  taskCounter: 0,

  /**
   * 初始化Worker管理器
   */
  init() {
    console.log('[WorkerManager] Initializing...');
    this.setupWorker('gameWorker', '/js/gameWorker.js');
  },

  /**
   * 设置Worker
   * @param {string} name - Worker名称
   * @param {string} url - Worker文件路径
   */
  setupWorker(name, url) {
    try {
      const worker = new Worker(url);
      
      worker.onmessage = (e) => {
        const { type, taskId, success, result, error } = e.data;
        
        if (type === 'INIT') {
          console.log('[WorkerManager] Worker initialized:', name, e.data);
          return;
        }
        
        // 处理任务结果
        const callback = this.callbacks[taskId];
        if (callback) {
          if (success) {
            callback.resolve(result);
          } else {
            callback.reject(error);
          }
          delete this.callbacks[taskId];
        }
      };
      
      worker.onerror = (error) => {
        console.error('[WorkerManager] Worker error:', name, error);
      };
      
      this.workers[name] = worker;
      console.log('[WorkerManager] Worker setup:', name);
    } catch (error) {
      console.error('[WorkerManager] Failed to setup worker:', name, error);
    }
  },

  /**
   * 执行任务
   * @param {string} workerName - Worker名称
   * @param {string} type - 任务类型
   * @param {Object} params - 任务参数
   * @returns {Promise} 任务结果
   */
  async execute(workerName, type, params) {
    const worker = this.workers[workerName];
    
    if (!worker) {
      return Promise.reject(new Error(`Worker not found: ${workerName}`));
    }
    
    const taskId = `task_${++this.taskCounter}`;
    
    return new Promise((resolve, reject) => {
      this.callbacks[taskId] = { resolve, reject };
      
      worker.postMessage({
        type,
        taskId,
        params
      });
    });
  },

  /**
   * 寻路
   * @param {Object} params - 寻路参数
   * @returns {Promise<Array>} 路径
   */
  async findPath(params) {
    return this.execute('gameWorker', 'pathfinding', params);
  },

  /**
   * 物理模拟
   * @param {Object} params - 物理参数
   * @returns {Promise<Object>} 物理状态
   */
  async simulatePhysics(params) {
    return this.execute('gameWorker', 'physics', params);
  },

  /**
   * AI决策
   * @param {Object} params - AI参数
   * @returns {Promise<Object>} AI决策
   */
  async calculateAIDecision(params) {
    return this.execute('gameWorker', 'ai_decision', params);
  },

  /**
   * 计算分数
   * @param {Object} params - 分数参数
   * @returns {Promise<Object>} 计算结果
   */
  async calculateScore(params) {
    return this.execute('gameWorker', 'score_calculation', params);
  },

  /**
   * 数据分析
   * @param {Object} params - 分析参数
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeData(params) {
    return this.execute('gameWorker', 'data_analysis', params);
  },

  /**
   * 批量执行任务
   * @param {Array<Object>} tasks - 任务数组
   * @returns {Promise<Array>} 所有任务结果
   */
  async executeBatch(tasks) {
    const promises = tasks.map(task =>
      this.execute(task.workerName, task.type, task.params)
    );
    
    return Promise.all(promises);
  },

  /**
   * 终止Worker
   * @param {string} name - Worker名称
   */
  terminateWorker(name) {
    const worker = this.workers[name];
    if (worker) {
      worker.terminate();
      delete this.workers[name];
      console.log('[WorkerManager] Worker terminated:', name);
    }
  },

  /**
   * 终止所有Worker
   */
  terminateAll() {
    Object.keys(this.workers).forEach(name => {
      this.terminateWorker(name);
    });
    console.log('[WorkerManager] All workers terminated');
  },

  /**
   * 获取Worker状态
   * @returns {Object} Worker状态
   */
  getStatus() {
    return {
      workers: Object.keys(this.workers),
      activeTasks: Object.keys(this.callbacks).length,
      totalTasks: this.taskCounter
    };
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.WorkerManager = WorkerManager;
  
  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WorkerManager.init());
  } else {
    WorkerManager.init();
  }
}

// 导出模块
export default WorkerManager;