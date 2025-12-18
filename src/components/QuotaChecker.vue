<template>
  <div class="quota-checker">
    <h2>余额 / 配额查询</h2>
    
    <!-- 选择密钥 -->
    <div class="select-section">
      <label for="apiKeySelect">选择要查询的密钥:</label>
      <select 
        id="apiKeySelect" 
        v-model="selectedKeyId" 
        class="key-select"
      >
        <option value="">请选择密钥</option>
        <option 
          v-for="key in apiKeys" 
          :key="key.id" 
          :value="key.id"
        >
          {{ platformConfig[key.platform]?.name }} - {{ key.name }}
        </option>
      </select>
      <button 
        @click="checkQuota" 
        class="check-btn"
        :disabled="!selectedKeyId || isChecking"
      >
        <svg v-if="isChecking" class="loading-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        {{ isChecking ? '查询中...' : '查询配额' }}
      </button>
    </div>
    
    <!-- 配额信息卡片 -->
    <div v-if="quotaInfo" class="quota-card">
      <div class="card-header">
        <h3>{{ platformConfig[quotaInfo.platform]?.name }} - 配额信息</h3>
        <div class="last-checked">
          <span>上次查询:</span>
          <span>{{ formatDate(quotaInfo.lastChecked) }}</span>
          <span v-if="isCached" class="cached-badge">(缓存)</span>
        </div>
      </div>
      
      <div class="card-body">
        <div class="quota-item">
          <div class="quota-label">剩余 Token 数</div>
          <div class="quota-value">{{ formatNumber(quotaInfo.remainingTokens) }}</div>
        </div>
        
        <div class="quota-item">
          <div class="quota-label">已用比例</div>
          <div class="quota-value-with-progress">
            <div class="progress-bar-container">
              <div 
                class="progress-bar" 
                :style="{ width: `${quotaInfo.usedRatio * 100}%` }"
                :class="getProgressBarClass(quotaInfo.usedRatio)"
              ></div>
            </div>
            <div class="percentage">{{ (quotaInfo.usedRatio * 100).toFixed(1) }}%</div>
          </div>
        </div>
        
        <div class="quota-item">
          <div class="quota-label">额度重置时间</div>
          <div class="quota-value">{{ quotaInfo.resetTime }}</div>
        </div>
      </div>
    </div>
    
    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      {{ error }}
    </div>
    
    <!-- 空状态 -->
    <div v-if="!selectedKeyId && apiKeys.length === 0" class="empty-state">
      <p>请先添加API密钥</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type ApiKey, type QuotaInfo } from '../types';
import { apiKeyStorage } from '../utils/encryption';
import { platformConfig } from '../config/platforms';
import { quotaCache } from '../utils/cache';
import { checkBalance } from '../utils/apiService';

// 响应式数据
const apiKeys = ref<ApiKey[]>([]);
const selectedKeyId = ref('');
const quotaInfo = ref<QuotaInfo | null>(null);
const isChecking = ref(false);
const error = ref('');
const isCached = ref(false);

// 加载密钥列表
const loadKeys = () => {
  apiKeys.value = apiKeyStorage.getAll();
};

// 检查配额
const checkQuota = async () => {
  if (!selectedKeyId.value) return;
  
  isChecking.value = true;
  error.value = '';
  quotaInfo.value = null;
  isCached.value = false;
  
  try {
    const selectedKey = apiKeys.value.find(key => key.id === selectedKeyId.value);
    if (!selectedKey) {
      throw new Error('未找到选中的密钥');
    }
    
    // 生成缓存键
    const cacheKey = `quota_${selectedKey.platform}_${selectedKey.id}`;
    
    // 检查缓存
    const cachedQuota = quotaCache.get<QuotaInfo>(cacheKey);
    if (cachedQuota) {
      quotaInfo.value = cachedQuota;
      isCached.value = true;
      isChecking.value = false;
      return;
    }
    
    // 调用真实API获取余额信息
    const balanceData = await checkBalance(
      selectedKey.platform,
      selectedKey.key,
      undefined, // baseUrl
      selectedKey.secret // 传递 secret 参数（如果存在）
    );
    
    // 处理不同平台的返回数据，统一格式
    const quotaData: QuotaInfo = {
      platform: selectedKey.platform,
      remainingTokens: balanceData.remaining_tokens || 0,
      usedRatio: balanceData.used_ratio || 0,
      resetTime: balanceData.reset_time || '每月 1 日',
      lastChecked: new Date()
    };
    
    // 保存到缓存
    quotaCache.set(cacheKey, quotaData);
    
    // 更新UI
    quotaInfo.value = quotaData;
    isChecking.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '查询失败，请检查网络连接或API密钥';
    isChecking.value = false;
  }
};

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN');
};

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN');
};

// 获取进度条样式类
const getProgressBarClass = (ratio: number) => {
  if (ratio < 0.5) return 'low';
  if (ratio < 0.8) return 'medium';
  return 'high';
};

// 组件挂载时加载密钥
onMounted(() => {
  loadKeys();
});
</script>

<style scoped>
.quota-checker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.select-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.select-section label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
}

.key-select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 250px;
  flex: 1;
  max-width: 400px;
}

.key-select:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.check-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.check-btn:hover:not(:disabled) {
  background-color: #3367d6;
}

.check-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.quota-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.last-checked {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.cached-badge {
  background-color: #e8f0fe;
  color: #4285f4;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.card-body {
  padding: 20px;
}

.quota-item {
  margin-bottom: 24px;
}

.quota-item:last-child {
  margin-bottom: 0;
}

.quota-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.quota-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.quota-value-with-progress {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar.low {
  background-color: #34a853;
}

.progress-bar.medium {
  background-color: #fbbc05;
}

.progress-bar.high {
  background-color: #ea4335;
}

.percentage {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  min-width: 60px;
  text-align: right;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #fee;
  color: #ea4335;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 20px;
  font-size: 14px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
  margin-top: 20px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* 辅助函数 */

/* 响应式设计 */
@media (max-width: 768px) {
  .quota-checker {
    padding: 10px;
  }
  
  .select-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .key-select {
    max-width: none;
    min-width: auto;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quota-value-with-progress {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .percentage {
    text-align: left;
  }
}
</style>
