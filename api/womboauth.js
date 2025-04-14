// womboauth.js
const https = require('https');

export default async function handler(req, res) {
  // 允许跨域请求 (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const apiKey = process.env.FIREBASE_API_KEY; // 从环境变量中获取API密钥
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`; // 修改后的 API 端点 URL

    const headers = {
      'authority': 'identitytoolkit.googleapis.com',
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br, zstd',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
      'content-type': 'application/json',
      'origin': 'https://dream.ai',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0',
      'x-client-version': 'Chrome/JsCore/9.23.0/FirebaseCore-web',
      'x-firebase-appcheck': req.body['x-firebase-appcheck'],
      'x-firebase-gmpid': '1:181681569359:web:277133b57fecf57af0f43a',
    };

    const requestBody = req.body; // 直接从 req.body 获取请求体数据

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody) // 使用获取到的请求体数据
      });

      const responseData = await response.json();
      res.status(response.status).json(responseData);  // 转发状态码和响应数据
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
