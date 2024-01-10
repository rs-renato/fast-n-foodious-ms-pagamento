const novoItemPedido = {
  pedidoId: 1,
  produtoId: 1,
  quantidade: 1,
};

const novoItemPedidoInteraction = {
  request: {
    method: 'POST',
    path: '/v1/item',
    body: {
      pedidoId: 1,
      produtoId: 1,
      quantidade: 1,
    },
  },
  response: {
    status: 201,
    body: {
      id: 1,
      pedidoId: 1,
      produtoId: 1,
      quantidade: 1,
    },
  },
};

module.exports = {
  novoItemPedido,
  novoItemPedidoInteraction,
};
