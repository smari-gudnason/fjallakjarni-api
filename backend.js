const express = require('express');
const axios = require('axios');

const app = express();

// --- CACHE ---
let cache = null;
let hasFetched = false;

// --- MAPPING ---
const mapItem = (item) => ({
  sku: item.ItemCode?.toLowerCase(),
  parentSku: item.AliasItemCode?.toLowerCase() || null,

  name: item.Description,
  description: item.Description2 || null,

  price: item.UnitPrice1WithTax,

  totalQuantity: item.TotalQuantityInWarehouse,

  warehouses: (item.Warehouses || []).map(w => ({
    code: w.Warehouse,
    quantity: w.QuantityInStock
  })),

  isActive: !item.Inactive,

  barcode: item.Barcodes?.[0]?.Barcode || null,

  brand: item.Publication?.Author || null,
  color: item.Publication?.ISBN || null,
  size: item.Publication?.Publisher || null
});

// --- GROUPING ---
const groupProducts = (items) => {
  const map = {};

  for (const item of items) {
    const key = item.parentSku || item.sku;

    if (!map[key]) {
      map[key] = {
        sku: key,
        brand: item.brand,
        name: item.parentSku ? null : item.name,
        variants: []
      };
    }

    map[key].variants.push(item);
  }

  return Object.values(map);
};

// --- ROUTE ---
app.get('/dk/test', async (req, res) => {
  try {
    if (!hasFetched) {
      console.log('Fetching from DK ONCE...');

      const url = `${process.env.DK_API_URL}?$top=50`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.DK_API_TOKEN}`
        }
      });

      const rawItems = response.data.value || response.data;

      // ✅ filter á group
      const allowedGroups = ['197', '401', '152'];

      const filtered = rawItems.filter(item =>
        item.Group && allowedGroups.includes(item.Group.toString())
      );

      // ✅ map
      const mapped = filtered.map(mapItem);

      // ✅ group
      cache = groupProducts(mapped);

      hasFetched = true;

      console.log(`Products ready: ${cache.length}`);
    } else {
      console.log('Returning cached products');
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

// --- START ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Backend running on port', PORT);
});