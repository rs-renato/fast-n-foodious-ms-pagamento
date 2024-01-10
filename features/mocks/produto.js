const novoProduto = {
  nome: 'X Burguer Chicken',
  idCategoriaProduto: 1,
  descricao: 'X Burguer Chicken',
  preco: 10,
  imagemBase64: '',
  ativo: true,
};

const novoProdutoInteraction = {
  request: {
    method: 'POST',
    path: '/v1/produto',
    body: novoProduto,
  },
  response: {
    status: 200,
    body: {
      id: 1,
      nome: 'X Burguer Chicken',
      idCategoriaProduto: 1,
      descricao: 'X Burguer Chicken',
      preco: 10,
      imagemBase64: '',
      ativo: true,
    },
  },
};

module.exports = {
  novoProduto,
  novoProdutoInteraction,
};
