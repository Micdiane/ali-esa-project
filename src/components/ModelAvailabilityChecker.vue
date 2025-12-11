<template>
  <div class="model-availability-checker">
    <h2>模型可用程度检测</h2>
    
    <!-- 检测配置 -->
    <div class="check-config">
      <div class="config-section">
        <label for="keySelect">选择密钥:</label>
        <select 
          id="keySelect" 
          v-model="selectedKeyId" 
          class="select-control"
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
      </div>
      
      <div class="config-section">
        <label for="modelSelect">选择模型:</label>
        <select 
          id="modelSelect" 
          v-model="selectedModelId" 
          class="select-control"
          :disabled="!selectedKeyId"
        >
          <option value="">请选择模型</option>
          <option 
            v-for="model in availableModels" 
            :key="model.id" 
            :value="model.id"
          >
            {{ model.name }}
          </option>
        </select>
      </div>
      
      <button 
        @click="checkAvailability" 
        class="check-btn"
        :disabled="!selectedKeyId || !selectedModelId || isChecking"
      >
        <svg v-if="isChecking" class="loading-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
        {{ isChecking ? '检测中...' : '开始检测' }}
      </button>
    </div>
    
    <!-- 检测结果 -->
    <div v-if="checkResult" class="check-result">
      <div class="result-header">
        <h3>检测结果</h3>
        <div class="result-meta">
          检测时间: {{ formatDate(checkResult.lastChecked) }}
        </div>
      </div>
      
      <div class="result-body">
        <div class="result-card">
          <div class="result-title">响应延迟</div>
          <div class="result-value latency-value">
            {{ formatLatency(checkResult.latency) }}
            <span class="latency-grade">{{ getLatencyGrade(checkResult.latency) }}</span>
          </div>
        </div>
        
        <div class="result-card">
          <div class="result-title">QPS 占用率</div>
          <div class="result-value-with-progress">
            <div class="progress-bar-container">
              <div 
                class="progress-bar" 
                :style="{ width: `${checkResult.qpsUsage * 100}%` }"
                :class="getQpsUsageClass(checkResult.qpsUsage)"
              ></div>
            </div>
            <div class="percentage">{{ (checkResult.qpsUsage * 100).toFixed(1) }}%</div>
          </div>
        </div>
        
        <div class="result-card">
          <div class="result-title">状态</div>
          <div class="result-value status-value">
            <span 
              class="status-badge"
              :class="getStatusClass(checkResult.status)"
            >
              {{ getStatusText(checkResult.status) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 检测详情 -->
      <div class="result-details">
        <h4>检测详情</h4>
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">平台:</span>
            <span class="detail-value">{{ platformConfig[checkResult.platform]?.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">模型:</span>
            <span class="detail-value">{{ getSelectedModelName() }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">密钥:</span>
            <span class="detail-value">{{ getSelectedKeyName() }}</span>
          </div>
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
import { ref, computed, onMounted } from 'vue';
import { type ApiKey, type ModelAvailability } from '../types';
import { apiKeyStorage } from '../utils/encryption';
import { platformConfig, getModelsByPlatform } from '../config/platforms';
import { availabilityCache } from '../utils/cache';


// 响应式数据
const apiKeys = ref<ApiKey[]>([]);
const selectedKeyId = ref('');
const selectedModelId = ref('');
const isChecking = ref(false);
const error = ref('');
const checkResult = ref<ModelAvailability | null>(null);

// 加载密钥列表
const loadKeys = () => {
  apiKeys.value = apiKeyStorage.getAll();
};

// 获取选中的密钥
const selectedKey = computed(() => {
  return apiKeys.value.find(key => key.id === selectedKeyId.value) || null;
});

// 获取可用模型列表
const availableModels = computed(() => {
  if (!selectedKey.value) {
    return [];
  }
  return getModelsByPlatform(selectedKey.value.platform);
});

// 获取选中的模型名称
const getSelectedModelName = () => {
  if (!selectedKey.value || !selectedModelId.value) return '';
  const model = availableModels.value.find(m => m.id === selectedModelId.value);
  return model?.name || '';
};

// 获取选中的密钥名称
const getSelectedKeyName = () => {
  if (!selectedKeyId.value) return '';
  const key = apiKeys.value.find(k => k.id === selectedKeyId.value);
  return key?.name || '';
};

// 检测模型可用性
const checkAvailability = async () => {
  if (!selectedKey.value || !selectedModelId.value) return;
  
  isChecking.value = true;
  error.value = '';
  checkResult.value = null;
  
  try {
    // 生成缓存键
    const cacheKey = `availability_${selectedKey.value.platform}_${selectedKey.value.id}_${selectedModelId.value}`;
    
    // 检查缓存（缓存10分钟）
    const cachedResult = availabilityCache.get<ModelAvailability>(cacheKey);
    if (cachedResult) {
      checkResult.value = cachedResult;
      isChecking.value = false;
      return;
    }
    
    // 执行检测
    const result = await performAvailabilityCheck(selectedKey.value, selectedModelId.value);
    
    // 保存到缓存
    availabilityCache.set(cacheKey, result);
    
    // 更新结果
    checkResult.value = result;
    isChecking.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '检测失败，请检查网络连接或配置';
    isChecking.value = false;
  }
};

// 执行可用性检测
const performAvailabilityCheck = async (key: ApiKey, modelId: string): Promise<ModelAvailability> => {
  let latency = 0;
  let qpsUsage = 0;
  let status: 'normal' | 'limited' | 'unavailable' = 'normal';
  
  try {
    // 模拟检测请求，3秒超时
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), 3000);
    });
    
    // 实际检测逻辑（这里使用模拟数据，实际项目中需要替换为真实API调用）
    const checkPromise = new Promise<void>((resolve) => {
      // 模拟API调用延迟（随机生成100-1200ms）
      const simulatedLatency = Math.floor(Math.random() * 1100) + 100;
      setTimeout(() => {
        latency = simulatedLatency;
        
        // 随机生成QPS占用率（0-1之间）
        qpsUsage = Math.random() * 0.8; // 最高80%占用率
        
        // 根据延迟和QPS占用率确定状态
        if (latency > 1000 || qpsUsage > 0.8) {
          status = 'limited';
        } else {
          status = 'normal';
        }
        
        resolve();
      }, simulatedLatency);
    });
    
    // 等待检测完成或超时
    await Promise.race([checkPromise, timeoutPromise]);
    
  } catch (err) {
    // 超时或其他错误，标记为不可用
    latency = 3000; // 超过3秒
    status = 'unavailable';
  }
  
  return {
    platform: key.platform,
    modelId,
    latency,
    qpsUsage,
    status,
    lastChecked: new Date()
  };
};

// 格式化延迟
const formatLatency = (latency: number) => {
  return `${latency}ms`;
};

// 获取延迟等级
const getLatencyGrade = (latency: number) => {
  if (latency < 500) return '优秀';
  if (latency < 1000) return '良好';
  return '一般';
};

// 获取QPS占用率样式类
const getQpsUsageClass = (usage: number) => {
  if (usage < 0.5) return 'low';
  if (usage < 0.8) return 'medium';
  return 'high';
};

// 获取状态文本
const getStatusText = (status: 'normal' | 'limited' | 'unavailable') => {
  switch (status) {
    case 'normal': return '正常';
    case 'limited': return '限流';
    case 'unavailable': return '不可用';
  }
};

// 获取状态样式类
const getStatusClass = (status: 'normal' | 'limited' | 'unavailable') => {
  return status;
};

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN');
};

// 组件挂载时加载密钥
onMounted(() => {
  loadKeys();
});
</script>

<style scoped>
.model-availability-checker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.check-config {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: end;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
  flex: 1;
}

.config-section label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.select-control {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
  min-width: 200px;
}

.select-control:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.select-control:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.check-btn {
  padding: 10px 24px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  min-width: 120px;
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

.check-result {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap;
  gap: 12px;
}

.result-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.result-meta {
  font-size: 12px;
  color: #666;
}

.result-body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.result-card {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.result-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.result-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.latency-value {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.latency-grade {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.result-value-with-progress {
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
  font-size: 20px;
  font-weight: bold;
  color: #333;
  min-width: 50px;
  text-align: right;
}

.status-value {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
}

.status-badge.normal {
  background-color: #34a853;
}

.status-badge.limited {
  background-color: #fbbc05;
}

.status-badge.unavailable {
  background-color: #ea4335;
}

.result-details {
  padding: 20px;
  border-top: 1px solid #eee;
}

.result-details h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .model-availability-checker {
    padding: 10px;
  }
  
  .check-config {
    flex-direction: column;
    align-items: stretch;
  }
  
  .config-section {
    width: 100%;
  }
  
  .result-body {
    grid-template-columns: 1fr;
  }
  
  .result-value-with-progress {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .percentage {
    text-align: left;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
