const getCurrentDate = () => {
  const newDate = new Date();
  const year = newDate.getFullYear();
  const month = newDate.getMonth() + 1;
  const date = newDate.getDate();
  const currentDate = `${year}-${month}-${date}`;

  return currentDate;
};

const getEstadoDoPedido = (estado) => {
  const ESTADO_PEDIDO = {
    PAGAMENTO_PENDENTE: 0,
    RECEBIDO: 1,
    PRONTO: 3,
    FINALIZADO: 4,
  };

  return ESTADO_PEDIDO[estado];
};

module.exports = {
  getCurrentDate,
  getEstadoDoPedido,
};
