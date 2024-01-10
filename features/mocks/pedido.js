const { getCurrentDate } = require('../step_definitions/utils');

const novoPedido = {
  dataInicio: getCurrentDate(),
  clienteId: 1,
  estadoPedido: 0,
  ativo: true,
};

const novoPedidoInteraction = {
  request: {
    method: 'POST',
    path: '/v1/pedido',
    body: novoPedido,
  },
  response: {
    status: 200,
    body: {
      ...novoPedido,
      id: 1,
    },
  },
};

const checkoutPedidoInteraction = {
  request: {
    strict: false,
    method: 'POST',
    path: '/v1/pedido/checkout/1',
  },
  response: {
    status: 200,
    body: {
      pagamento: {
        transacaoId: 'alguma-transacaoId',
      },
    },
  },
};

const getEstadoDoPedidoInteraction = {
  request: {
    method: 'GET',
    path: '/v1/pedido/1/estado',
  },
  response: {
    status: 200,
    body: {
      estadoPedido: 1,
    },
  },
};

const getEstadoDoPedidoRejeitadoInteraction = {
  request: {
    method: 'GET',
    path: '/v1/pedido/2/estado',
  },
  response: {
    status: 200,
    body: {
      estadoPedido: 0,
    },
  },
};

module.exports = {
  novoPedido,
  novoPedidoInteraction,
  checkoutPedidoInteraction,
  getEstadoDoPedidoInteraction,
  getEstadoDoPedidoRejeitadoInteraction,
};
