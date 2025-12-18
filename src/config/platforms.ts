import { Platform, type ModelInfo } from '../types';

// 平台基础配置
export const platformConfig = {
  [Platform.SILICONFLOW]: {
    name: '硅基流动',
    quotaApi: 'https://api.siliconflow.cn/v1/account/balance',
    modelApi: '',
    color: '#9333EA'
  },
  [Platform.DASHSCOPE]: {
    name: '阿里云 DashScope',
    quotaApi: '',
    modelApi: '',
    color: '#FF6A00'
  },
  [Platform.DEEPSEEK]: {
    name: 'DeepSeek',
    quotaApi: '',
    modelApi: '',
    color: '#1E40AF'
  },
  [Platform.KIMI]: {
    name: 'Kimi (月之暗面)',
    quotaApi: '',
    modelApi: '',
    color: '#8B5CF6'
  }
};

// 内置模型列表 - 仅保留硅基流动模型
export const builtinModels: ModelInfo[] = [
  // 硅基流动模型
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    platform: Platform.SILICONFLOW,
    contextWindow: 32768,
    qpsLimit: 10,
    features: ['文本生成'],
    isFree: true
  },
  {
    id: 'qwen-2.5-72b-chat',
    name: 'Qwen 2.5 72B Chat',
    platform: Platform.SILICONFLOW,
    contextWindow: 32768,
    qpsLimit: 10,
    features: ['文本生成'],
    isFree: true
  }
];

// 获取平台支持的模型
export const getModelsByPlatform = (platform: Platform): ModelInfo[] => {
  return builtinModels.filter(model => model.platform === platform);
};
