import { Test, TestingModule } from '@nestjs/testing';
import { Pagamento } from 'src/enterprise/pagamento/model/pagamento.model';
import * as qrCodeService from 'qrcode';
import { GerarQrCodePagamentoPedidoUseCase } from 'src/application/pagamento/usecase/gerar-qrcode-pagamento-pedido.usecase';
import { EstadoPagamento } from 'src/enterprise/pagamento/enum/estado-pagamento.enum';

describe('GerarQrCodePagamentoPedidoUseCase', () => {
  let gerarQrCodeUseCase: GerarQrCodePagamentoPedidoUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GerarQrCodePagamentoPedidoUseCase],
    }).compile();

    gerarQrCodeUseCase = module.get<GerarQrCodePagamentoPedidoUseCase>(GerarQrCodePagamentoPedidoUseCase);
  });

  describe('gerarQrCode', () => {
    it('should generate a QR code data URL for the given payment', async () => {
      const pagamento: Pagamento = {
        dataHoraPagamento: new Date(),
        estadoPagamento: EstadoPagamento.PENDENTE,
        pedidoId: 1,
        total: 10,
        transacaoId: '123456-abcdef',
        id: 1,
      };
      const expectedQrCodeDataUrl = 'data:image/jpeg;base64,QrCodeDataUrl';
      jest.spyOn(qrCodeService, 'toDataURL').mockResolvedValueOnce(expectedQrCodeDataUrl);

      const qrCodeUrl = await gerarQrCodeUseCase.gerarQrCode(pagamento);

      expect(qrCodeUrl).toEqual(expectedQrCodeDataUrl);
    });
  });
});
