import { ConfigModule, ConfigType } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailDataRequired, default as SendGrid } from '@sendgrid/mail';

import { sendGridConfig } from '../../config/sendgrid.config';

import { SendGridClient } from './sendGrid.client';

describe('SendGridClient', () => {
  let sendGridClient: SendGridClient;
  let sendGridConf: ConfigType<typeof sendGridConfig>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [sendGridConfig],
        }),
      ],
      providers: [SendGridClient],
    }).compile();

    sendGridClient = module.get<SendGridClient>(SendGridClient);
  });

  it('should be defined', () => {
    expect(sendGridClient).toBeDefined();
  });

  describe('send', () => {
    it('should send an email', async () => {
      const mail: MailDataRequired = {
        to: 'test@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      const sendSpy = jest
        .spyOn(SendGrid, 'send')
        .mockResolvedValueOnce(undefined);

      await sendGridClient.send(mail);

      expect(sendSpy).toHaveBeenCalledWith(mail);
    });

    it('should throw an error if sending email fails', async () => {
      const mail: MailDataRequired = {
        to: 'test@example.com',
        from: 'sender@example.com',
        subject: 'Test Email',
        text: 'This is a test email',
      };

      const error = new Error('Failed to send email');
      const sendSpy = jest.spyOn(SendGrid, 'send').mockRejectedValueOnce(error);

      await expect(sendGridClient.send(mail)).rejects.toThrowError(error);

      expect(sendSpy).toHaveBeenCalledWith(mail);
    });
  });
});
