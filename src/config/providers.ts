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
  // 百度千帆
  baidu_qianfan: {
    id: 'baidu_qianfan',
    name: '百度千帆',
    icon: '🔍',
    defaultBase: 'https://aip.baidubce.com',
    defaultModel: 'ERNIE-3.5-8K',
    defaultTestModel: 'ERNIE-3.5-8K',
    requiresSecret: true, // 需要 Secret Key
    hasBalanceCheck: true,
    color: '#4285F4'
  },
  
  // 通义千问
  tongyi_qianwen: {
    id: 'tongyi_qianwen',
    name: '通义千问',
    icon: '💬',
    defaultBase: 'https://dashscope.aliyuncs.com',
    defaultModel: 'qwen-turbo',
    defaultTestModel: 'qwen-turbo',
    hasBalanceCheck: true,
    color: '#FF6B6B'
  },
  
  // 智谱 GLM
  zhipu_glm: {
    id: 'zhipu_glm',
    name: '智谱 GLM',
    icon: '🤖',
    defaultBase: 'https://open.bigmodel.cn',
    defaultModel: 'glm-4-air',
    defaultTestModel: 'glm-4-air',
    hasBalanceCheck: true,
    color: '#4ECDC4'
  },
  
  // 字节豆包
  doubao: {
    id: 'doubao',
    name: '字节豆包',
    icon: '📱',
    defaultBase: 'https://api.doubao.com',
    defaultModel: 'doubao-lite-128k',
    defaultTestModel: 'doubao-lite-128k',
    requiresSecret: true, // 需要 Secret Key
    hasBalanceCheck: true,
    color: '#45B7D1'
  },
  
  // OpenAI
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    defaultBase: 'https://api.openai.com/v1',
    defaultModel: 'gpt-3.5-turbo',
    defaultTestModel: 'gpt-3.5-turbo',
    hasBalanceCheck: true,
    color: '#10A37F'
  },
  
  // Anthropic
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🔤',
    defaultBase: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-haiku-20240307',
    defaultTestModel: 'claude-3-haiku-20240307',
    hasBalanceCheck: true,
    color: '#FF6B6B'
  },

  // 硅基流动
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    icon: '⚡',
    defaultBase: 'https://api.siliconflow.cn/v1',
    defaultModel: 'deepseek-chat',
    defaultTestModel: 'deepseek-chat',
    hasBalanceCheck: true,
    color: '#9333EA'
  }
};
