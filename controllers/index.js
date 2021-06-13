const data = require('../data/data.json');

function listarProdutos(req, res) {
    const produtos = data.produtos;
    const precoInicial = Number(req.query.precoInicial * 100);
    const precoFinal = Number(req.query.precoFinal * 100);
    const categoria = req.query.categoria;

    //Filtrar produtos por categoria e por faixa de preço ao mesmo tempo.
    if (precoInicial && precoInicial && categoria) {
        const produtosFiltradosPorPrecoECategoria = produtos.filter(produto => {
            if(produto.categoria === categoria) {
                if(produto.preco >= precoInicial && produto.preco <= precoFinal) {
                    if(produto.estoque > 0) {
                        return produto;
                    }
                }
            }
        });
        return res.json(produtosFiltradosPorPrecoECategoria);
    }
  
    //Filtrar produtos por faixa de preço;
    if (precoInicial && precoInicial) {

        const produtosFiltradoPorPreco = produtos.filter(produto => {
    
            if(produto.preco >= precoInicial && produto.preco <= precoFinal) {
                if(produto.estoque > 0) {
                    return produto;
                }
            }
            
        });
        return res.json(produtosFiltradoPorPreco)
        
    }
     
    // Filtrar produtos por categoria;
    if (categoria) {
        
        const produtosFiltradoPorCategoria = produtos.filter(produto => {
            if (produto.categoria === categoria) {
                if(produto.estoque > 0) {
                    return produto; 
                }
            }
        });
        return res.json(produtosFiltradoPorCategoria);
    }


    // Listar todos os produtos e devolver no formato de array de produtos;
    res.json(produtos);
}

module.exports = {
    listarProdutos
}