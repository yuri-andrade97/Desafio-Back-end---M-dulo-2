const express = require('express');

const app = express();

const data = require('./data/data.json')



app.use(express.json());

app.get('/produtos', (req, res) => {
    res.json(data.produtos);
});

app.get('/produtos/:estoque', (req, res) => {
    const produtos = data.produtos;
    const temNoEstoque = [];

    for (const produto of produtos) {
        if(produto.estoque > 0) {
            temNoEstoque.push(produto);            
        }
    }
    res.json(temNoEstoque)
});

/* verificar essa rota depois /produto */
app.get('/produto', (req, res) => {
    const produtos = data.produtos;
    const categoria = req.query.categoria;

    const produtosNaCategoria = produtos.filter(produto => produto.categoria === categoria).filter(produto => produto.estoque > 0);

    res.json(produtosNaCategoria);
});

app.listen(8000);