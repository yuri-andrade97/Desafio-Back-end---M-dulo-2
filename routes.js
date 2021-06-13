const express = require('express');
const { listarProdutos } = require('./controllers/index');

const router = express();

router.get('/produtos', listarProdutos)

module.exports = router;