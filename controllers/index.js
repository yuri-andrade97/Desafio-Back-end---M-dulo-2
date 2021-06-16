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
    return res.json(data)

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
        
        return res.json(data)
    }
    return res.status(400).json({erro: 'Quantidade maior do que possui no estoque'})
}

async function alterarCarrinho(req, res) {
    let carrinho = await lerArquivo()
    
    const { idProduto } = req.params;
    const quantidade = req.body.quantidade;
    const { produtos } = require('../data/data.json');
    
    // verificando se tem o produto no carrinho (comparação feita através do ID)
    const localizadorDeProdutos = await carrinho.produtos.find(produto => produto.id === Number(idProduto));

    if (!localizadorDeProdutos) {
        return res.json({erro: `Produto com id ${idProduto} não encontrado no carrinho!`})
    }

    const produtoEstoque = produtos.find(produto => produto.id === Number(idProduto));
         
    const indice = carrinho.produtos.findIndex(produto => produto.id === Number(idProduto));


    if ( (quantidade + carrinho.produtos.quantidade) > produtos.estoque ) {
        return res.json({erro: 'Quantidade maior, doque possue no estoque'})   
    }
    carrinho.produtos[indice].quantidade += quantidade;
        
    if (carrinho.produtos[indice].quantidade <= 0) {
        return res.json({erro: "Indice invalido"})
    }
    if (carrinho.produtos[indice].quantidade > produtoEstoque.estoque) {
        return res.json({erro: 'a quantidade solicitada é maior doque a no estoque!'});
    } 
    carrinho.subtotal = calcularSubtotal(carrinho.produtos)
    await escreverNoArquivo(carrinho);

    res.json(carrinho)
}

async function deletarProduto(req, res) {
    let carrinho = await lerArquivo()
    const id = req.params.idProduto;

    const indice = carrinho.produtos.findIndex(produto => produto.id === Number(id));

    if (indice === -1) {
        return res.json({erro: `Id ${id} não encontrado no carrinho!`});
    }
    carrinho.produtos.splice(indice, 1)
    await escreverNoArquivo(carrinho)

    res.json(carrinho)
    // aqui ainda precisa após retirar o  produto, limpar o subtotal e etc...
}

async function deletarTodosOsProdutosDoCarrinho(req, res) {
    let carrinho = await lerArquivo();

    carrinho = {produtos:[]}
    await escreverNoArquivo(carrinho)
    res.json(carrinho)
}

async function finalizarCompra(req, res) {
    let carrinho = await lerArquivo()
    const data = require('../data/data.json');


    if (carrinho.produtos.length === 0) {
        return res.json({erro: 'Não foi possível finalizar a compra, pois o carrinho está VAZIO!'})
    }

    for (const item of carrinho.produtos) {
        const localizarProdutoNoBanco = data.produtos.find(produto => produto.id === item.id);
        if (item.quantidade > localizarProdutoNoBanco.estoque) {
           return res.json('erro!')
        }
    }

    const erro = validardorDeDados(req.body)
    
    if(erro.length > 0) {
        res.status(400).json(erro)
    }

    res.json(carrinho)
    carrinho = {produtos:[]}
    await escreverNoArquivo(carrinho)

    return

}

function validardorDeDados(dados) {
    const { type, country, name, documents } = dados.customer;
    const erro = [];
    let msgErro = "";

    if (country.length !== 2 ) {
        msgErro = 'O campo country deve possuir somente 2 dígitos.Exemplo, se você mora no Brasil, br';
        erro.push(msgErro);
    }

    if (type !== 'individual') {
        msgErro = 'Este e-commerce só atende pessoas físicas, o type precisa ser INDIVIDUAL';
        erro.push(msgErro)
    }

    const nameFormatado = name.split('').find(item => item === " ");
    
    if (!nameFormatado) {
        msgErro = 'O campo name, deve possuir o nome e o sobrenome'
        erro.push(msgErro);
    }
    
    if (documents[0].type !== 'cpf') {
        msgErro = 'O campo type, deve possuir ser sempre o CPF'
        erro.push(msgErro);
    }

    if (documents[0].number.length !== 11) {
        msgErro = 'O campo CPF, deve possuir 11 dígitos!'
        erro.push(msgErro);
    }

    return erro;
}

/*  FUNÇÕES AUXILIAR PARA A ROTA POST/CARRINHOS/PRODUTOS */
function adicionarProdutos(produto, carrinho, quantidade) {
    delete produto.estoque
   
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
    alterarCarrinho,
    deletarProduto,
    deletarTodosOsProdutosDoCarrinho,
    finalizarCompra
}