import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter } from 'nodemailer';

type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter?: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail = configService.get<string>('mail.fromEmail') ?? 'no-reply@ulearner.dev';
    this.fromName = configService.get<string>('mail.fromName') ?? 'ULearner';
    const host = configService.get<string>('mail.smtpHost');
    const port = configService.get<number>('mail.smtpPort');
    const user = configService.get<string>('mail.smtpUser');
    const pass = configService.get<string>('mail.smtpPassword');
    const secure = configService.get<boolean>('mail.smtpSecure');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: Boolean(secure),
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.logger.warn('SMTP credentials are not fully configured. Emails will be logged to console.');
    }
  }

  async sendMail(options: SendMailOptions) {
    if (!this.transporter) {
      this.logger.log(`[DEV EMAIL] To: ${options.to}\nSubject: ${options.subject}\n${options.text ?? options.html}`);
      return;
    }

    await this.transporter.sendMail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      from: `${this.fromName} <${this.fromEmail}>`,
    });
  }
}
