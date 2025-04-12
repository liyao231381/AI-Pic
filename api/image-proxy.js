// api/image-proxy.js
import { URL } from 'url'; // Import the URL constructor
const https = require('https');

export default async function handler(req, res) {
    // Allow requests from any origin (adjust in production!)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            // Extract the image URL from the query parameters
            const imageUrl = req.query.url;
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
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
