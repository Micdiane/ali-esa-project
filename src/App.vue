<script setup lang="ts">
import { ref } from 'vue';
import ApiKeyManager from './components/ApiKeyManager.vue';
import ModelTester from './components/ModelTester.vue';

const currentTab = ref<'manager' | 'tester'>('manager');
</script>

<template>
  <div class="app-container">
    <!-- 应用头部 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">硅基流动 API 管理工具</h1>
        <p class="app-subtitle">批量管理 API 密钥，查询余额与模型信息，测试对话功能</p>
      </div>
    </header>

    <!-- 导航标签 -->
    <nav class="app-nav">
      <div class="nav-container">
        <button
          class="nav-tab"
          :class="{ active: currentTab === 'manager' }"
          @click="currentTab = 'manager'"
        >
          密钥管理
        </button>
        <button
          class="nav-tab"
          :class="{ active: currentTab === 'tester' }"
          @click="currentTab = 'tester'"
        >
          模型测试
        </button>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <main class="app-main">
      <div class="main-container">
        <ApiKeyManager v-if="currentTab === 'manager'" />
        <ModelTester v-if="currentTab === 'tester'" />
      </div>
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <p>硅基流动 API 管理工具 © {{ new Date().getFullYear() }}</p>
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
  background: linear-gradient(135deg, #9333EA 0%, #7c2cc9 100%);
  color: white;
  padding: 2.5rem 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
}

/* 导航标签 */
.app-nav {
  background-color: white;
  border-bottom: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  gap: 0;
}

.nav-tab {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-tab:hover {
  color: #9333EA;
  background-color: #f9fafb;
}

.nav-tab.active {
  color: #9333EA;
  border-bottom-color: #9333EA;
  background-color: #f9fafb;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.app-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  padding: 2rem 1rem;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f9fafb;
  border-radius: 12px;
  overflow: hidden;
}

/* 应用底部 */
.app-footer {
  background-color: white;
  padding: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-title {
    font-size: 1.8rem;
  }

  .app-subtitle {
    font-size: 0.95rem;
  }

  .app-main {
    padding: 1rem 0.5rem;
  }

  .app-header {
    padding: 2rem 1rem;
  }
}
</style>
