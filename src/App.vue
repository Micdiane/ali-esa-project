<script setup lang="ts">
import { ref } from 'vue';
import ApiKeyManager from './components/ApiKeyManager.vue';
import QuotaChecker from './components/QuotaChecker.vue';
import ModelQuery from './components/ModelQuery.vue';
import ModelAvailabilityChecker from './components/ModelAvailabilityChecker.vue';

// 选项卡状态
const activeTab = ref('keys');

// 选项卡配置
const tabs = [
  { id: 'keys', name: '密钥管理', icon: '🔑' },
  { id: 'quota', name: '余额查询', icon: '💰' },
  { id: 'models', name: '模型查询', icon: '🤖' },
  { id: 'availability', name: '可用性检测', icon: '📊' }
];
</script>

<template>
  <div class="app-container">
    <!-- 应用头部 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">API Key 管理平台</h1>
        <p class="app-subtitle">集中管理多平台 API 密钥，查询余额与模型信息</p>
      </div>
    </header>
    
    <!-- 导航选项卡 -->
    <nav class="app-nav">
      <div class="nav-container">
        <button 
          v-for="tab in tabs" 
          :key="tab.id" 
          @click="activeTab = tab.id" 
          class="nav-tab"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-name">{{ tab.name }}</span>
        </button>
      </div>
    </nav>
    
    <!-- 主内容区域 -->
    <main class="app-main">
      <div class="main-container">
        <!-- 密钥管理 -->
        <ApiKeyManager v-if="activeTab === 'keys'" />
        
        <!-- 余额/配额查询 -->
        <QuotaChecker v-else-if="activeTab === 'quota'" />
        
        <!-- 模型查询 -->
        <ModelQuery v-else-if="activeTab === 'models'" />
        
        <!-- 模型可用性检测 -->
        <ModelAvailabilityChecker v-else-if="activeTab === 'availability'" />
      </div>
    </main>
    
    <!-- 应用底部 -->
    <footer class="app-footer">
      <p>API Key 管理平台 © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #f5f7fa;
}

/* 应用容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 应用头部 */
.app-header {
  background: linear-gradient(135deg, #4285f4 0%, #3367d6 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.app-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

/* 导航栏 */
.app-nav {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  overflow-x: auto;
  padding: 0 1rem;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
}

.nav-tab:hover {
  color: #4285f4;
  background-color: rgba(66, 133, 244, 0.05);
}

.nav-tab.active {
  color: #4285f4;
  border-bottom-color: #4285f4;
  background-color: rgba(66, 133, 244, 0.05);
  font-weight: 500;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-name {
  font-size: 0.95rem;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  padding: 1rem;
}

.main-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 应用底部 */
.app-footer {
  background-color: white;
  padding: 1rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 1.5rem;
  }
  
  .app-subtitle {
    font-size: 0.9rem;
  }
  
  .nav-tab {
    padding: 0.8rem 1rem;
  }
  
  .tab-name {
    font-size: 0.85rem;
  }
  
  .app-main {
    padding: 0.5rem;
  }
}
</style>
