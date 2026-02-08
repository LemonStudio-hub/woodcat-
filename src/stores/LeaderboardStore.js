import { defineStore } from 'pinia';

// 排行榜数据管理
export const useLeaderboardStore = defineStore('leaderboard', {
  state: () => ({
    leaderboardData: [],
    loading: false,
    error: null,
    cache: null,
    cacheTimestamp: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5分钟缓存
    globalSupabaseClient: null
  }),
  getters: {
    sortedLeaderboard: (state) => {
      return [...state.leaderboardData].sort((a, b) => b.score - a.score);
    },
    isLoading: (state) => state.loading,
    hasError: (state) => !!state.error,
    errorMessage: (state) => state.error,
    leaderboardCount: (state) => state.leaderboardData.length
  },
  actions: {
    // 初始化Supabase客户端
    initSupabase(supabaseClient) {
      this.globalSupabaseClient = supabaseClient;
    },

    // 验证Supabase连接
    async validateSupabaseConnection() {
      if (!this.globalSupabaseClient) {
        return false;
      }

      try {
        const { error } = await this.globalSupabaseClient
          .from('gameleaderboard')
          .select('id')
          .limit(1);

        if (error) {
          Logger.error('Supabase连接验证失败:', error);
          return false;
        }
        return true;
      } catch (err) {
        Logger.error('Supabase连接验证异常:', err);
        return false;
      }
    },

    // 加载排行榜数据
    async loadLeaderboard() {
      // 检查缓存
      const now = Date.now();
      if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
        this.leaderboardData = this.cache;
        return this.cache;
      }

      this.loading = true;
      this.error = null;

      try {
        let allData = [];

        // 尝试从云端加载
        let cloudData = [];
        if (this.globalSupabaseClient) {
          try {
            const isConnected = await this.validateSupabaseConnection();
            if (isConnected) {
              // 实现重试机制
              let attempts = 0;
              const maxAttempts = 2;

              while (attempts < maxAttempts) {
                try {
                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('云端加载排行榜超时')), 10000);
                  });

                  const queryPromise = this.globalSupabaseClient
                    .from('gameleaderboard')
                    .select('*')
                    .order('score', { ascending: false })
                    .limit(20);

                  const response = await Promise.race([queryPromise, timeoutPromise]);
                  const { data, error } = response;

                  if (error) {
                    Logger.error(`云端加载排行榜失败 (尝试 ${attempts + 1}/${maxAttempts}):`, error);
                    attempts++;
                    if (attempts < maxAttempts) {
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      continue;
                    }
                  } else {
                    cloudData = data || [];
                    Logger.info(`从云端加载了 ${cloudData.length} 条排行榜数据`);
                    break;
                  }
                } catch (timeoutError) {
                  Logger.warn(`云端排行榜加载超时 (尝试 ${attempts + 1}/${maxAttempts}):`, timeoutError.message);
                  attempts++;
                  if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }
              }
            }
          } catch (connectionError) {
            Logger.error('云端加载异常:', connectionError);
          }
        }

        // 从本地存储获取数据
        let localLeaderboardEntries = [];
        try {
          // 这里需要集成本地存储逻辑
          // 暂时返回空数组，后续会集成data-manager.js
          localLeaderboardEntries = [];
        } catch (localError) {
          Logger.error('本地数据加载失败:', localError);
        }

        // 合并云端和本地数据
        const combinedDataMap = new Map();

        // 添加云端数据
        cloudData.forEach(item => {
          const key = `${item.player_name}_${item.game}_${item.score}_${new Date(item.created_at).getTime()}`;
          if (!combinedDataMap.has(key)) {
            combinedDataMap.set(key, item);
          }
        });

        // 添加本地数据
        localLeaderboardEntries.forEach(item => {
          const key = `${item.player_name}_${item.game}_${item.score}_${new Date(item.created_at).getTime()}`;
          if (!combinedDataMap.has(key)) {
            combinedDataMap.set(key, item);
          }
        });

        // 转换为数组并排序
        allData = Array.from(combinedDataMap.values())
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);

        // 更新缓存
        this.cache = allData;
        this.cacheTimestamp = now;

        // 更新状态
        this.leaderboardData = allData;
        this.loading = false;

        return allData;
      } catch (err) {
        Logger.error('加载排行榜时发生错误:', err);
        this.error = err.message;
        this.loading = false;
        return [];
      }
    },

    // 提交分数
    async submitScore(playerName, score, game) {
      if (!playerName || !score || !game) {
        throw new Error('玩家名称、分数和游戏不能为空');
      }

      const insertData = {
        player_name: playerName,
        score: parseInt(score),
        game: game,
        created_at: new Date().toISOString()
      };

      try {
        // 首先尝试本地存储
        let localSuccess = false;
        try {
          // 这里需要集成本地存储逻辑
          // 暂时返回true，后续会集成data-manager.js
          localSuccess = true;
        } catch (localError) {
          Logger.warn('本地存储失败:', localError);
        }

        // 尝试提交到云端
        let cloudSuccess = false;
        if (this.globalSupabaseClient) {
          try {
            const isConnected = await this.validateSupabaseConnection();
            if (isConnected) {
              let attempts = 0;
              const maxAttempts = 3;

              while (attempts < maxAttempts) {
                try {
                  const { data, error } = await this.globalSupabaseClient
                    .from('gameleaderboard')
                    .insert([insertData]);

                  if (error) {
                    Logger.error(`云端提交分数失败 (尝试 ${attempts + 1}/${maxAttempts}):`, error);
                    attempts++;
                    if (attempts < maxAttempts) {
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      continue;
                    }
                  } else {
                    cloudSuccess = true;
                    Logger.info('云端提交成功:', data);
                    break;
                  }
                } catch (err) {
                  Logger.error(`云端提交异常 (尝试 ${attempts + 1}/${maxAttempts}):`, err);
                  attempts++;
                  if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                  }
                }
              }
            }
          } catch (err) {
            Logger.error('云端提交时发生异常:', err);
          }
        }

        // 清除缓存，强制重新加载
        this.cache = null;
        this.cacheTimestamp = 0;

        return {
          localSuccess,
          cloudSuccess
        };
      } catch (err) {
        Logger.error('提交分数时发生错误:', err);
        throw err;
      }
    },

    // 清除缓存
    clearCache() {
      this.cache = null;
      this.cacheTimestamp = 0;
    }
  }
});
