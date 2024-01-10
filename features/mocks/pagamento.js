const pagamentoAceitoInteraction = {
  request: {
    strict: false,
    method: 'POST',
    path: '/v1/pagamento/alguma-transacaoId/1',
  },
  response: {
    status: 200,
    body: 'true',
  },
};

const pagamentoRejeitadoInteraction = {
  request: {
    strict: false,
    method: 'POST',
    path: '/v1/pagamento/alguma-transacaoId/2',
  },
  response: {
    status: 200,
    body: 'true',
  },
};

module.exports = {
  pagamentoAceitoInteraction,
  pagamentoRejeitadoInteraction,
};
