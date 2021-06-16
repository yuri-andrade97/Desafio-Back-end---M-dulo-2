const express = require('express');
const { 
    listarProdutos, adicionarProdutoNoCarinho, listarProdutosNoCarrinho, alterarCarrinho, deletarProduto, deletarTodosOsProdutosDoCarrinho, finalizarCompra 
} = require('./controllers/index');

const router = express();

router.get('/produtos', listarProdutos);

router.get('/carrinho', listarProdutosNoCarrinho);
router.post('/carrinho/produtos', adicionarProdutoNoCarinho);
router.patch('/carrinho/produtos/:idProduto', alterarCarrinho);
router.delete('/carrinho/produtos/:idProduto', deletarProduto);
router.delete('/carrinho', deletarTodosOsProdutosDoCarrinho);

router.post('/carrinho/finalizar-compra', finalizarCompra)

module.exports = router;