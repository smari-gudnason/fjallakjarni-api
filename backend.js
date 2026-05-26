const express = require('express');
const axios = require('axios');

const app = express();

app.get('/dk/test', async (req, res) => {
  try {
    const url = `${process.env.DK_API_URL}?$top=20`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.DK_API_TOKEN}`
      }
    });

    const items = response.data.value || response.data;

    res.json(items);

  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: 'dk fetch failed',
      details: err.response?.data || err.message
    });
  }
});

app.listen(3000, () => {
  console.log('Backend running');
});
