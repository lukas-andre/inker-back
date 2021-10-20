import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { SNS } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

@Injectable()
export class SMSClient {
  private client: AWS.SNS;

  constructor(private readonly configService: ConfigService) {}

  getClient(): AWS.SNS {
    if (!this.client) {
      this.client = new AWS.SNS({
        accessKeyId: this.configService.get('aws.smsAccessKey'),
        secretAccessKey: this.configService.get('aws.smsSecretKey'),
        region: this.configService.get('aws.region'),
      });
    }
    const setSMSAttributesInput: SNS.Types.SetSMSAttributesInput = {
      attributes: {
        DefaultSMSType: 'Transactional',
        DefaultSenderID: 'Inker',
        MonthlySpendLimit: '1', // * The maximum amount in USD that you are willing to spend each month to send SMS messages.
      },
    };
    this.client.setSMSAttributes(setSMSAttributesInput);

    return this.client;
  }

  async sendSMS(
    PhoneNumber: string /* E.164_PHONE_NUMBER */,
    Message: string /* required */,
  ): Promise<PromiseResult<AWS.SNS.PublishResponse, AWS.AWSError>> {
    const params: AWS.SNS.PublishInput = {
      Message,
      PhoneNumber,
    };
    console.log({ params });
    return this.getClient().publish(params).promise();
  }
}
