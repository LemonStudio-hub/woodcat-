/**
 * 木头猫游戏合集 - Web Worker
 * 用于处理复杂的游戏计算任务，避免阻塞主线程
 */

// 游戏计算任务类型
const TASK_TYPES = {
  PATHFINDING: 'pathfinding',
  PHYSICS: 'physics',
  AI_DECISION: 'ai_decision',
  SCORE_CALCULATION: 'score_calculation',
  DATA_ANALYSIS: 'data_analysis'
};

/**
 * A*寻路算法
 * @param {Object} params - 寻路参数
 * @returns {Array} 路径点数组
 */
function aStarPathfinding(params) {
  const { start, end, grid, obstacles } = params;
  
  // 简化版的A*算法实现
  const openSet = [start];
  const closedSet = new Set();
  const cameFrom = new Map();
  const gScore = new Map();
  const fScore = new Map();
  
  const getG = (node) => gScore.get(node) ?? Infinity;
  const getF = (node) => fScore.get(node) ?? Infinity;
  
  gScore.set(start, 0);
  fScore.set(start, heuristic(start, end));
  
  while (openSet.length > 0) {
    // 找到f值最小的节点
    openSet.sort((a, b) => getF(a) - getF(b));
    const current = openSet.shift();
    
    if (current.x === end.x && current.y === end.y) {
      // 找到路径，重建路径
      return reconstructPath(cameFrom, current);
    }
    
    closedSet.add(`${current.x},${current.y}`);
    
    // 获取相邻节点
    const neighbors = getNeighbors(current, grid, obstacles);
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      
      if (closedSet.has(neighborKey)) continue;
      
      const tentativeGScore = getG(current) + 1;
      
      if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
        openSet.push(neighbor);
      } else if (tentativeGScore >= getG(neighbor)) {
        continue;
      }
      
      cameFrom.set(neighborKey, current);
      gScore.set(neighborKey, tentativeGScore);
      fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));
    }
  }
  
  return []; // 没有找到路径
}

/**
 * 启发式函数（曼哈顿距离）
 */
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * 获取相邻节点
 */
function getNeighbors(node, grid, obstacles) {
  const neighbors = [];
  const directions = [
    { dx: 0, dy: -1 }, // 上
    { dx: 1, dy: 0 },  // 右
    { dx: 0, dy: 1 },  // 下
    { dx: -1, dy: 0 }, // 左
    { dx: 1, dy: -1 }, // 右上
    { dx: 1, dy: 1 },  // 右下
    { dx: -1, dy: 1 }, // 左下
    { dx: -1, dy: -1 } // 左上
  ];
  
  for (const dir of directions) {
    const x = node.x + dir.dx;
    const y = node.y + dir.dy;
    
    // 检查边界
    if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) continue;
    
    // 检查障碍物
    const isObstacle = obstacles.some(o => o.x === x && o.y === y);
    if (isObstacle) continue;
    
    neighbors.push({ x, y });
  }
  
  return neighbors;
}

/**
 * 重建路径
 */
function reconstructPath(cameFrom, current) {
  const path = [current];
  let currentKey = `${current.x},${current.y}`;
  
  while (cameFrom.has(currentKey)) {
    current = cameFrom.get(currentKey);
    currentKey = `${current.x},${current.y}`;
    path.unshift(current);
  }
  
  return path;
}

/**
 * 物理模拟计算
 * @param {Object} params - 物理参数
 * @returns {Object} 物理状态
 */
function simulatePhysics(params) {
  const { objects, deltaTime, gravity, friction } = params;
  
  // 简化的物理模拟
  const result = objects.map(obj => {
    // 应用重力
    if (obj.affectedByGravity) {
      obj.velocityY += gravity * deltaTime;
    }
    
    // 应用摩擦力
    obj.velocityX *= Math.pow(1 - friction, deltaTime);
    obj.velocityY *= Math.pow(1 - friction, deltaTime);
    
    // 更新位置
    obj.x += obj.velocityX * deltaTime;
    obj.y += obj.velocityY * deltaTime;
    
    // 边界检测
    if (obj.x < 0) {
      obj.x = 0;
      obj.velocityX *= -0.5; // 反弹
    }
    if (obj.x > params.width) {
      obj.x = params.width;
      obj.velocityX *= -0.5;
    }
    if (obj.y < 0) {
      obj.y = 0;
      obj.velocityY *= -0.5;
    }
    if (obj.y > params.height) {
      obj.y = params.height;
      obj.velocityY *= -0.5;
    }
    
    return obj;
  });
  
  return { objects: result };
}

/**
 * AI决策计算
 * @param {Object} params - AI参数
 * @returns {Object} AI决策
 */
function calculateAIDecision(params) {
  const { agent, enemies, obstacles, target } = params;
  
  // 计算到目标的距离
  const distanceToTarget = Math.hypot(target.x - agent.x, target.y - agent.y);
  
  // 检查是否有障碍物阻挡
  const hasObstacleBetween = obstacles.some(obstacle => {
    // 简化的障碍物检测
    return Math.hypot(obstacle.x - agent.x, obstacle.y - agent.y) < distanceToTarget;
  });
  
  // 寻找最近的敌人
  const nearestEnemy = enemies.reduce((nearest, enemy) => {
    const dist = Math.hypot(enemy.x - agent.x, enemy.y - agent.y);
    return dist < nearest.distance ? { enemy, distance: dist } : nearest;
  }, { enemy: null, distance: Infinity });
  
  // 计算最佳行动
  let action = 'patrol';
  let direction = { x: 0, y: 0 };
  
  if (nearestEnemy.distance < 200) {
    // 有敌人接近，决定行动
    if (hasObstacleBetween) {
      action = 'avoid';
      direction = calculateAvoidDirection(agent, nearestEnemy.enemy);
    } else {
      action = 'attack';
      direction = calculateAttackDirection(agent, nearestEnemy.enemy);
    }
  } else if (distanceToTarget < 300) {
    // 接近目标，追踪
    action = 'chase';
    direction = {
      x: target.x - agent.x,
      y: target.y - agent.y
    };
  }
  
  // 归一化方向
  const magnitude = Math.hypot(direction.x, direction.y);
  if (magnitude > 0) {
    direction.x /= magnitude;
    direction.y /= magnitude;
  }
  
  return {
    action,
    direction,
    targetId: nearestEnemy.enemy?.id || null
  };
}

/**
 * 计算躲避方向
 */
function calculateAvoidDirection(agent, enemy) {
  const dx = agent.x - enemy.x;
  const dy = agent.y - enemy.y;
  const distance = Math.hypot(dx, dy);
  
  return {
    x: dx / distance,
    y: dy / distance
  };
}

/**
 * 计算攻击方向
 */
function calculateAttackDirection(agent, enemy) {
  const dx = enemy.x - agent.x;
  const dy = enemy.y - agent.y;
  const distance = Math.hypot(dx, dy);
  
  return {
    x: dx / distance,
    y: dy / distance
  };
}

/**
 * 分数计算
 * @param {Object} params - 分数参数
 * @returns {Object} 计算结果
 */
function calculateScore(params) {
  const { baseScore, timeBonus, difficultyMultiplier, comboMultiplier } = params;
  
  // 计算时间奖励（时间越短奖励越高）
  const timeScore = Math.max(0, 1000 - timeBonus) * 0.1;
  
  // 计算难度奖励
  const difficultyScores = {
    easy: 1,
    medium: 1.5,
    hard: 2
  };
  const difficultyScore = baseScore * (difficultyScores[difficultyMultiplier] || 1);
  
  // 计算连击奖励
  const comboScore = baseScore * (comboMultiplier - 1) * 0.5;
  
  // 总分数
  const totalScore = Math.floor(difficultyScore + timeScore + comboScore);
  
  return {
    totalScore,
    breakdown: {
      baseScore: Math.floor(difficultyScore),
      timeBonus: Math.floor(timeScore),
      comboBonus: Math.floor(comboScore)
    }
  };
}

/**
 * 数据分析
 * @param {Object} params - 分析参数
 * @returns {Object} 分析结果
 */
function analyzeData(params) {
  const { data, type } = params;
  
  switch (type) {
    case 'average':
      return calculateAverage(data);
    case 'statistics':
      return calculateStatistics(data);
    case 'distribution':
      return calculateDistribution(data);
    default:
      throw new Error(`Unknown analysis type: ${type}`);
  }
}

/**
 * 计算平均值
 */
function calculateAverage(data) {
  if (!data || data.length === 0) {
    return { average: 0, count: 0 };
  }
  
  const sum = data.reduce((acc, val) => acc + val, 0);
  const average = sum / data.length;
  
  return { average, count: data.length };
}

/**
 * 计算统计数据
 */
function calculateStatistics(data) {
  if (!data || data.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      count: 0
    };
  }
  
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean,
    median,
    stdDev,
    min: sorted[0],
    max: sorted[n - 1],
    count: n
  };
}

/**
 * 计算分布
 */
function calculateDistribution(data) {
  if (!data || data.length === 0) {
    return { distribution: [] };
  }
  
  const n = data.length;
  const binCount = Math.min(10, n);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binSize = (max - min) / binCount;
  
  const distribution = Array(binCount).fill(0);
  
  data.forEach(value => {
    const binIndex = Math.min(
      Math.floor((value - min) / binSize),
      binCount - 1
    );
    distribution[binIndex]++;
  });
  
  return {
    distribution: distribution.map((count, index) => ({
      bin: index,
      min: min + index * binSize,
      max: min + (index + 1) * binSize,
      count,
      percentage: (count / n) * 100
    })),
    min,
    max,
    binCount
  };
}

/**
 * 处理消息
 */
self.onmessage = function(e) {
  const { type, taskId, params } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case TASK_TYPES.PATHFINDING:
        result = aStarPathfinding(params);
        break;
      case TASK_TYPES.PHYSICS:
        result = simulatePhysics(params);
        break;
      case TASK_TYPES.AI_DECISION:
        result = calculateAIDecision(params);
        break;
      case TASK_TYPES.SCORE_CALCULATION:
        result = calculateScore(params);
        break;
      case TASK_TYPES.DATA_ANALYSIS:
        result = analyzeData(params);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    // 发送结果回主线程
    self.postMessage({
      taskId,
      success: true,
      result
    });
  } catch (error) {
    // 发送错误回主线程
    self.postMessage({
      taskId,
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

// 导出任务类型常量
self.postMessage({
  type: 'INIT',
  taskTypes: TASK_TYPES
});