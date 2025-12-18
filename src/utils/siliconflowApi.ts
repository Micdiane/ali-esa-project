// 硅基流动 API 实现
import { proxiedFetch } from './apiService';
import { PROVIDERS } from '../config/providers';

// 硅基流动模型获取
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

// 硅基流动对话测试
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
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      stream: false
    })
  });
  return await response.json();
}

// 硅基流动密钥检查
export async function checkSiliconFlowToken(token: string, baseUrl?: string) {
  // 使用余额查询接口来检查密钥是否有效
  try {
    const apiUrl = `${baseUrl || PROVIDERS.siliconflow!.defaultBase}/user/info`;
    const response = await proxiedFetch(apiUrl, {
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 硅基流动余额查询
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

  // 解析硅基流动的余额响应
  return {
    // 将字符串余额转换为数字
    remaining_tokens: parseFloat(data.data?.totalBalance || "0"),
    available_tokens: parseFloat(data.data?.balance || "0"),
    charge_balance: parseFloat(data.data?.chargeBalance || "0"),
    total_balance: parseFloat(data.data?.totalBalance || "0"),
    user_id: data.data?.id || "", // 添加用户ID
    used_ratio: 0, // 硅基流动没有直接返回使用比例，需要根据其他数据计算
    reset_time: "未知" // 硅基流动没有直接返回重置时间
  };
}
