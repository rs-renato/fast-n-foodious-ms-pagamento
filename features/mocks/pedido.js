const { BASE_URL } = require('../config');
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
    path: `${BASE_URL.PEDIDO}`,
    body: {
      dataInicio: getCurrentDate(),
      clienteId: 1,
      estadoPedido: 0,
      ativo: true,
    },
  },
  response: {
    status: 200,
    body: {
      id: 1,
      dataInicio: getCurrentDate(),
      clienteId: 1,
      estadoPedido: 0,
      ativo: true,
    },
  },
};

const checkoutPedidoInteraction = {
  request: {
    method: 'POST',
    path: `${BASE_URL.PEDIDO}/checkout/{pedidoId}`,
    body: {
      dataInicio: getCurrentDate(),
      clienteId: 1,
      estadoPedido: 0,
      ativo: true,
    },
  },
  response: {
    status: 200,
    body: {
      id: 1,
      dataInicio: getCurrentDate(),
      clienteId: 1,
      estadoPedido: 0,
      ativo: true,
    },
  },
};

module.exports = {
  novoPedido,
  novoPedidoInteraction,
  checkoutPedidoInteraction,
};
