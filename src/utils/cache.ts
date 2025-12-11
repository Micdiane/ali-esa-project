// ESA缓存机制实现

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class EsaCache<T> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private defaultExpiry: number;

  constructor(defaultExpiry: number = 10 * 60 * 1000) { // 默认10分钟
    this.defaultExpiry = defaultExpiry;
    this.loadFromStorage();
    
    // 定期清理过期缓存
    setInterval(() => {
      this.cleanExpired();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  // 从本地存储加载缓存
  private loadFromStorage(): void {
    const cachedData = localStorage.getItem('esaCache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        this.cache = new Map(Object.entries(parsed));
      } catch (error) {
        console.error('Failed to load cache from storage:', error);
        this.cache = new Map();
      }
    }
  }

  // 保存缓存到本地存储
  private saveToStorage(): void {
    const cacheObj = Object.fromEntries(this.cache);
    localStorage.setItem('esaCache', JSON.stringify(cacheObj));
  }

  // 清理过期缓存
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.defaultExpiry) {
        this.cache.delete(key);
      }
    }
    this.saveToStorage();
  }

  // 设置缓存
  set(key: string, data: T): void {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    this.cache.set(key, cacheItem);
    this.saveToStorage();
  }

  // 获取缓存
  get<K extends T>(key: string): K | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > this.defaultExpiry) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return item.data as K;
  }

  // 清除指定缓存
  delete(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  // 清除所有缓存
  clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }
}

// 创建不同类型的缓存实例
export const quotaCache = new EsaCache();
export const modelCache = new EsaCache();
export const availabilityCache = new EsaCache();
