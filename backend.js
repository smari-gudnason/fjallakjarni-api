const express = require('express');
const axios = require('axios');

const app = express();

// --- ONE TIME FETCH ---
let cache = null;
let hasFetched = false;

app.get('/dk/test', async (req, res) => {
  try {
    // 👉 aðeins EINU sinni kallað á DK
    if (!hasFetched) {
      console.log('Fetching from DK ONCE...');

      const url = `${process.env.DK_API_URL}?$top=50`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.DK_API_TOKEN}`
        }
      });

      const items = response.data.value || response.data;

      // ✅ filter á vöruflokka
      const allowedGroups = ['197', '401', '152'];

      cache = items.filter(item =>
        item.Group && allowedGroups.includes(item.Group.toString())
      );

      hasFetched = true;

      console.log(`Fetched ${cache.length} items after filtering`);
    } else {
      console.log('Returning cached data (no DK call)');
    }

    res.json(cache);

  } catch (err) {
    console.error('DK ERROR:', err.response?.data || err.message);

    res.status(500).json({
      error: 'dk fetch failed',
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
});
``