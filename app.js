const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/en', require('./routes/en'));
app.use('/es', require('./routes/es'));

app.get('/', (req, res) => {
  res.render('language'); // later
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

