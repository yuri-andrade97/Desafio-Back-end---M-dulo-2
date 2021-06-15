const data = require('../data/data.json');
const { escreverNoArquivo, lerArquivo } = require('../bibliotecaFS');
const { addBusinessDays } = require('date-fns')



function listarProdutos(req, res) {
    const produtos = data.produtos;
    const precoInicial = Number(req.query.precoInicial * 100);
    const precoFinal = Number(req.query.precoFinal * 100);
    const categoria = req.query.categoria;

    //Filtrar produtos por categoria e por faixa de preço ao mesmo tempo.
    if (precoInicial && precoInicial && categoria) {
        const produtosFiltradosPorPrecoECategoria = produtos.filter(produto => {
            if (produto.categoria === categoria) {
                if (produto.preco >= precoInicial && produto.preco <= precoFinal) {
                    if (produto.estoque > 0) {
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

            if (produto.preco >= precoInicial && produto.preco <= precoFinal) {
                if (produto.estoque > 0) {
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
                if (produto.estoque > 0) {
                    return produto;
                }
            }
        });
        return res.json(produtosFiltradoPorCategoria);
    }


    // Listar todos os produtos e devolver no formato de array de produtos;
    res.json(produtos);
}

async function listarProdutosNoCarrinho(req, res) {
    let data = await lerArquivo()
    res.json(data)

    // depois tenho que verificar caso os dados estejam com array VAZIO
}

async function adicionarProdutoNoCarinho(req, res) {
    const produtos = data.produtos;
    const { id,quantidade } = req.body;


    const localizadorDeProdutos = produtos.find(produto => produto.id === id);
    
    
    if (quantidade <= localizadorDeProdutos.estoque) {
        let data = await lerArquivo()
        const { produtos: carrinho } = data; 

        const produtosAdicionados = adicionarProdutos(localizadorDeProdutos, carrinho, quantidade);

        const subTotal = calcularSubtotal(carrinho);
        const dataDeEntrega = addBusinessDays(new Date(), 15);
        const frete = calcularFrete(subTotal);
        const totalAPagar = calcularValorTotalAPagar(subTotal, frete);


        data = {
            "subtotal": subTotal,
            "dataDeEntrega": dataDeEntrega,
            "valorDoFrete": frete,
            "totalAPagar": totalAPagar,
            "produtos": produtosAdicionados
        }
        await escreverNoArquivo(data);
        
        res.json(data)
    }
}

async function alterarCarrinho(req, res) {
    let carrinho = await lerArquivo()
    const { idProduto } = req.params;
    const quantidade = req.body.quantidade;
    
    const localizadorDeProdutos = await carrinho.produtos.find(produto => produto.id === Number(idProduto));

    if (!localizadorDeProdutos) {
        res.json({erro: `Produto com id ${idProduto} não encontrado no carrinho!`})
    }

    if (quantidade < 0) {
        if (quantidade > carrinho.quantidade) {
            res.json({erro: 'a quantidade solicitada é maior doque a no estoque!'})
        } else {
            const indice = carrinho.produtos.findIndex(produto => produto.id === Number(idProduto));

            carrinho.produtos[indice].quantidade -= quantidade
            return carrinho
        }
    }
}

/*  FUNÇÕES AUXILIAR PARA A ROTA POST/CARRINHOS/PRODUTOS */
function adicionarProdutos(produto, carrinho, quantidade) {
    delete produto.estoque

    console.log(carrinho)
   
    const indice = carrinho.findIndex(item => item.id === produto.id);
   
    if (indice >= 0) {
        carrinho[indice].quantidade += quantidade;
    } else {
        produto.quantidade = quantidade;
        carrinho.push(produto);
    }

  
    return carrinho;
}


function calcularSubtotal(produtosCarrinho) {
    const total = produtosCarrinho
        .map(item => item.preco * item.quantidade)
        .reduce((acc, item) => acc + item);  
        
    return total;
}

function calcularFrete(valorDaCompra) {
    const total = valorDaCompra / 100;
    let frete = 0;

    if(total <= 200) {
        frete = 5000;
    } else {
        frete = 0;
    }
    return frete;
}

function calcularValorTotalAPagar(subtotal, frete) {
    const total = subtotal + frete;
    return total;
}
/*  FINAL DAS FUNÇÕES AUXILIAR PARA A ROTA POST/CARRINHOS/PRODUTOS */


module.exports = {
    listarProdutos,
    adicionarProdutoNoCarinho,
    listarProdutosNoCarrinho,
    alterarCarrinho
}