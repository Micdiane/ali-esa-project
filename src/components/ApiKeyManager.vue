<template>
  <div class="api-key-manager">
    <h2>API 密钥管理</h2>

    <!-- 隐私声明 -->
    <PrivacyNotice />

    <!-- 批量添加密钥区域 -->
    <div class="batch-add-section">
      <h3>批量添加密钥</h3>
      <div class="batch-input-container">
        <!-- 平台选择 -->
        <div class="platform-selector">
          <label for="platform">选择平台:</label>
          <select id="platform" v-model="selectedPlatform" class="platform-select">
            <option value="siliconflow">💧 硅基流动</option>
            <option value="dashscope">☁️ 阿里云 DashScope</option>
            <option value="deepseek">🧠 DeepSeek</option>
            <option value="kimi">🌙 Kimi (月之暗面)</option>
          </select>
        </div>

        <textarea
          v-model="batchKeysInput"
          placeholder="请输入API密钥，每行一个&#10;例如：&#10;sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&#10;sk-yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
          class="batch-textarea"
          rows="6"
        ></textarea>
        <div class="batch-actions">
          <button @click="addBatchKeys" class="batch-add-btn" :disabled="!batchKeysInput.trim()">
            批量添加到 {{ PROVIDERS[selectedPlatform]?.name }}
          </button>
          <button @click="queryAllKeys" class="query-btn" :disabled="apiKeys.length === 0 || isQuerying">
            <svg v-if="isQuerying" class="loading-spinner" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {{ isQuerying ? '查询中...' : '查询所有密钥信息' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 模型列表区域 -->
    <div class="models-section" v-if="models.length > 0">
      <h3>支持的模型列表 ({{ models.length }})</h3>
      <div class="models-container">
        <div class="model-item" v-for="model in models" :key="model">
          {{ model }}
        </div>
      </div>
    </div>

    <!-- 密钥列表 -->
    <div class="keys-section" v-if="apiKeys.length > 0">
      <h3>密钥列表 ({{ apiKeys.length }})</h3>

      <!-- 平台过滤 -->
      <div class="filter-section">
        <label>筛选平台:</label>
        <select v-model="filterPlatform" class="filter-select">
          <option value="">全部平台</option>
          <option value="siliconflow">💧 硅基流动</option>
          <option value="dashscope">☁️ 阿里云 DashScope</option>
          <option value="deepseek">🧠 DeepSeek</option>
          <option value="kimi">🌙 Kimi</option>
        </select>
      </div>

      <div class="keys-grid">
        <div
          v-for="key in filteredKeys"
          :key="key.id"
          class="key-card"
          :style="{ borderLeftColor: getPlatformColor(key.platform) }"
        >
          <div class="key-header">
            <div class="key-info">
              <h4>{{ getPlatformName(key.platform) }}</h4>
            </div>
            <div class="key-actions">
              <button @click="deleteKey(key.id)" class="action-btn delete-btn" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="key-details">
            <div class="key-row">
              <span class="label">密钥:</span>
              <span class="value key-value-wrapper" @click="copyToClipboard(key.key)" title="点击复制">
                <span class="key-text">{{ key.key }}</span>
                <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </span>
            </div>
            <div class="key-row">
              <span class="label">状态:</span>
              <span class="status" :class="getKeyStatusClass(key)">{{ getKeyStatusText(key) }}</span>
            </div>
            <div class="key-row" v-if="key.balanceInfo">
              <span class="label">余额:</span>
              <span class="value">{{ formatBalance(key) }}</span>
            </div>
            <div class="key-row" v-if="key.userId">
              <span class="label">用户ID:</span>
              <span class="value">{{ key.userId }}</span>
            </div>
            <div class="key-row">
              <span class="label">ID:</span>
              <span class="value">{{ key.id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="apiKeys.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
      </svg>
      <p>暂无API密钥</p>
      <p class="hint">请选择平台并在上方输入框中粘贴您的API密钥（每行一个），然后点击"批量添加"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type ApiKey, type Platform } from '../types';
import { apiKeyStorage } from '../utils/encryption';
import { fetchModelsByPlatform, checkBalanceByPlatform } from '../utils/platformApis';
import { PROVIDERS } from '../config/providers';
import { toast } from '../utils/toast';
import PrivacyNotice from './PrivacyNotice.vue';

// 响应式数据
const apiKeys = ref<ApiKey[]>([]);
const batchKeysInput = ref('');
const isQuerying = ref(false);
const models = ref<string[]>([]);
const selectedPlatform = ref<Platform>('siliconflow');
const filterPlatform = ref<string>('');

// 过滤后的密钥列表
const filteredKeys = computed(() => {
  if (!filterPlatform.value) {
    return apiKeys.value;
  }
  return apiKeys.value.filter(key => key.platform === filterPlatform.value);
});

// 加载密钥列表
const loadKeys = () => {
  apiKeys.value = apiKeyStorage.getAll();
};

// 批量添加密钥
const addBatchKeys = () => {
  const keys = batchKeysInput.value
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  if (keys.length === 0) {
    toast.warning('请输入至少一个密钥');
    return;
  }

  let addedCount = 0;
  let duplicateCount = 0;
  keys.forEach(key => {
    // 检查是否已经存在
    const exists = apiKeys.value.some(k => k.key === key);
    if (!exists) {
      const keyData: ApiKey = {
        id: crypto.randomUUID(),
        platform: selectedPlatform.value,
        name: `Key-${Date.now()}-${addedCount}`,
        key: key,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'unknown'
      };
      apiKeyStorage.save(keyData);
      addedCount++;
    } else {
      duplicateCount++;
    }
  });

  // 清空输入框
  batchKeysInput.value = '';

  // 重新加载列表
  loadKeys();

  const platformName = PROVIDERS[selectedPlatform.value]?.name;
  if (addedCount > 0) {
    const message = duplicateCount > 0
      ? `成功添加 ${addedCount} 个密钥，${duplicateCount} 个重复已跳过`
      : `成功添加 ${addedCount} 个密钥`;
    toast.success(message, `已添加到 ${platformName}`);
  } else {
    toast.info('所有密钥均已存在', '未添加新密钥');
  }
};

// 查询所有密钥信息
const queryAllKeys = async () => {
  if (apiKeys.value.length === 0) {
    return;
  }

  isQuerying.value = true;

  try {
    // 按平台分组查询模型列表
    const platformsToQuery = [...new Set(apiKeys.value.map(k => k.platform))];

    for (const platform of platformsToQuery) {
      const platformKeys = apiKeys.value.filter(k => k.platform === platform);
      if (platformKeys.length > 0 && platformKeys[0]) {
        try {
          const modelList = await fetchModelsByPlatform(platform, platformKeys[0].key);
          // 只显示第一个平台的模型列表
          if (models.value.length === 0) {
            models.value = modelList.map((m: any) => m.id || m);
          }
        } catch (error) {
          console.error(`获取 ${platform} 模型列表失败:`, error);
        }
      }
    }

    // 并行查询所有密钥
    const queryPromises = apiKeys.value.map(async (key) => {
      try {
        const balanceInfo = await checkBalanceByPlatform(key.platform, key.key);

        // 处理不同平台的响应格式
        let status: 'valid' | 'invalid' | 'unknown' = 'valid';
        let userId: string | undefined;

        // 根据平台解析余额信息
        if (key.platform === 'dashscope') {
          // Dashscope 不支持余额查询
          status = 'unknown';
        } else if (key.platform === 'deepseek') {
          status = balanceInfo.is_available ? 'valid' : 'invalid';
        } else if (key.platform === 'siliconflow') {
          userId = balanceInfo.user_id;
        } else if (key.platform === 'kimi') {
          status = balanceInfo.data ? 'valid' : 'invalid';
        }

        // 更新密钥信息
        const updatedKey: ApiKey = {
          ...key,
          status,
          balanceInfo: balanceInfo,
          userId: userId || key.userId,
          updatedAt: new Date()
        };

        // 保存到存储
        apiKeyStorage.save(updatedKey);

        return updatedKey;
      } catch (error) {
        console.error(`查询密钥 ${key.id} 失败:`, error);

        // 标记为无效
        const updatedKey: ApiKey = {
          ...key,
          status: 'invalid',
          updatedAt: new Date()
        };

        apiKeyStorage.save(updatedKey);

        return updatedKey;
      }
    });

    await Promise.all(queryPromises);

    // 重新加载列表
    loadKeys();

    const validCount = apiKeys.value.filter(k => k.status === 'valid').length;
    const invalidCount = apiKeys.value.filter(k => k.status === 'invalid').length;
    toast.success(`查询完成！有效: ${validCount}，无效: ${invalidCount}`, '密钥信息已更新');
  } catch (error) {
    console.error('查询失败:', error);
    toast.error('查询失败，请检查网络连接');
  } finally {
    isQuerying.value = false;
  }
};

// 删除密钥
const deleteKey = (id: string) => {
  if (confirm('确定要删除这个密钥吗？此操作无法撤销。')) {
    apiKeyStorage.delete(id);
    loadKeys();
    toast.success('密钥已删除');
  }
};

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('密钥已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    // 备用方案
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('密钥已复制到剪贴板');
    } catch (e) {
      toast.error('复制失败，请手动复制');
    }
  }
};

// 获取平台名称
const getPlatformName = (platform: Platform) => {
  return PROVIDERS[platform]?.name || platform;
};

// 获取平台颜色
const getPlatformColor = (platform: Platform) => {
  return PROVIDERS[platform]?.color || '#9333EA';
};

// 获取密钥状态样式类
const getKeyStatusClass = (key: ApiKey) => {
  if (key.status === 'valid') return 'status-valid';
  if (key.status === 'invalid') return 'status-invalid';
  return 'status-unknown';
};

// 获取密钥状态文本
const getKeyStatusText = (key: ApiKey) => {
  if (key.status === 'valid') return '有效';
  if (key.status === 'invalid') return '无效';
  return '未知';
};

// 格式化余额
const formatBalance = (key: ApiKey) => {
  if (!key.balanceInfo) return '未查询';

  const info = key.balanceInfo;

  // 根据平台格式化余额
  switch (key.platform) {
    case 'siliconflow':
      return `¥${(info.total_balance || 0).toFixed(2)}`;

    case 'dashscope':
      return info.message || '请访问控制台查看';

    case 'deepseek':
      if (info.balance_infos && info.balance_infos.length > 0) {
        const cnyInfo = info.balance_infos.find((b: any) => b.currency === 'CNY');
        if (cnyInfo) {
          return `¥${cnyInfo.total_balance}`;
        }
      }
      return '¥0.00';

    case 'kimi':
      if (info.data) {
        return `¥${(info.data.available_balance || 0).toFixed(2)}`;
      }
      return '¥0.00';

    default:
      return '未知';
  }
};

// 组件挂载时加载密钥
onMounted(() => {
  loadKeys();
});
</script>

<style scoped>
.api-key-manager {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
}

h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #555;
  font-weight: 500;
}

/* 批量添加区域 */
.batch-add-section {
  margin-bottom: 30px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.batch-input-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.platform-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-selector label {
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.platform-select {
  flex: 1;
  max-width: 300px;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.platform-select:focus {
  outline: none;
  border-color: #9333EA;
}

.batch-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Courier New', Courier, monospace;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.batch-textarea:focus {
  outline: none;
  border-color: #9333EA;
}

.batch-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.batch-add-btn, .query-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.batch-add-btn {
  background-color: #9333EA;
  color: white;
}

.batch-add-btn:hover:not(:disabled) {
  background-color: #7c2cc9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.batch-add-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.query-btn {
  background-color: #10b981;
  color: white;
}

.query-btn:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.query-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 模型列表区域 */
.models-section {
  margin-bottom: 30px;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.models-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
}

.model-item {
  padding: 10px 15px;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Courier New', Courier, monospace;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.model-item:hover {
  border-color: #9333EA;
  box-shadow: 0 2px 6px rgba(147, 51, 234, 0.15);
}

/* 密钥列表区域 */
.keys-section {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 8px;
}

.filter-section label {
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
}

.filter-select:focus {
  outline: none;
  border-color: #9333EA;
}

.keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.key-card {
  background: #f9fafb;
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid #9333EA;
  transition: all 0.3s;
}

.key-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.key-info h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.key-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background-color: #fee;
}

.delete-btn svg {
  color: #ef4444;
}

.key-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.key-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  min-width: 70px;
}

.value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
  word-break: break-all;
  flex: 1;
  text-align: right;
}

.key-value-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  transition: all 0.2s;
  border: 1px solid #e5e7eb;
}

.key-value-wrapper:hover {
  border-color: #9333EA;
  background: #faf5ff;
}

.key-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-icon {
  flex-shrink: 0;
  color: #9333EA;
}

.status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-valid {
  background-color: #d1fae5;
  color: #065f46;
}

.status-invalid {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-unknown {
  background-color: #e5e7eb;
  color: #4b5563;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background-color: #fafafa;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

.empty-icon {
  color: #999;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  margin: 10px 0;
  font-size: 16px;
}

.empty-state .hint {
  color: #999;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .keys-grid {
    grid-template-columns: 1fr;
  }

  .models-container {
    grid-template-columns: 1fr;
  }

  .api-key-manager {
    padding: 10px;
  }

  .batch-actions {
    flex-direction: column;
  }

  .batch-add-btn, .query-btn {
    width: 100%;
  }

  .platform-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .platform-select {
    max-width: none;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select {
    min-width: auto;
  }
}
</style>
