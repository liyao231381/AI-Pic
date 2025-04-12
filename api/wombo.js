// api/wombo.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      // 获取请求体中的数据
      const { prompt, aspect_ratio, style, display_freq } = req.body;
  
      // 构造要转发给 WOMBO API 的请求体
      const requestBody = {
        "is_premium": false,
        "input_spec": {
          "aspect_ratio": aspect_ratio,
          "prompt": prompt,
          "style": parseInt(style),
          "display_freq": parseInt(display_freq)
        }
      };
  
      // WOMBO API 的请求头
      const headers = {
        'authority': 'paint.api.wombo.ai',
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'authorization': 'bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjcxMTE1MjM1YTZjNjE0NTRlZmRlZGM0NWE3N2U0MzUxMzY3ZWViZTAiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoibGl5YW8yMzEzODEiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FMVi1Vald0S2ptZkhHblFZWmJUS3BiX0xOa1U5UGV4SDdIX005Mi0wZndRaVkzUElTaXlMUnlZPXM5Ni1jIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL3BhaW50LXByb2QiLCJhdWQiOiJwYWludC1wcm9kIiwiYXV0aF90aW1lIjoxNzQ0MTcyMDkxLCJ1c2VyX2lkIjoiM2RFTUppOEdhZ1pXTHoyeWU5UVZ3eUFrTGlQMiIsInN1YiI6IjNkRU1KaThHYWdaV0x6MnllOVFWd3lBa0xpUDIiLCJpYXQiOjE3NDQ0NDczODYsImV4cCI6MTc0NDQ1MDk4NiwiZW1haWwiOiJxcTIzMTM4MTQyMjFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZ29vZ2xlLmNvbSI6WyIxMDg4MjgxNTMxMzM3MTIxODc0NjciXSwiZW1haWwiOlsicXEyMzEzODE0MjIxQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.fGx6Orhag53NoH2vR3BG3Hq5u9o5HuciZtZYvN279mMO88SPVcSKusQKlNWaw12jwJGagfC1gcctbsDxfkCAMuw56ABHH71vgqOpPTl63G2XkmG-dfvoF9mshNZlKqowWEoqb45Z6IcpSmnYuUf5Q4Q4d9wrHgyZaxPI68Kztilstb8EqHxwQ8muL7yjlEHP38Lv-gvJOamav3PLBRmF-QkRDsimJe7yjxxlD3-PrGXHYVHxWDtOvCKD6lbqUP0tIaehhfVhNHS_3eeFVxBxU1tOK0SeIkAw-ysAi-ZrLzd8LMnTzmD96p6zXxfqePA3CfB9LoMeaGxS9um0nPkXTA',
        'content-type': 'application/json',
        'origin': 'https://dream.ai',
        'priority': 'u=1, i',
        'referer': 'https://dream.ai/',
        'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0',
        'x-app-version': 'WEB-2.0.0',
        'x-validation-token': 'eyJraWQiOiJEX28wMGciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjE4MTY4MTU2OTM1OTp3ZWI6Mjc3MTMzYjU3ZmVjZjU3YWYwZjQzYSIsImF1ZCI6WyJwcm9qZWN0c1wvMTgxNjgxNTY5MzU5IiwicHJvamVjdHNcL3BhaW50LXByb2QiXSwicHJvdmlkZXIiOiJyZWNhcHRjaGFfZW50ZXJwcmlzZSIsImlzcyI6Imh0dHBzOlwvXC9maXJlYmFzZWFwcGNoZWNrLmdvb2dsZWFwaXMuY29tXC8xODE2ODE1NjkzNTkiLCJleHAiOjE3NDQ0NjE3NjgsImlhdCI6MTc0NDQ0Mzc2OCwianRpIjoiT05vanNaMUN3dE1FdjMyQml3RzBJaTdqRzktMnlXZDFOS3ZDZmVLWnBPZyJ9.JX-JqMI5jUWe6ppXN3_ARUN9yZD32pNMYLO82HUsJWv6EHhd4IP7e0t3ACHPIRfuj5k8UJnC_GIeESGz9bMOWeXwSL1-Yu_WuvGxKrZh54t5FQC9vbl39WmRXK1T16orS0Ei_-G25oLLb7DcclX6tmMHA15S5IOqppzEdWPAfvBdyuwq6jA9HMt9oXcjwg5ykvvxLKxdX4m7a17KavZSU4-YU_2GiLhHU48S-fZXpQzDyAfvDY7sSiDQrrLs6NyuCdHKw3NkeT7EmW8XUPC2FNwsKPhGDsod0uZKLH9cudGkgmZqMTsTdl5xevyJl0Wj1QM1iYziJfODWrf2pOKuiL3dLlDfAZf402AdCjNr4n0fAtSK_B3ji-tmgmfBUQLq_78bK9mSqQqCvRXZFkDtE-Y4HvHpyN6O-sOaWseXHSPyeq4CzxfX8MuB_T5icwUgqG9sBYiU6acsEEOLnJoJ6qmW1tcNx2xTcQ1C3ZkDhXW09ZXaKW4TBn8hFZ_AJJ7-'
      };
  
  
      try {
        // 使用 `fetch` 将请求转发给 WOMBO API
        const response = await fetch('https://paint.api.wombo.ai/api/v2/tasks', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody)
        });
  
        const data = await response.json();
  
        // 设置 CORS 头，允许来自你的域的请求
        res.setHeader('Access-Control-Allow-Origin', '*'); //  实际部署时替换为你的域名
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
        // 返回 WOMBO API 的响应
        res.status(200).json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else if (req.method === 'OPTIONS') {
      // 处理预检请求 (CORS)
      res.setHeader('Access-Control-Allow-Origin', '*'); //  实际部署时替换为你的域名
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(200).end();
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  