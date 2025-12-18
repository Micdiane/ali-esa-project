// 平台配置定义
export interface ProviderConfig {
  id: string;
  name: string;
  icon: string;
  defaultBase: string;
  defaultModel: string;
  defaultTestModel: string;
  requiresSecret?: boolean;
  hasBalanceCheck?: boolean;
  color: string;
}

// 平台配置
export const PROVIDERS: Record<string, ProviderConfig> = {
  // 硅基流动
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    icon: '💧',
    defaultBase: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-chat',
    defaultTestModel: 'deepseek-chat',
    hasBalanceCheck: true,
    color: '#9333EA'
  },
  // 阿里云 Dashscope
  dashscope: {
    id: 'dashscope',
    name: '阿里云 DashScope',
    icon: '☁️',
    defaultBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-turbo',
    defaultTestModel: 'qwen-turbo',
    hasBalanceCheck: false, // 不支持 API 查询余额
    color: '#FF6A00'
  },
  // DeepSeek
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🧠',
    defaultBase: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    defaultTestModel: 'deepseek-chat',
    hasBalanceCheck: true,
    color: '#1E40AF'
  },
  // Kimi (月之暗面)
  kimi: {
    id: 'kimi',
    name: 'Kimi (月之暗面)',
    icon: '🌙',
    defaultBase: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-8k',
    defaultTestModel: 'moonshot-v1-8k',
    hasBalanceCheck: true,
    color: '#8B5CF6'
  }
};
