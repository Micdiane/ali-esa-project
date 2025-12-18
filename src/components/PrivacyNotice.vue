<template>
  <div class="privacy-notice">
    <div class="notice-header">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
      <h3>隐私与安全</h3>
    </div>
    <div class="notice-content">
      <div class="security-item">
        <span class="icon">🔒</span>
        <div class="text">
          <strong>本地存储</strong>
          <p>所有 API 密钥仅存储在您的浏览器本地，不会上传到任何服务器</p>
        </div>
      </div>
      <div class="security-item">
        <span class="icon">🔐</span>
        <div class="text">
          <strong>AES-256 加密</strong>
          <p>密钥在本地使用 AES-256 加密算法加密存储</p>
        </div>
      </div>
      <div class="security-item">
        <span class="icon">🌐</span>
        <div class="text">
          <strong>直连 API</strong>
          <p>直接向各平台 API 发送请求，不经过任何中间服务器</p>
        </div>
      </div>
      <div class="security-item">
        <span class="icon">🗑️</span>
        <div class="text">
          <strong>完全控制</strong>
          <p>您可以随时清除浏览器数据来删除所有密钥</p>
        </div>
      </div>
    </div>
    <div class="notice-actions">
      <button @click="exportData" class="action-btn export-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        导出数据
      </button>
      <button @click="clearAllData" class="action-btn clear-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        清除所有数据
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiKeyStorage } from '../utils/encryption';
import { toast } from '../utils/toast';

const exportData = () => {
  try {
    const keys = apiKeyStorage.getAll();
    const dataStr = JSON.stringify(keys, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-keys-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('数据已导出', '备份文件已下载');
  } catch (error) {
    toast.error('导出失败，请重试');
  }
};

const clearAllData = () => {
  if (confirm('⚠️ 警告：此操作将删除所有密钥和配置数据，且无法恢复！\n\n确定要继续吗？')) {
    if (confirm('⚠️ 最后确认：您确定要清除所有数据吗？')) {
      localStorage.clear();
      toast.success('所有数据已清除', '页面将在3秒后刷新');
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }
};
</script>

<style scoped>
.privacy-notice {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #bae6fd;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.notice-header svg {
  color: #0284c7;
}

.notice-header h3 {
  margin: 0;
  font-size: 20px;
  color: #0c4a6e;
  font-weight: 600;
}

.notice-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.security-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.security-item .icon {
  font-size: 24px;
  flex-shrink: 0;
}

.security-item .text {
  flex: 1;
}

.security-item strong {
  display: block;
  font-size: 14px;
  color: #0c4a6e;
  margin-bottom: 4px;
}

.security-item p {
  margin: 0;
  font-size: 13px;
  color: #0369a1;
  line-height: 1.5;
}

.notice-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid #bae6fd;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.export-btn {
  background-color: #0284c7;
  color: white;
}

.export-btn:hover {
  background-color: #0369a1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.clear-btn {
  background-color: white;
  color: #dc2626;
  border: 2px solid #fecaca;
}

.clear-btn:hover {
  background-color: #fef2f2;
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

/* 响应式 */
@media (max-width: 768px) {
  .privacy-notice {
    padding: 16px;
  }

  .notice-content {
    grid-template-columns: 1fr;
  }

  .notice-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
