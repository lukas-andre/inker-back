import * as fs from 'fs';
import * as util from 'util';

import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

import { BaseComponent } from '../../../../global/domain/components/base.component';
import { EmailType } from '../schemas/email';

import { TemplateRegistry } from './template.registry';

export class EmailTemplateNotFound extends Error {}

export class TemaplateEmailCompilerCrash extends Error {}

@Injectable()
export class TemplateService extends BaseComponent {
  constructor() {
    super(TemplateService.name);
  }

  private readonly readFile = util.promisify(fs.readFile);

  private async loadTemplate(templatePath: string): Promise<string> {
    try {
      return await this.readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(String(error));
    }
  }

  private compileTemplate(templateString: string, context: any): string {
    const template = Handlebars.compile(templateString);
    return template(context);
  }

  async getContentAndSubject(
    data: EmailType,
  ): Promise<{ content: string; subject: string }> {
    const template = TemplateRegistry[data.mailId];

    try {
      template.schema.parse(data);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }

    if (!template) {
      throw new EmailTemplateNotFound();
    }

    try {
      const templateString = await this.loadTemplate(template.path);
      return {
        content: this.compileTemplate(templateString, data),
        subject: template.subject,
      };
    } catch (error) {
      this.logger.error(error);
      throw new TemaplateEmailCompilerCrash();
    }
  }
}
