import CryptoJS from 'crypto-js';
import type { EncryptionConfig, ApiKey } from '../types';

// 生成随机密钥和初始化向量
const generateEncryptionConfig = (): EncryptionConfig => {
  const key = CryptoJS.lib.WordArray.random(32).toString();
  const iv = CryptoJS.lib.WordArray.random(16).toString();
  return { key, iv };
};

// 获取或生成加密配置
const getEncryptionConfig = (): EncryptionConfig => {
  let config = localStorage.getItem('encryptionConfig');
  if (!config) {
    const newConfig = generateEncryptionConfig();
    localStorage.setItem('encryptionConfig', JSON.stringify(newConfig));
    return newConfig;
  }
  return JSON.parse(config);
};

// AES加密
export const encrypt = (data: any): string => {
  const config = getEncryptionConfig();
  const jsonData = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonData, CryptoJS.enc.Utf8.parse(config.key), {
    iv: CryptoJS.enc.Utf8.parse(config.iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
};

// AES解密
export const decrypt = <T>(encryptedData: string): T => {
  const config = getEncryptionConfig();
  const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Utf8.parse(config.key), {
    iv: CryptoJS.enc.Utf8.parse(config.iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  const jsonData = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(jsonData);
};

// 密钥存储管理
export const apiKeyStorage = {
  // 保存密钥
  save(key: ApiKey): void {
    const keys = this.getAll();
    const existingIndex = keys.findIndex(k => k.id === key.id);
    
    if (existingIndex >= 0) {
      // 更新现有密钥
      keys[existingIndex] = key;
    } else {
      // 添加新密钥
      keys.push(key);
    }
    
    localStorage.setItem('apiKeys', encrypt(keys));
  },
  
  // 获取所有密钥
  getAll(): ApiKey[] {
    const encryptedKeys = localStorage.getItem('apiKeys');
    if (!encryptedKeys) {
      return [];
    }
    
    const keys = decrypt<ApiKey[]>(encryptedKeys);
    // 转换日期字符串为Date对象
    return keys.map(key => ({
      ...key,
      createdAt: new Date(key.createdAt),
      updatedAt: new Date(key.updatedAt)
    }));
  },
  
  // 获取单个密钥
  get(id: string): ApiKey | undefined {
    const keys = this.getAll();
    return keys.find(key => key.id === id);
  },
  
  // 删除密钥
  delete(id: string): void {
    const keys = this.getAll();
    const filteredKeys = keys.filter(key => key.id !== id);
    localStorage.setItem('apiKeys', encrypt(filteredKeys));
  }
};
