<template>
  <div class="api-key-manager">
    <h2>API 密钥管理</h2>
    
    <!-- 添加密钥按钮 -->
    <div class="add-key-section">
      <button @click="showAddForm = true" class="add-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加密钥
      </button>
    </div>
    
    <!-- 密钥列表 -->
    <div class="keys-grid">
      <div 
        v-for="key in apiKeys" 
        :key="key.id" 
        class="key-card"
        :style="{ borderLeftColor: platformConfig[key.platform]?.color || '#ccc' }"
      >
        <div class="key-header">
          <div class="key-info">
            <h3>{{ platformConfig[key.platform]?.name }}</h3>
            <p class="key-name">{{ key.name }}</p>
          </div>
          <div class="key-actions">
            <button @click="editKey(key)" class="action-btn edit-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button @click="deleteKey(key.id)" class="action-btn delete-btn">
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
          <div class="key-value">
            <span class="label">密钥:</span>
            <span class="value">{{ maskKey(key.key) }}</span>
          </div>
          <div v-if="key.secret" class="key-value">
            <span class="label">密钥Secret:</span>
            <span class="value">{{ maskKey(key.secret) }}</span>
          </div>
          <div class="key-tags">
            <span class="label">标签:</span>
            <div class="tags-container">
              <span 
                v-for="tag in key.tags" 
                :key="tag" 
                class="tag"
              >
                {{ tag }}
              </span>
              <span v-if="key.tags.length === 0" class="no-tags">无标签</span>
            </div>
          </div>
        </div>
        
        <div class="key-meta">
          <span class="meta-item">创建于: {{ formatDate(key.createdAt) }}</span>
          <span class="meta-item">更新于: {{ formatDate(key.updatedAt) }}</span>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="apiKeys.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>暂无API密钥</p>
        <button @click="showAddForm = true" class="add-btn">添加第一个密钥</button>
      </div>
    </div>
    
    <!-- 密钥表单模态框 -->
    <div v-if="showAddForm || editingKey" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingKey ? '编辑密钥' : '添加API密钥' }}</h3>
          <button @click="closeForm" class="close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveKey">
            <div class="form-group">
              <label for="platform">平台</label>
              <select 
                id="platform" 
                v-model="form.platform" 
                required
                class="form-control"
              >
                <option value="">选择平台</option>
                <option 
                  v-for="(config, platform) in PROVIDERS" 
                  :key="platform" 
                  :value="platform"
                >
                  {{ config.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="name">名称</label>
              <input 
                type="text" 
                id="name" 
                v-model="form.name" 
                required
                placeholder="给密钥起个名字"
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label for="key">API Key</label>
              <input 
                type="text" 
                id="key" 
                v-model="form.key" 
                required
                placeholder="输入API密钥"
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label for="secret">API Secret (可选)</label>
              <input 
                type="text" 
                id="secret" 
                v-model="form.secret"
                placeholder="输入API密钥Secret（如适用）"
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label for="tags">标签 (用逗号分隔)</label>
              <input 
                type="text" 
                id="tags" 
                v-model="form.tagsInput"
                placeholder="如：工作用,测试用"
                class="form-control"
              >
            </div>
            
            <div class="form-actions">
              <button type="button" @click="closeForm" class="cancel-btn">取消</button>
              <button type="submit" class="save-btn">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { type ApiKey } from '../types';
import { apiKeyStorage } from '../utils/encryption';
import { platformConfig } from '../config/platforms';
import { PROVIDERS } from '../config/providers';

// 响应式数据
const apiKeys = ref<ApiKey[]>([]);
const showAddForm = ref(false);
const editingKey = ref<ApiKey | null>(null);

// 表单数据
const form = ref({
  platform: '' as string,
  name: '',
  key: '',
  secret: '',
  tagsInput: ''
});

// 加载密钥列表
const loadKeys = () => {
  apiKeys.value = apiKeyStorage.getAll();
};

// 打开编辑表单
const editKey = (key: ApiKey) => {
  editingKey.value = key;
  form.value = {
    platform: key.platform,
    name: key.name,
    key: key.key,
    secret: key.secret || '',
    tagsInput: key.tags.join(', ')
  };
  showAddForm.value = true;
};

// 关闭表单
const closeForm = () => {
  showAddForm.value = false;
  editingKey.value = null;
  resetForm();
};

// 重置表单
const resetForm = () => {
  form.value = {
    platform: '',
    name: '',
    key: '',
    secret: '',
    tagsInput: ''
  };
};

// 保存密钥
const saveKey = () => {
  // 处理标签输入
  const tags = form.value.tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  
  const keyData: ApiKey = {
    id: editingKey.value?.id || crypto.randomUUID(),
    platform: form.value.platform as any, // 类型断言，确保类型检查通过
    name: form.value.name,
    key: form.value.key,
    secret: form.value.secret || undefined,
    tags,
    createdAt: editingKey.value?.createdAt || new Date(),
    updatedAt: new Date()
  };
  
  // 保存到存储
  apiKeyStorage.save(keyData);
  
  // 更新列表
  loadKeys();
  
  // 关闭表单
  closeForm();
};

// 删除密钥
const deleteKey = (id: string) => {
  if (confirm('确定要删除这个密钥吗？')) {
    apiKeyStorage.delete(id);
    loadKeys();
  }
};

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN');
};

// 掩码显示密钥
const maskKey = (key: string) => {
  if (key.length <= 8) {
    return key;
  }
  return key.substring(0, 4) + '***' + key.substring(key.length - 4);
};

// 组件挂载时加载密钥
onMounted(() => {
  loadKeys();
});
</script>

<style scoped>
.api-key-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.add-key-section {
  margin-bottom: 20px;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #3367d6;
}

.keys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.key-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-left: 4px solid #ccc;
  transition: transform 0.2s, box-shadow 0.2s;
}

.key-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.key-info h3 {
  font-size: 18px;
  margin: 0 0 5px 0;
  color: #333;
}

.key-name {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.key-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #f0f0f0;
}

.edit-btn svg {
  color: #4285f4;
}

.delete-btn svg {
  color: #ea4335;
}

.key-details {
  margin-bottom: 15px;
}

.key-value {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.value {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  background-color: #f5f5f5;
  padding: 6px 10px;
  border-radius: 4px;
  word-break: break-all;
}

.key-tags {
  margin-top: 10px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.tag {
  background-color: #e8f0fe;
  color: #4285f4;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.no-tags {
  color: #999;
  font-size: 12px;
  font-style: italic;
}

.key-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.meta-item {
  font-size: 12px;
  color: #999;
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
  margin-bottom: 20px;
  font-size: 16px;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.save-btn {
  padding: 10px 20px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #3367d6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .keys-grid {
    grid-template-columns: 1fr;
  }
  
  .api-key-manager {
    padding: 10px;
  }
}
</style>
