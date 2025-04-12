//api/get-wombo-status.js
export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { taskId } = req.query;
  
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }
  
      try {
        const response = await fetch(`https://paint.api.wombo.ai/api/v2/tasks/${taskId}`);
        const data = await response.json();
  
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  
        res.status(200).json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } else if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.status(200).end();
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  