import axios from 'axios';
import { PROVIDERS } from '../config/providers';
import CryptoJS from 'crypto-js';

// API 请求配置
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API 代理请求
export const proxiedFetch = async (url: string, options: RequestInit) => {
  try {
    // 将 HeadersInit 转换为 Axios 可接受的 headers 对象
    let axiosHeaders: any = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          axiosHeaders[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          axiosHeaders[key] = value;
        });
      } else if (options.headers) {
        axiosHeaders = { ...options.headers };
      }
    }
    
    const response = await apiClient({
      url,
      method: options.method,
      headers: axiosHeaders,
      data: options.body ? JSON.parse(options.body.toString()) : undefined
    });
    return {
      ok: response.status >= 200 && response.status < 300,
      json: () => Promise.resolve(response.data),
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers as Record<string, string>)
    } as Response;
  } catch (error) {
    // 处理错误情况
    const err = error as any;
    return {
      ok: false,
      json: () => Promise.resolve(err.response?.data || { error: err.message }),
      status: err.response?.status || 500,
      statusText: err.response?.statusText || 'Internal Server Error',
      headers: new Headers(err.response?.headers as Record<string, string> || {})
    } as Response;
  }
};

// 获取模型列表
export const fetchModels = async (providerId: string, token: string, baseUrl?: string) => {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    throw new Error(`不支持的平台: ${providerId}`);
  }

  try {
    // 根据平台类型调用不同的模型获取方法
    switch (providerId) {
      case 'openai':
        return await fetchOpenAIModels(token, baseUrl);
      case 'baidu_qianfan':
        return await fetchBaiduQianfanModels(token, baseUrl);
      case 'tongyi_qianwen':
        return await fetchTongyiQianwenModels(token, baseUrl);
      case 'zhipu_glm':
        return await fetchZhipuGLMModels(token, baseUrl);
      case 'doubao':
        return await fetchDoubaoModels(token, baseUrl);
      case 'anthropic':
        return await fetchAnthropicModels(token, baseUrl);
      default:
        throw new Error(`尚未实现 ${provider.name} 的模型获取`);
    }
  } catch (error) {
    console.error(`获取 ${provider.name} 模型列表失败:`, error);
    throw error;
  }
};

// 检查 API 密钥有效性
export const checkApiKey = async (providerId: string, token: string, baseUrl?: string) => {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    throw new Error(`不支持的平台: ${providerId}`);
  }

  try {
    // 根据平台类型调用不同的密钥检查方法
    switch (providerId) {
      case 'openai':
        return await checkOpenAIToken(token, baseUrl);
      case 'baidu_qianfan':
        return await checkBaiduQianfanToken(token, baseUrl);
      case 'tongyi_qianwen':
        return await checkTongyiQianwenToken(token, baseUrl);
      case 'zhipu_glm':
        return await checkZhipuGLMToken(token, baseUrl);
      case 'doubao':
        return await checkDoubaoToken(token, baseUrl);
      case 'anthropic':
        return await checkAnthropicToken(token, baseUrl);
      default:
        throw new Error(`尚未实现 ${provider.name} 的密钥检查`);
    }
  } catch (error) {
    console.error(`检查 ${provider.name} 密钥失败:`, error);
    throw error;
  }
};

// 查询余额
export const checkBalance = async (providerId: string, token: string, baseUrl?: string, secret?: string) => {
  const provider = PROVIDERS[providerId];
  if (!provider) {
    throw new Error(`不支持的平台: ${providerId}`);
  }

  if (!provider.hasBalanceCheck) {
    throw new Error(`${provider.name} 不支持余额查询`);
  }

  try {
    // 根据平台类型调用不同的余额查询方法
    switch (providerId) {
      case 'baidu_qianfan':
        return await checkBaiduQianfanBalance(token, baseUrl, secret);
      case 'tongyi_qianwen':
        return await checkTongyiQianwenBalance(token, baseUrl);
      case 'zhipu_glm':
        return await checkZhipuGLMBalance(token, baseUrl);
      case 'doubao':
        return await checkDoubaoBalance(token, baseUrl, secret);
      case 'siliconflow':
        return await checkSiliconFlowBalance(token, baseUrl);
      default:
        throw new Error(`尚未实现 ${provider.name} 的余额查询`);
    }
  } catch (error) {
    console.error(`查询 ${provider.name} 余额失败:`, error);
    throw error;
  }
};

// ========== 各平台具体实现 ==========

// OpenAI 模型获取
async function fetchOpenAIModels(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.openai!.defaultBase}/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.map((model: any) => model.id);
}

// 百度千帆模型获取
async function fetchBaiduQianfanModels(token: string, baseUrl?: string) {
  // 百度千帆模型列表获取接口
  const apiUrl = `${baseUrl || PROVIDERS.baidu_qianfan!.defaultBase}/rpc/2.0/ai_custom/v1/wenxinworkshop/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.result?.map((model: any) => model.model_id) || [];
}

// 通义千问模型获取
async function fetchTongyiQianwenModels(token: string, baseUrl?: string) {
  // 通义千问模型列表获取接口
  const apiUrl = `${baseUrl || PROVIDERS.tongyi_qianwen!.defaultBase}/api/v1/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.models?.map((model: any) => model.model_id) || [];
}

// 智谱 GLM 模型获取
async function fetchZhipuGLMModels(token: string, baseUrl?: string) {
  // 智谱 GLM 模型列表获取接口
  const apiUrl = `${baseUrl || PROVIDERS.zhipu_glm!.defaultBase}/api/paas/v3/model/list`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({})
  });
  const data = await response.json();
  return data.data?.models?.map((model: any) => model.model_name) || [];
}

// 字节豆包模型获取
async function fetchDoubaoModels(token: string, baseUrl?: string) {
  // 字节豆包模型列表获取接口
  const apiUrl = `${baseUrl || PROVIDERS.doubao!.defaultBase}/api/v1/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.models?.map((model: any) => model.id) || [];
}

// Anthropic 模型获取
async function fetchAnthropicModels(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.anthropic!.defaultBase}/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "x-api-key": token,
      "anthropic-version": "2023-06-01"
    }
  });
  const data = await response.json();
  return data.models.map((model: any) => model.id);
}

// ========== 密钥检查实现 ==========

// OpenAI 密钥检查
async function checkOpenAIToken(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.openai!.defaultBase}/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      model: PROVIDERS.openai!.defaultTestModel,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1
    })
  });
  return response.ok;
}

// 百度千帆密钥检查
async function checkBaiduQianfanToken(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.baidu_qianfan!.defaultBase}/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      model: PROVIDERS.baidu_qianfan!.defaultTestModel,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1
    })
  });
  return response.ok;
}

// 通义千问密钥检查
async function checkTongyiQianwenToken(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.tongyi_qianwen!.defaultBase}/api/v1/services/aigc/text-generation/generation`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      model: PROVIDERS.tongyi_qianwen!.defaultTestModel,
      input: {
        messages: [{ role: 'user', content: 'Hello' }]
      },
      parameters: {
        max_tokens: 1
      }
    })
  });
  return response.ok;
}

// 智谱 GLM 密钥检查
async function checkZhipuGLMToken(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.zhipu_glm!.defaultBase}/api/paas/v3/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      model: PROVIDERS.zhipu_glm!.defaultTestModel,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1
    })
  });
  return response.ok;
}

// 字节豆包密钥检查
async function checkDoubaoToken(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.doubao!.defaultBase}/api/v1/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      model: PROVIDERS.doubao!.defaultTestModel,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1
    })
  });
  return response.ok;
}

// Anthropic 密钥检查
async function checkAnthropicToken(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.anthropic!.defaultBase}/messages`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "x-api-key": token,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: PROVIDERS.anthropic!.defaultTestModel,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 1
    })
  });
  return response.ok;
}

// ========== 余额查询实现 ==========

// 百度千帆余额查询
async function checkBaiduQianfanBalance(token: string, _baseUrl?: string, secret?: string) {
  if (!secret) {
    throw new Error('百度千帆需要提供 Secret Key，请在密钥中添加 Secret 字段');
  }

  // 百度千帆余额查询接口 - 使用真实API，需要BCE-Auth-V1签名
  const host = 'qianfan.baidubce.com';
  const path = '/v2/resource/quota';
  const timestamp = Math.floor(Date.now() / 1000);
  const expires = 1800; // 签名有效期（秒）

  // 构造签名字符串
  const signingStr = `GET\n${path}\n\ntimestamp=${timestamp}&expires=${expires}`;

  // 计算HMAC-SHA256签名并Base64编码
  const signature = CryptoJS.HmacSHA256(signingStr, secret).toString(CryptoJS.enc.Base64);

  // 构造Authorization头
  const authHeader = `bce-auth-v1/${token}/${timestamp}/${expires}/${signature}`;

  // 执行查询
  const apiUrl = `https://${host}${path}?timestamp=${timestamp}&expires=${expires}`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      'Host': host,
      'Content-Type': 'application/json',
      'X-Bce-Signature': authHeader
    }
  });
  const data = await response.json();

  // 解析真实API响应格式
  if (data.code === 0 && data.data) {
    const quotaList = data.data.quota_list || [];
    let totalQuota = 0;
    let totalUsed = 0;
    let totalRemaining = 0;

    quotaList.forEach((quota: any) => {
      totalQuota += quota.total || 0;
      totalUsed += quota.used || 0;
      totalRemaining += quota.remaining || 0;
    });

    return {
      remaining_tokens: totalRemaining,
      total_tokens: totalQuota,
      used_tokens: totalUsed,
      used_ratio: totalQuota > 0 ? totalUsed / totalQuota : 0,
      reset_time: '每月 1 日'
    };
  }

  throw new Error(data.message || '查询失败');
}

// 通义千问余额查询
async function checkTongyiQianwenBalance(token: string, _baseUrl?: string) {
  // 通义千问余额查询接口 - 使用真实API
  const apiUrl = `https://dashscope.aliyuncs.com/api/v1/quotas`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();

  // 解析真实API响应格式
  if (data.quotas && data.quotas.length > 0) {
    // 汇总所有模型的配额
    let totalQuota = 0;
    let totalUsed = 0;
    let totalRemaining = 0;

    data.quotas.forEach((quota: any) => {
      totalQuota += quota.total || 0;
      totalUsed += quota.used || 0;
      totalRemaining += quota.remaining || 0;
    });

    return {
      remaining_tokens: totalRemaining,
      total_tokens: totalQuota,
      used_tokens: totalUsed,
      used_ratio: totalQuota > 0 ? totalUsed / totalQuota : 0,
      reset_time: '每月 1 日'
    };
  }

  throw new Error('查询失败或无配额数据');
}

// 智谱 GLM 余额查询
async function checkZhipuGLMBalance(token: string, _baseUrl?: string) {
  // 智谱 GLM 余额查询接口 - 使用真实API
  const apiUrl = `https://open.bigmodel.cn/api/paas/v4/account/quota`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();

  // 解析真实API响应格式
  if (data.code === 200 && data.data) {
    const { quota, used, remaining } = data.data;
    return {
      remaining_tokens: remaining || 0,
      total_tokens: quota || 0,
      used_tokens: used || 0,
      used_ratio: quota > 0 ? used / quota : 0,
      reset_time: '每月 1 日'
    };
  }

  throw new Error(data.message || '查询失败');
}

// 字节豆包余额查询
async function checkDoubaoBalance(token: string, _baseUrl?: string, secret?: string) {
  if (!secret) {
    throw new Error('字节豆包需要提供 Secret Key，请在密钥中添加 Secret 字段');
  }

  // 字节豆包余额查询接口 - 使用真实API，需要Volc-Auth签名
  const host = 'maas.volcengineapi.com';
  const path = '/api/v1/account/quota';
  const region = 'cn-beijing';
  const service = 'maas';

  // 生成UTC时间戳 (ISO 8601格式)
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const date = timestamp.substring(0, 8);

  // 构造规范请求串
  const canonicalRequest = `GET\n${path}\n\nhost:${host}\nx-content-sha256:UNSIGNED-PAYLOAD\nx-date:${timestamp}\n\nhost;x-content-sha256;x-date\nUNSIGNED-PAYLOAD`;

  // 构造待签名字符串
  const scope = `${date}/${region}/${service}/request`;
  const canonicalRequestHash = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
  const stringToSign = `HMAC-SHA256\n${timestamp}\n${scope}\n${canonicalRequestHash}`;

  // 计算签名（分步HMAC）
  let signKey = CryptoJS.HmacSHA256(date, 'VolcSecretKey' + secret);
  signKey = CryptoJS.HmacSHA256(region, signKey);
  signKey = CryptoJS.HmacSHA256(service, signKey);
  signKey = CryptoJS.HmacSHA256('request', signKey);
  const signature = CryptoJS.HmacSHA256(stringToSign, signKey).toString(CryptoJS.enc.Hex);

  // 构造Authorization头
  const authHeader = `HMAC-SHA256 Credential=${token}/${scope}, SignedHeaders=host;x-content-sha256;x-date, Signature=${signature}`;

  // 执行查询
  const apiUrl = `https://${host}${path}`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      'Host': host,
      'x-date': timestamp,
      'x-content-sha256': 'UNSIGNED-PAYLOAD',
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();

  // 解析真实API响应格式
  if (data.code === 0 && data.data) {
    const { total, used, remaining } = data.data;
    return {
      remaining_tokens: remaining || 0,
      total_tokens: total || 0,
      used_tokens: used || 0,
      used_ratio: total > 0 ? used / total : 0,
      reset_time: '每月 1 日'
    };
  }

  throw new Error(data.message || '查询失败');
}

// 硅基流动余额查询
async function checkSiliconFlowBalance(token: string, _baseUrl?: string) {
  // 硅基流动余额查询接口 - 使用真实API，Bearer Token认证
  const apiUrl = `https://api.siliconflow.cn/v1/account/balance`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();

  // 解析真实API响应格式
  if (data.code === 200 && data.data) {
    const {
      total_balance,
      used_balance,
      remaining_balance,
      free_quota,
      used_free_quota,
      remaining_free_quota
    } = data.data;

    // 优先使用免费Token配额，如果没有则使用余额信息
    const totalTokens = free_quota || (total_balance * 1000) || 0; // 余额转换为Token估算值
    const usedTokens = used_free_quota || (used_balance * 1000) || 0;
    const remainingTokens = remaining_free_quota || (remaining_balance * 1000) || 0;

    return {
      remaining_tokens: remainingTokens,
      total_tokens: totalTokens,
      used_tokens: usedTokens,
      used_ratio: totalTokens > 0 ? usedTokens / totalTokens : 0,
      reset_time: '每月 1 日',
      // 额外信息
      balance_info: {
        total_balance,
        used_balance,
        remaining_balance
      }
    };
  }

  throw new Error(data.message || '查询失败');
}
