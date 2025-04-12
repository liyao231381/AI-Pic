// 文件: api/mediastore-proxy.js

export default async function handler(req, res) {
    // 允许来自任何来源的请求（在生产环境中进行调整！）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理 CORS 预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).json({ error: `不允许使用方法 ${req.method}` });
    }

    // --- 授权和正文处理 ---
    const authorizationToken = req.headers.authorization; // 从传入的请求中获取令牌
    if (!authorizationToken) {
        return res.status(401).json({ error: '需要授权令牌' });
    }

    // 前端发送 JSON，因此解析它
    const { media_suffix, num_uploads, image } = req.body;

    if (!image || !media_suffix || num_uploads === undefined) {
        return res.status(400).json({ error: '请求正文中缺少必需字段（image、media_suffix、num_uploads）' });
    }

    // --- 构造对实际 dream.ai API 的请求 ---
    const targetUrl = 'https://dream.ai/api/mediastore';

    // 准备目标 API 期望的确切正文格式（包含 JSON 的 text/plain）
    const requestBodyString = JSON.stringify({
        media_suffix: media_suffix,
        num_uploads: num_uploads,
        image: image // 从前端接收的 Base64 字符串
    });

    // 准备模仿 curl 命令的标头
    // 重要提示：Cookie 在此处基于你的 curl 命令进行硬编码。
    // 这些可能会过期或特定于会话，从而导致请求稍后失败。
    // 更强大的解决方案可能需要处理登录/会话管理。
    const headersToForward = {
        'authority': 'dream.ai',
        'accept': '*/*',
        'accept-encoding': 'gzip, deflate, br, zstd', // 让 fetch/node 处理压缩（如果需要）
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        'authorization': authorizationToken, // 使用从前端传递过来的令牌
        'content-type': 'text/plain;charset=UTF-8', // 关键：按照 curl 命令进行设置
        'cookie': 'wombo_server_session=Fe26.2*1*0e65266f8d44107394586d875ae6eafe6992eac09e2d8273bf62389c8abd9044*o6H5jGo28idRotFDIUWGxw*ArscMw5GMy8rmLuv-J327Qxz3lQh4q7zmlhKjYkSDHainNujcegksRWW2FTtYxc929IUzG3PL0Jvavm2dcPIEqTgydJ6LrWHdyZKNtIcVO-1SiEBdH9tpqkR-7TJhGcQEu5J4NZ4fuNbMd6p7d7B8SxKCXtrcoq2J5Yk1XH2Rh4y0AIEUYWTGIgwwfFL6mWv93Pg3gpyIirEhijzs-bap17nKo3Uf9QS7d_kv7LuYRdQlYRnB88oZuWy4JYkdeLaZU0LHWWNP0JZgkTLPLkHsB1FKkklbPW6N0ggLfIFEaxof0BOE-M49FcdTKcYBjLGef5CI3_jAGc3p5IW0syMcA8sP8itOa_hBFAwUqw3G8vgY4z1EQjBpicTqD0tc0a2UyWm0pB2cy1iEJg-e9id4bs48bn5tG-CXeeysLBlVU4*1745762550492*ee4c89401563bc0dbac33f68ec79c2ebdde05631391d8cb77b3688ce3bbd05ad*1sk3EKR-sAtZFJ0onVAtxiKgb5V8aFFk5H1jGWzj9sI~2', // 硬编码的 Cookie！
        'origin': 'https://dream.ai',
        'priority': 'u=1, i', // 此标头可能被 fetch/Node 忽略
        'referer': 'https://dream.ai/create',
        'sec-ch-ua': '"Microsoft Edge";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin', // 从服务器发送，因此技术上不是同源，但模仿浏览器
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0',
        'x-app-version': 'WEB-2.0.0',
        // 'content-length' 将由 fetch 自动计算
    };

    console.log(`[Mediastore Proxy] 转发请求到 ${targetUrl}`);
    // console.log("[Mediastore Proxy] 正文:", requestBodyString); // 在生产环境中小心记录 Base64

    try {
        const apiResponse = await fetch(targetUrl, {
            method: 'POST',
            headers: headersToForward,
            body: requestBodyString // 将 JSON 字符串作为纯文本发送
        });

        // 获取响应数据（假设它是 JSON，但 content-type 可能会有所不同）
        // 让我们尝试解析为 JSON，但处理潜在的错误
        let responseData;
        const contentType = apiResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await apiResponse.json();
        } else {
             // 如果不是 JSON，则作为文本返回或进行适当处理
             responseData = await apiResponse.text();
             console.warn(`[Mediastore Proxy] 接收到非 JSON 响应 (Content-Type: ${contentType})。作为文本返回。`);
             // 如果你期望 JSON，即使 content-type 错误，也尝试解析：
             // try { responseData = JSON.parse(await apiResponse.text()); } catch { /* 忽略 */ }
        }


        console.log(`[Mediastore Proxy] 接收到响应状态: ${apiResponse.status}`);

        // 将状态代码和数据转发回前端
        // 确保发送到浏览器的响应具有正确的 content-type（如果是 JSON）
        if (typeof responseData === 'object') {
             res.setHeader('Content-Type', 'application/json');
             res.status(apiResponse.status).json(responseData);
        } else {
             // 如果我们得到文本，则将其作为文本发送
             res.setHeader('Content-Type', 'text/plain');
             res.status(apiResponse.status).send(responseData);
        }


    } catch (error) {
        console.error('[Mediastore Proxy] 转发请求时出错:', error);
        res.status(500).json({ error: '联系 mediastore API 时发生内部服务器错误', details: error.message });
    }
}
