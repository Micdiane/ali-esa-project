// 统一的平台 API 实现
import { proxiedFetch } from './apiService';
import { PROVIDERS } from '../config/providers';
import type { Platform } from '../types';

// ==================== 硅基流动 ====================
export async function fetchSiliconFlowModels(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.siliconflow!.defaultBase}/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data || [];
}

export async function checkSiliconFlowBalance(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.siliconflow!.defaultBase}/user/info`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`,
      "accept": "application/json"
    }
  });
  const data = await response.json();

  return {
    remaining_tokens: parseFloat(data.data?.totalBalance || "0"),
    available_tokens: parseFloat(data.data?.balance || "0"),
    charge_balance: parseFloat(data.data?.chargeBalance || "0"),
    total_balance: parseFloat(data.data?.totalBalance || "0"),
    user_id: data.data?.id || "",
    used_ratio: 0,
    reset_time: "未知"
  };
}

export async function testSiliconFlowChat(token: string, modelId: string, message: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.siliconflow!.defaultBase}/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: message }],
      stream: false
    })
  });
  return await response.json();
}

// ==================== Dashscope (阿里云) ====================
export async function fetchDashscopeModels(token: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.dashscope!.defaultBase}/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data || [];
}

export async function checkDashscopeBalance(token: string) {
  // Dashscope 不支持 API 查询余额
  return {
    message: '阿里云 DashScope 不支持 API 查询余额',
    balanceUrl: 'https://billing-cost.console.aliyun.com/home',
    instruction: '请访问阿里云控制台查看余额'
  };
}

export async function testDashscopeChat(token: string, modelId: string, message: string, baseUrl?: string) {
  const apiUrl = `${baseUrl || PROVIDERS.dashscope!.defaultBase}/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: message }],
      stream: false
    })
  });
  return await response.json();
}

// ==================== DeepSeek ====================
export async function fetchDeepseekModels(token: string) {
  const apiUrl = `${PROVIDERS.deepseek!.defaultBase}/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data || [];
}

export async function checkDeepseekBalance(token: string) {
  const apiUrl = `${PROVIDERS.deepseek!.defaultBase}/user/balance`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return await response.json();
}

export async function testDeepseekChat(token: string, modelId: string, message: string) {
  const apiUrl = `${PROVIDERS.deepseek!.defaultBase}/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: message }],
      stream: false
    })
  });
  return await response.json();
}

// ==================== Kimi (月之暗面) ====================
export async function fetchKimiModels(token: string) {
  const apiUrl = `${PROVIDERS.kimi!.defaultBase}/models`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data || [];
}

export async function checkKimiBalance(token: string) {
  const apiUrl = `${PROVIDERS.kimi!.defaultBase}/users/me/balance`;
  const response = await proxiedFetch(apiUrl, {
    method: 'GET',
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  return await response.json();
}

export async function testKimiChat(token: string, modelId: string, message: string) {
  const apiUrl = `${PROVIDERS.kimi!.defaultBase}/chat/completions`;
  const response = await proxiedFetch(apiUrl, {
    method: 'POST',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: "user", content: message }],
      stream: false
    })
  });
  return await response.json();
}

// ==================== 统一接口 ====================
export async function fetchModelsByPlatform(platform: Platform, token: string, baseUrl?: string) {
  switch (platform) {
    case 'siliconflow':
      return fetchSiliconFlowModels(token, baseUrl);
    case 'dashscope':
      return fetchDashscopeModels(token, baseUrl);
    case 'deepseek':
      return fetchDeepseekModels(token);
    case 'kimi':
      return fetchKimiModels(token);
    default:
      throw new Error(`不支持的平台: ${platform}`);
  }
}

export async function checkBalanceByPlatform(platform: Platform, token: string, baseUrl?: string) {
  switch (platform) {
    case 'siliconflow':
      return checkSiliconFlowBalance(token, baseUrl);
    case 'dashscope':
      return checkDashscopeBalance(token);
    case 'deepseek':
      return checkDeepseekBalance(token);
    case 'kimi':
      return checkKimiBalance(token);
    default:
      throw new Error(`不支持的平台: ${platform}`);
  }
}

export async function testChatByPlatform(platform: Platform, token: string, modelId: string, message: string, baseUrl?: string) {
  switch (platform) {
    case 'siliconflow':
      return testSiliconFlowChat(token, modelId, message, baseUrl);
    case 'dashscope':
      return testDashscopeChat(token, modelId, message, baseUrl);
    case 'deepseek':
      return testDeepseekChat(token, modelId, message);
    case 'kimi':
      return testKimiChat(token, modelId, message);
    default:
      throw new Error(`不支持的平台: ${platform}`);
  }
}
