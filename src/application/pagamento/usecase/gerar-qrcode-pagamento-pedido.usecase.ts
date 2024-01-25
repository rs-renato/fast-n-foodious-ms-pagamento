import { Injectable, Logger } from "@nestjs/common";
import { Pagamento } from "src/enterprise/pagamento/model/pagamento.model";
import * as qrCodeService from "qrcode"
@Injectable()
export class GerarQrCodePagamentoPedidoUseCase {

    private opts = {
        errorCorrectionLevel: 'H',
        type: 'image/jpeg',
        quality: 0.3,
        margin: 1
      }

    private logger = new Logger(GerarQrCodePagamentoPedidoUseCase.name);

    constructor() {}

    async gerarQrCode(pagamento: Pagamento): Promise<string> {
        this.logger.log(`Gerando QrCode para o pagamento de transacaoId: ${JSON.stringify(pagamento.transacaoId)}`)
        const qrCodeData = `id=${pagamento._id}&transacaoId=${pagamento.transacaoId}&total=${pagamento.total}`;
        return qrCodeService.toDataURL(qrCodeData, this.opts)
    }
}