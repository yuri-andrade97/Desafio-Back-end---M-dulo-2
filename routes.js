const express = require('express');
const { listarProdutos, adicionarProdutoNoCarinho, listarProdutosNoCarrinho, alterarCarrinho } = require('./controllers/index');

const router = express();

router.get('/produtos', listarProdutos);

router.get('/carrinho', listarProdutosNoCarrinho)
router.post('/carrinho/produtos', adicionarProdutoNoCarinho);
router.patch('/carrinho/produtos/:idProduto', alterarCarrinho)

module.exports = router;