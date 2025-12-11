<template>
  <div class="model-query">
    <h2>模型查询</h2>
    
    <!-- 平台过滤 -->
    <div class="filter-section">
      <select 
        v-model="selectedPlatform" 
        class="platform-filter"
      >
        <option value="">所有平台</option>
        <option 
          v-for="(config, platform) in platformConfig" 
          :key="platform" 
          :value="platform"
        >
          {{ config.name }}
        </option>
      </select>
      
      <!-- 免费模型过滤 -->
      <label class="free-filter-label">
        <input 
          type="checkbox" 
          v-model="freeOnly" 
          class="free-filter-checkbox"
        >
        仅显示免费模型
      </label>
    </div>
    
    <!-- 模型列表 -->
    <div class="models-grid">
      <div 
        v-for="model in filteredModels" 
        :key="model.id" 
        class="model-card"
        :style="{ borderLeftColor: platformConfig[model.platform]?.color || '#ccc' }"
      >
        <div class="model-header">
          <div class="model-info">
            <h3 class="model-name">{{ model.name }}</h3>
            <div class="model-platform">
              {{ platformConfig[model.platform]?.name }}
              <span v-if="model.isFree" class="free-badge">免费</span>
            </div>
          </div>
        </div>
        
        <div class="model-params">
          <div class="param-item">
            <span class="param-label">上下文窗口:</span>
            <span class="param-value">{{ formatContextWindow(model.contextWindow) }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">QPS 限制:</span>
            <span class="param-value">{{ model.qpsLimit }}</span>
          </div>
          <div class="param-item">
            <span class="param-label">支持功能:</span>
            <div class="features-list">
              <span 
                v-for="feature in model.features" 
                :key="feature" 
                class="feature-tag"
              >
                {{ feature }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="model-id">
          <span class="label">模型 ID:</span>
          <span class="value">{{ model.id }}</span>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredModels.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>未找到符合条件的模型</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { type ModelInfo } from '../types';
import { builtinModels, platformConfig } from '../config/platforms';

// 响应式数据
const selectedPlatform = ref('');
const freeOnly = ref(false);

// 过滤模型列表
const filteredModels = computed<ModelInfo[]>(() => {
  return builtinModels.filter(model => {
    // 平台过滤
    if (selectedPlatform.value && model.platform !== selectedPlatform.value) {
      return false;
    }
    
    // 免费模型过滤
    if (freeOnly.value && !model.isFree) {
      return false;
    }
    
    return true;
  });
});

// 格式化上下文窗口
const formatContextWindow = (windowSize: number) => {
  if (windowSize >= 1024 * 1024) {
    return `${(windowSize / (1024 * 1024)).toFixed(1)}M`;
  } else if (windowSize >= 1024) {
    return `${(windowSize / 1024).toFixed(0)}K`;
  }
  return windowSize.toString();
};
</script>

<style scoped>
.model-query {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.platform-filter {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
}

.platform-filter:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.free-filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  user-select: none;
}

.free-filter-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.model-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-left: 4px solid #ccc;
  transition: transform 0.2s, box-shadow 0.2s;
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.model-header {
  margin-bottom: 16px;
}

.model-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
}

.model-platform {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.free-badge {
  background-color: #e6f4ea;
  color: #34a853;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
}

.model-params {
  margin-bottom: 16px;
}

.param-item {
  margin-bottom: 12px;
}

.param-item:last-child {
  margin-bottom: 0;
}

.param-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.param-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.feature-tag {
  background-color: #e8f0fe;
  color: #4285f4;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.model-id {
  display: flex;
  flex-direction: column;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.model-id .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.model-id .value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  background-color: #f5f5f5;
  padding: 6px 10px;
  border-radius: 4px;
  word-break: break-all;
  color: #333;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 2px dashed #e0e0e0;
}

.empty-icon {
  color: #999;
  margin-bottom: 16px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .model-query {
    padding: 10px;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .platform-filter {
    min-width: auto;
  }
}
</style>
