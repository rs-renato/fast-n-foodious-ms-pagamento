const { mock } = require('pactum');

const { novoProdutoInteraction } = require('./produto');
const {
  novoPedidoInteraction,
  checkoutPedidoInteraction,
  getEstadoDoPedidoInteraction,
  getEstadoDoPedidoRejeitadoInteraction,
} = require('./pedido');
const { novoItemPedidoInteraction } = require('./item-pedido');
const { pagamentoAceitoInteraction, pagamentoRejeitadoInteraction } = require('./pagamento');

async function startMockServer() {
  const mockOpts = { port: 3000, host: '127.0.0.1' };
  await mock.setDefaults(mockOpts);

  // Produto
  mock.addInteraction(novoProdutoInteraction);

  // Pedido
  mock.addInteraction(novoPedidoInteraction);
  mock.addInteraction(novoItemPedidoInteraction);
  mock.addInteraction(checkoutPedidoInteraction);
  mock.addInteraction(getEstadoDoPedidoInteraction);
  mock.addInteraction(getEstadoDoPedidoRejeitadoInteraction);

  // Pagamento
  mock.addInteraction(pagamentoAceitoInteraction);
  mock.addInteraction(pagamentoRejeitadoInteraction);

  await mock.start();
}

async function stopMockServer() {
  await mock.stop();
}

module.exports = {
  startMockServer,
  stopMockServer,
};
