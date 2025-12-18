<template>
  <div class="model-tester">
    <h2>模型测试</h2>

    <!-- 平台和 API Key 输入 -->
    <div class="input-section">
      <div class="input-group">
        <label for="platform">选择平台:</label>
        <select id="platform" v-model="selectedPlatform" class="platform-select">
          <option value="siliconflow">💧 硅基流动</option>
          <option value="dashscope">☁️ 阿里云 DashScope</option>
          <option value="deepseek">🧠 DeepSeek</option>
          <option value="kimi">🌙 Kimi (月之暗面)</option>
        </select>
      </div>

      <div class="input-group">
        <label for="apiKey">API Key:</label>
        <input
          id="apiKey"
          v-model="apiKey"
          type="text"
          placeholder="请输入 API Key"
          class="api-key-input"
        />
        <button
          @click="fetchModels"
          :disabled="!apiKey || loading"
          class="fetch-btn"
        >
          {{ loading ? '查询中...' : '查询可用模型' }}
        </button>
        <button
          v-if="PROVIDERS[selectedPlatform]?.hasBalanceCheck"
          @click="checkBalance"
          :disabled="!apiKey || balanceLoading"
          class="balance-btn"
        >
          {{ balanceLoading ? '查询中...' : '查询余额' }}
        </button>
      </div>
    </div>

    <!-- 余额信息 -->
    <div v-if="balanceInfo" class="balance-section">
      <h3>余额信息</h3>
      <div v-if="balanceInfo.balanceUrl" class="balance-notice">
        <p>{{ balanceInfo.message }}</p>
        <p>{{ balanceInfo.instruction }}</p>
        <a :href="balanceInfo.balanceUrl" target="_blank" class="balance-link">
          访问控制台查看余额 →
        </a>
      </div>
      <div v-else-if="selectedPlatform === 'deepseek' && balanceInfo.balance_infos" class="balance-details">
        <div v-for="(info, idx) in balanceInfo.balance_infos" :key="idx" class="balance-item">
          <strong>{{ info.currency }}:</strong>
          <span>总余额: {{ info.total_balance }}</span>
          <span>充值余额: {{ info.topped_up_balance }}</span>
          <span>赠送余额: {{ info.granted_balance }}</span>
        </div>
        <div class="balance-status">
          状态: <span :class="balanceInfo.is_available ? 'status-ok' : 'status-error'">
            {{ balanceInfo.is_available ? '可用' : '不可用' }}
          </span>
        </div>
      </div>
      <div v-else-if="selectedPlatform === 'kimi' && balanceInfo.data" class="balance-details">
        <div class="balance-item">
          <span>可用余额: {{ balanceInfo.data.available_balance }}</span>
          <span>代金券余额: {{ balanceInfo.data.voucher_balance }}</span>
          <span>现金余额: {{ balanceInfo.data.cash_balance }}</span>
        </div>
      </div>
      <div v-else-if="selectedPlatform === 'siliconflow'" class="balance-details">
        <div class="balance-item">
          <span>总余额: {{ balanceInfo.total_balance }}</span>
          <span>可用余额: {{ balanceInfo.available_tokens }}</span>
          <span>充值余额: {{ balanceInfo.charge_balance }}</span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 模型列表 -->
    <div v-if="models.length > 0" class="models-section">
      <h3>可用模型列表 ({{ models.length }} 个)</h3>
      <div class="models-list">
        <div
          v-for="model in models"
          :key="model.id"
          class="model-item"
          :class="{ 'selected': selectedModel === model.id }"
          @click="selectModel(model.id)"
        >
          <div class="model-id">{{ model.id }}</div>
          <div v-if="model.owned_by" class="model-owner">提供者: {{ model.owned_by }}</div>
        </div>
      </div>
    </div>

    <!-- 对话测试 -->
    <div v-if="selectedModel" class="chat-section">
      <h3>测试对话</h3>
      <div class="chat-container">
        <div class="selected-model-info">
          <strong>当前平台:</strong> {{ PROVIDERS[selectedPlatform]?.name }} <br>
          <strong>当前模型:</strong> {{ selectedModel }}
        </div>

        <div class="message-input-group">
          <textarea
            v-model="testMessage"
            placeholder="输入测试消息..."
            class="message-input"
            rows="3"
          ></textarea>
          <button
            @click="testChat"
            :disabled="!testMessage || chatLoading"
            class="send-btn"
          >
            {{ chatLoading ? '发送中...' : '发送消息' }}
          </button>
        </div>

        <!-- 对话历史 -->
        <div v-if="chatHistory.length > 0" class="chat-history">
          <h4>对话历史</h4>
          <div
            v-for="(chat, index) in chatHistory"
            :key="index"
            class="chat-entry"
          >
            <div class="user-message">
              <strong>用户:</strong> {{ chat.userMessage }}
            </div>
            <div class="assistant-message">
              <strong>助手:</strong> {{ chat.assistantMessage }}
            </div>
            <div v-if="chat.error" class="error-response">
              <strong>错误:</strong> {{ chat.error }}
            </div>
            <div class="chat-meta">
              <span>平台: {{ PROVIDERS[chat.platform]?.name }}</span>
              <span>模型: {{ chat.model }}</span>
              <span v-if="chat.usage">
                Tokens: {{ chat.usage.total_tokens }}
                (输入: {{ chat.usage.prompt_tokens }}, 输出: {{ chat.usage.completion_tokens }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fetchModelsByPlatform, checkBalanceByPlatform, testChatByPlatform } from '../utils/platformApis';
import { PROVIDERS } from '../config/providers';
import type { Platform } from '../types';

interface Model {
  id: string;
  object?: string;
  created?: number;
  owned_by?: string;
}

interface ChatEntry {
  userMessage: string;
  assistantMessage: string;
  platform: Platform;
  model: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const selectedPlatform = ref<Platform>('siliconflow');
const apiKey = ref('');
const models = ref<Model[]>([]);
const loading = ref(false);
const error = ref('');
const selectedModel = ref('');
const testMessage = ref('你好，请介绍一下你自己。');
const chatLoading = ref(false);
const chatHistory = ref<ChatEntry[]>([]);
const balanceLoading = ref(false);
const balanceInfo = ref<any>(null);

const fetchModels = async () => {
  if (!apiKey.value) {
    error.value = '请输入 API Key';
    return;
  }

  loading.value = true;
  error.value = '';
  models.value = [];
  selectedModel.value = '';

  try {
    const data = await fetchModelsByPlatform(selectedPlatform.value, apiKey.value);
    models.value = data;
    if (models.value.length === 0) {
      error.value = '未查询到可用模型';
    }
  } catch (err: any) {
    error.value = `查询失败: ${err.message || '网络错误'}`;
  } finally {
    loading.value = false;
  }
};

const checkBalance = async () => {
  if (!apiKey.value) {
    error.value = '请输入 API Key';
    return;
  }

  balanceLoading.value = true;
  balanceInfo.value = null;

  try {
    const data = await checkBalanceByPlatform(selectedPlatform.value, apiKey.value);
    balanceInfo.value = data;
  } catch (err: any) {
    error.value = `查询余额失败: ${err.message || '网络错误'}`;
  } finally {
    balanceLoading.value = false;
  }
};

const selectModel = (modelId: string) => {
  selectedModel.value = modelId;
};

const testChat = async () => {
  if (!testMessage.value || !selectedModel.value) {
    return;
  }

  chatLoading.value = true;

  try {
    const response = await testChatByPlatform(
      selectedPlatform.value,
      apiKey.value,
      selectedModel.value,
      testMessage.value
    );

    const chatEntry: ChatEntry = {
      userMessage: testMessage.value,
      assistantMessage: response.choices?.[0]?.message?.content || '无响应',
      platform: selectedPlatform.value,
      model: selectedModel.value,
      usage: response.usage
    };

    if (response.error) {
      chatEntry.error = response.error.message || JSON.stringify(response.error);
    }

    chatHistory.value.unshift(chatEntry);
    testMessage.value = '';
  } catch (err: any) {
    chatHistory.value.unshift({
      userMessage: testMessage.value,
      assistantMessage: '',
      platform: selectedPlatform.value,
      model: selectedModel.value,
      error: err.message || '请求失败'
    });
  } finally {
    chatLoading.value = false;
  }
};
</script>

<style scoped>
.model-tester {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h2 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #333;
}

h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #444;
}

h4 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #555;
}

.input-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.input-group {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-group label {
  font-weight: 500;
  color: #333;
  min-width: 80px;
}

.platform-select {
  flex: 1;
  min-width: 200px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.platform-select:focus {
  outline: none;
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.api-key-input {
  flex: 1;
  min-width: 300px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.api-key-input:focus {
  outline: none;
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.fetch-btn,
.balance-btn,
.send-btn {
  padding: 10px 20px;
  background-color: #9333EA;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.fetch-btn:hover:not(:disabled),
.balance-btn:hover:not(:disabled),
.send-btn:hover:not(:disabled) {
  background-color: #7c2cc9;
}

.fetch-btn:disabled,
.balance-btn:disabled,
.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.balance-btn {
  background-color: #10b981;
}

.balance-btn:hover:not(:disabled) {
  background-color: #059669;
}

.balance-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.balance-notice {
  background-color: #fff7ed;
  border-left: 4px solid #FF6A00;
  padding: 16px;
  border-radius: 4px;
}

.balance-notice p {
  margin-bottom: 8px;
  color: #333;
}

.balance-link {
  display: inline-block;
  margin-top: 8px;
  color: #FF6A00;
  font-weight: 500;
  text-decoration: none;
}

.balance-link:hover {
  text-decoration: underline;
}

.balance-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.balance-item {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 4px;
}

.balance-item span {
  color: #555;
}

.balance-status {
  font-weight: 500;
}

.status-ok {
  color: #10b981;
}

.status-error {
  color: #ef4444;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #c33;
}

.models-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.models-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.model-item {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fafafa;
}

.model-item:hover {
  border-color: #9333EA;
  background-color: #f5f0ff;
}

.model-item.selected {
  border-color: #9333EA;
  background-color: #f0e7ff;
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.2);
}

.model-id {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  word-break: break-all;
}

.model-owner {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
}

.chat-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-container {
  margin-top: 16px;
}

.selected-model-info {
  background-color: #f0e7ff;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  color: #333;
  line-height: 1.6;
}

.message-input-group {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.message-input:focus {
  outline: none;
  border-color: #9333EA;
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

.chat-history {
  margin-top: 24px;
}

.chat-entry {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.user-message {
  margin-bottom: 12px;
  color: #333;
}

.assistant-message {
  margin-bottom: 12px;
  color: #444;
  padding: 12px;
  background-color: white;
  border-radius: 4px;
  border-left: 3px solid #9333EA;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-response {
  color: #c33;
  margin-bottom: 8px;
  padding: 8px;
  background-color: #fee;
  border-radius: 4px;
}

.chat-meta {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .model-tester {
    padding: 10px;
  }

  .input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .input-group label {
    min-width: auto;
  }

  .api-key-input,
  .platform-select {
    min-width: auto;
  }

  .models-list {
    grid-template-columns: 1fr;
  }

  .message-input-group {
    flex-direction: column;
  }

  .balance-item {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
