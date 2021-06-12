const express = require('express');

const app = express();

const data = require('./data/data.json')



app.use(express.json());

app.get('/produtos', (req, res) => {
    console.log(data.produtos.length)
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
    console.log(temNoEstoque.length)
    res.json(temNoEstoque)
});

app.listen(8000);