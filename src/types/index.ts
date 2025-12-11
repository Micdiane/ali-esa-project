// 平台类型定义
export const Platform = {
  BAIDU_QIANFAN: 'baidu_qianfan',
  TONGYI_QIANWEN: 'tongyi_qianwen',
  ZHIPU_GLM: 'zhipu_glm',
  DOUBAO: 'doubao'
} as const;

export type Platform = typeof Platform[keyof typeof Platform];

// 密钥信息类型
export interface ApiKey {
  id: string;
  platform: Platform;
  name: string;
  key: string;
  secret?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 余额/配额信息类型
export interface QuotaInfo {
  platform: Platform;
  remainingTokens: number;
  usedRatio: number;
  resetTime: string;
  lastChecked: Date;
}

// 模型信息类型
export interface ModelInfo {
  id: string;
  name: string;
  platform: Platform;
  contextWindow: number;
  qpsLimit: number;
  features: string[];
  isFree: boolean;
}

// 模型可用性检测结果类型
export interface ModelAvailability {
  platform: Platform;
  modelId: string;
  latency: number;
  qpsUsage: number;
  status: 'normal' | 'limited' | 'unavailable';
  lastChecked: Date;
}

// 加密存储配置类型
export interface EncryptionConfig {
  key: string;
  iv: string;
}
