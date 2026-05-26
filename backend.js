const express = require('express');

const app = express();

// route
app.get('/', (req, res) => {
  res.send('FjallaKjarni running 🚀');
});

// MJÖG mikilvægt
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
