// api/wombo.js
import { URL } from 'url'; // Import the URL constructor
const https = require('https');

export default async function handler(req, res) {
    // Allow requests from any origin (adjust in production!)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET'); // Add GET method
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Proxy image requests
    if (req.method === 'GET' && req.url.startsWith('/api/image-proxy')) {
        try {
            // Extract the image URL from the query parameters
            const imageUrl = req.url.split('url=')[1];
            if (!imageUrl) {
                return res.status(400).json({ error: 'Missing image URL' });
            }

            // Create a URL object from the imageUrl string
            const parsedImageUrl = new URL(imageUrl);

            // Ensure the image URL is from a trusted domain (security)
            if (parsedImageUrl.hostname !== 'images.wombo.art') {
                return res.status(400).json({ error: 'Untrusted image source' });
            }

            // Use https module to fetch the image (wombo uses https)
            https.get(imageUrl, (imageRes) => {
                // Set the content type based on the image response
                res.setHeader('Content-Type', imageRes.headers['content-type']);
                // Set cache headers to enable browser caching
                res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
                // Pipe the image data to the response
                imageRes.pipe(res);
            }).on('error', (error) => {
                console.error("Error fetching image:", error);
                return res.status(500).json({ error: 'Failed to fetch image' });
            });
            return;
        } catch (error) {
            console.error("Error processing image proxy request:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // wombo generate
    if (req.method === 'POST') {
        const authorizationToken = req.headers.authorization;
        if (!authorizationToken) {
            return res.status(401).json({ error: 'Authorization Token is required' });
        }

        const { prompt, aspect_ratio, style, display_freq } = req.body;

        if (!prompt || !aspect_ratio || !style || !display_freq) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const requestBody = {
            "is_premium": false,
            "input_spec": {
                "aspect_ratio": aspect_ratio,
                "prompt": prompt,
                "style": parseInt(style),
                "display_freq": parseInt(display_freq)
            }
        };

        const headers = {
            'authority': 'paint.api.wombo.ai',
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
            'authorization': authorizationToken,
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
            'x-validation-token': 'eyJraWQiOiJEX28wMGciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjE4MTY4MTU2OTM1OTp3ZWI6Mjc3MTMzYjU3ZmVjZjU3YWYwZjQzYSIsImF1ZCI6WyJwcm9qZWN0c1wvMTgxNjgxNTY5MzU5IiwicHJvamVjdHNcL3BhaW50LXByb2QiXSwicHJvdmlkZXIiOiJyZWNhcHRjaGFfZW50ZXJwcmlzZSIsImlzcyI6Imh0dHBzOlwvXC9maXJlYmFzZWFwcGNoZWNrLmdvb2dsZWFwaXMuY29tXC8xODE2ODE1NjkzNTkiLCJleHAiOjE3NDQ0ODQ1MzQsImlhdCI6MTc0NDQ2NjUzNCwianRpIjoidFR4a0RGaTVvMzZ4NzV4S2VjTkx2U2VDRlNrNEJJaHRFaXpyR0pZOEc3TSJ9.M5uSfXOEeeg6eKqVuX8enJYRZ-gQbeeWNFj6kBUTNxZTf9tzwvyR-Dpi2X6_0P8stQ8FEBRHcFMB27zcQ0xknYUT_qKAvVcOBc-NCKhb-X5KssIvDAP9wCgDAZkqf8JE0wkFy3pRC3bIVyRzm0IC90I6JK2o_VPzm9yJ8v05xP-tBIJs6GU6EjrEu-Z7zfFlPpqcwcbIkSTxP6usGILdMbsTactVw4AfjoPuqDUtQUYEkozeIgpYT4vdx_frD7uix4Vjpaw6rFJNOAkfQPqivsS8K66IRqzFDPhaeRuS4JUbJDaKmKYo2WbsHdWWCso72pYQsfRM0jBlIDiIuxo0Z7KXjyWuJhV0BVMlapk0Em_1JBRzlfCGC2w_MIpYXxaTKaQjpDDeJnaurwfg0IXSDpCiLSAk8MM-AM5c4sEHOvxsEt2L-qZENdqmDPQM6c3KbGh38BQlJehxGAS2zbs778mOYBlLw3IzKpcEzHyoMCLfeJH2w-riLGH4GgNB-5ob'
        };

        try {
            const response = await fetch('https://paint.api.wombo.ai/api/v2/tasks', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            res.status(response.status).json(data); // Forward the status code

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
