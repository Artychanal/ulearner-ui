import { Controller, Get, Param, Res } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificateResponseDto } from './dto/certificate-response.dto';
import { Response } from 'express';

@Controller({ path: 'certificates', version: '1' })
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get(':certificateNumber')
  async verify(@Param('certificateNumber') certificateNumber: string) {
    const certificate = await this.certificatesService.verify(certificateNumber);
    return CertificateResponseDto.fromEntity(certificate);
  }

  @Get(':certificateNumber/pdf')
  async downloadPdf(@Param('certificateNumber') certificateNumber: string, @Res() res: Response) {
    const certificate = await this.certificatesService.verify(certificateNumber);
    const pdf = await this.certificatesService.generatePdf(certificate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=certificate-${certificate.certificateNumber}.pdf`,
    );
    res.setHeader('Content-Length', pdf.length.toString());
    res.send(pdf);
  }
}
