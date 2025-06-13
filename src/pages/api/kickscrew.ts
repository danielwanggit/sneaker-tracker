import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query' });
  }

  const response = await fetch(
    `https://kickscrew-sneakers-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}`,
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!, // Store your key in .env.local
        'X-RapidAPI-Host': 'kickscrew-sneakers-data.p.rapidapi.com',
      },
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
} 