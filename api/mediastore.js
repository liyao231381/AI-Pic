// api/mediastore.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
        // 从请求头中获取 Authorization Token
        let authorizationToken = req.headers.authorization; // 注意：这里使用 let

        if (!authorizationToken) {
            return res.status(401).json({ error: 'Authorization Token is required' });
        }

        // 获取请求体中的 Base64 编码的图片数据
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // 构造要转发给 dream.ai API 的请求体
        const requestBody = {
            media_suffix: 'jpeg',
            num_uploads: 1,
            image: image
        };

        // dream.ai API 的请求头
        const headers = {
            'authority': 'dream.ai',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'authorization': authorizationToken, // 使用添加了 "bearer " 前缀的 Token
            'content-type': 'application/json; charset=UTF-8',
            'origin': 'https://dream.ai',
            'referer': 'https://dream.ai/create',
            'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0',
            'x-app-version': 'WEB-2.0.0'
        };

        try {
            console.log("Authorization Token:", authorizationToken); // 打印 Authorization Token
            console.log("Request Body:", JSON.stringify(requestBody)); // 打印 Request Body
            console.log("Headers:", JSON.stringify(headers)); // 打印 Headers

            // 使用 `fetch` 将请求转发给 dream.ai API
            const response = await fetch('https://dream.ai/api/mediastore', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            console.log("Response Status:", response.status); // 打印 Response Status
            console.log("Response Status Text:", response.statusText); // 打印 Response Status Text

            const data = await response.json();

            // 设置 CORS 头，允许来自你的域的请求
            res.setHeader('Access-Control-Allow-Origin', '*'); // 实际部署时替换为你的域名
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // 返回 dream.ai API 的响应
            res.status(200).json(data);
        } catch (error) {
            console.error("Fetch Error:", error); // 打印 Fetch Error
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
    } else if (req.method === 'OPTIONS') {
        // 处理预检请求 (CORS)
        res.setHeader('Access-Control-Allow-Origin', '*'); // 实际部署时替换为你的域名
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(200).end();
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
