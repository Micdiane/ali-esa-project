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
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <h1 class="app-title">多平台 AI API 管理工具</h1>
        <p class="app-subtitle">统一管理多个 AI 平台的 API 密钥、查询余额、测试模型对话</p>
        <div class="platform-badges">
          <span class="platform-badge siliconflow">💧 硅基流动</span>
          <span class="platform-badge dashscope">☁️ DashScope</span>
          <span class="platform-badge deepseek">🧠 DeepSeek</span>
          <span class="platform-badge kimi">🌙 Kimi</span>
        </div>
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
      <p>多平台 AI API 管理工具 © {{ new Date().getFullYear() }}</p>
      <p class="footer-subtitle">
        支持硅基流动、阿里云 DashScope、DeepSeek、Kimi 等平台
      </p>
      <p class="footer-security">
        🔒 所有数据仅存储在您的浏览器本地，使用 AES-256 加密，不会上传到任何服务器
      </p>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  color: white;
  padding: 3rem 1rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.app-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header-icon {
  display: inline-block;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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
  color: #667eea;
  background-color: #f9fafb;
}

.nav-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background-color: #f9fafb;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.app-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 0.8rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
}

.app-subtitle {
  font-size: 1.15rem;
  opacity: 0.95;
  margin-bottom: 1.5rem;
  font-weight: 400;
}

.platform-badges {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.platform-badge:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.app-footer p {
  margin: 0.3rem 0;
}

.footer-subtitle {
  opacity: 0.8;
  font-size: 0.85rem;
}

.footer-security {
  opacity: 0.9;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
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

  .platform-badges {
    gap: 8px;
  }

  .platform-badge {
    font-size: 0.85rem;
    padding: 6px 12px;
  }

  .header-icon svg {
    width: 36px;
    height: 36px;
  }
}
</style>
