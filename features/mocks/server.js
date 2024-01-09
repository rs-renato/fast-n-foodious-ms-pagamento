const { mock } = require('pactum');

const { novoProdutoInteraction } = require('./produto');
const { novoPedidoInteraction } = require('./pedido');
const { novoItemPedidoInteraction } = require('./item-pedido');

async function startMockServer() {
  const mockOpts = { port: 3000, host: '127.0.0.1' };
  await mock.setDefaults(mockOpts);

  mock.addInteraction(novoProdutoInteraction);
  mock.addInteraction(novoPedidoInteraction);
  mock.addInteraction(novoItemPedidoInteraction);

  mock.start();
}

async function stopMockServer() {
  await mock.stop();
}

module.exports = {
  startMockServer,
  stopMockServer,
};
