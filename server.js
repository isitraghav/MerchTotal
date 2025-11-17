const express = require('express');
const app = express();
const port = 3000;
const dbo = require('./db/conn');
const productsRouter = require('./router/products');
const usersRouter = require('./router/users');
const cartRouter = require('./router/cart');

app.use(express.static('public'));
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/cart', cartRouter);

app.listen(port, () => {
  dbo.connectToServer();
  console.log(`Server is running on port ${port}`);
});
