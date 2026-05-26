import express from 'express';
import axios from 'axios';

const app = express();

app.get('/dk/test', async (req, res) => {
  try {
    const url = `${process.env.DK_API_URL}?$top=20`;

    console.log('Fetching from:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.DK_API_TOKEN}`
      }
    });

    // DKPlus getur verið annaðhvort raw array eða { value: [] }
    const items = response.data.value || response.data;

    res.json(items);

  } catch (err) {
    console.error('DK ERROR:', err.response?.data || err.message);

    res.status(500).json({
      error: 'dk fetch failed',
      details: err.response?.data || err.message
    });
  }
});

app.listen(3000, () => {
  console.log('Backend running');
});