import { Platform, type ModelInfo } from '../types';

// 平台基础配置
export const platformConfig = {
  [Platform.BAIDU_QIANFAN]: {
    name: '百度千帆',
    quotaApi: 'https://console.bce.baidu.com/qianfan/ais/console/quota',
    modelApi: '',
    color: '#4285F4'
  },
  [Platform.TONGYI_QIANWEN]: {
    name: '通义千问',
    quotaApi: 'https://dashscope.aliyuncs.com/api/v1/account/quota',
    modelApi: '',
    color: '#FF6B6B'
  },
  [Platform.ZHIPU_GLM]: {
    name: '智谱 GLM',
    quotaApi: '',
    modelApi: '',
    color: '#4ECDC4'
  },
  [Platform.DOUBAO]: {
    name: '字节豆包',
    quotaApi: '',
    modelApi: '',
    color: '#45B7D1'
  },
  [Platform.SILICONFLOW]: {
    name: '硅基流动',
    quotaApi: 'https://api.siliconflow.cn/v1/account/balance',
    modelApi: '',
    color: '#9333EA'
  }
};

// 内置模型列表
export const builtinModels: ModelInfo[] = [
  // 百度千帆模型
  {
    id: 'ERNIE-3.5-8K',
    name: 'ERNIE-3.5-8K',
    platform: Platform.BAIDU_QIANFAN,
    contextWindow: 8192,
    qpsLimit: 50,
    features: ['文本生成'],
    isFree: true
  },
  {
    id: 'ERNIE-3.5-4K-0205',
    name: 'ERNIE-3.5-4K-0205',
    platform: Platform.BAIDU_QIANFAN,
    contextWindow: 4096,
    qpsLimit: 50,
    features: ['文本生成'],
    isFree: true
  },
  
  // 通义千问模型
  {
    id: 'qwen-turbo',
    name: 'Qwen-Turbo',
    platform: Platform.TONGYI_QIANWEN,
    contextWindow: 8192,
    qpsLimit: 2,
    features: ['文本生成'],
    isFree: true
  },
  {
    id: 'qwen-plus',
    name: 'Qwen-Plus',
    platform: Platform.TONGYI_QIANWEN,
    contextWindow: 32768,
    qpsLimit: 2,
    features: ['文本生成'],
    isFree: false
  },
  
  // 智谱 GLM 模型
  {
    id: 'glm-4-air',
    name: 'GLM-4-Air',
    platform: Platform.ZHIPU_GLM,
    contextWindow: 128000,
    qpsLimit: 10,
    features: ['文本生成'],
    isFree: true
  },
  {
    id: 'glm-4-flash',
    name: 'GLM-4-Flash',
    platform: Platform.ZHIPU_GLM,
    contextWindow: 128000,
    qpsLimit: 10,
    features: ['文本生成', '多模态'],
    isFree: false
  },
  
  // 字节豆包模型
  {
    id: 'doubao-pro-128k',
    name: '豆包 Pro 128K',
    platform: Platform.DOUBAO,
    contextWindow: 131072,
    qpsLimit: 10,
    features: ['文本生成'],
    isFree: false
  },
  {
    id: 'doubao-lite-128k',
    name: '豆包 Lite 128K',
    platform: Platform.DOUBAO,
    contextWindow: 131072,
    qpsLimit: 10,
    features: ['文本生成'],
    isFree: true
  },

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
