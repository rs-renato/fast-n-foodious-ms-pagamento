const { Given, When, Then } = require('@cucumber/cucumber');
const { spec, expect } = require('pactum');

const { BASE_URL } = require('../config');
const { novoProduto, novoPedido, novoItemPedido } = require('../mocks');
const { getCurrentDate, getEstadoDoPedido } = require('./utils');
const { startMockServer, stopMockServer } = require('../mocks/server');

let globalProdutoId;

Given('Nos temos um pedido com itens adicionados', async function () {
  startMockServer();

  if (globalProdutoId === undefined) {
    // Novo Produto
    const produtoResponse = await spec().post(BASE_URL.PRODUTO).withBody(novoProduto);
    globalProdutoId = produtoResponse.body.id;
  }

  // Novo Pedido
  const pedidoResponse = await spec().post(BASE_URL.PEDIDO).withBody(novoPedido);
  this.pedidoId = pedidoResponse.body.id;

  // Novo Item ao Pedido
  this.response = await spec().post(BASE_URL.ITEM).withBody(novoItemPedido);
  expect(this.response).should.have.status(201);
  stopMockServer();
});

// When('Efetuamos o checkout desse pedido', async function () {
//   this.response = await spec().post(`${BASE_URL.PEDIDO}/checkout/{pedidoId}`).withPathParams({
//     pedidoId: this.pedidoId,
//   });

//   this.transacaoId = this.response.body.pagamento.transacaoId;

//   expect(this.response).should.have.bodyContains('pagamento');
// });

// When('Efetuamos o pagamento desse pedido', async function () {
//   const PAGAMENTO_URL = `${BASE_URL.PAGAMENTO}/{transacaoId}/{estadoPagamento}`;
//   this.response = await spec().post(PAGAMENTO_URL).withPathParams({
//     transacaoId: this.transacaoId,
//     estadoPagamento: 1,
//   });

//   expect(this.response).to.have.bodyContains(true);
// });

// When('Efetuamos o pagamento desse pedido que sera rejeitado', async function () {
//   const PAGAMENTO_URL = `${BASE_URL.PAGAMENTO}/{transacaoId}/{estadoPagamento}`;
//   this.response = await spec().post(PAGAMENTO_URL).withPathParams({
//     transacaoId: this.transacaoId,
//     estadoPagamento: 2,
//   });
//   expect(this.response).to.have.bodyContains(true);
// });

// Then('O estado do pedido deve ser {string}', async function (estadoPedido) {
//   const estado = getEstadoDoPedido(estadoPedido);

//   this.response = await spec().get(`${BASE_URL.PEDIDO}/{pedidoId}/estado`).withPathParams({
//     pedidoId: this.pedidoId,
//   });

//   expect(this.response).should.have.body({ estadoPedido: estado });
// });
