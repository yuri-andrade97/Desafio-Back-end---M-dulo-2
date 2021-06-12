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
    const { categoria } = req.query;

    const produtosNaCategoria = produtos.filter(produto => produto.categoria === categoria).filter(produto => produto.estoque > 0);

    res.json(produtosNaCategoria);
});

app.get('/produtoss', (req, res) => {
    const produtos = data.produtos;

    const precoInicial = Number(req.query.precoInicial * 100);
    const precoFinal = Number(req.query.precoFinal * 100);
    
    
    const produtosFiltrados = produtos.filter(produto => {
        const produtoComValorConvertido = produto.preco;
        console.log(produtoComValorConvertido)
        if(produto.estoque > 0) {
            if(produtoComValorConvertido >= precoInicial && produtoComValorConvertido <= precoFinal) {
                return produto;
            }
        }
        
    });
    
    
    res.json(produtosFiltrados)
   

   
});

app.listen(8000);