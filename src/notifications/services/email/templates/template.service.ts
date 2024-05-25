import * as fs from 'fs';
import path from 'path';
import * as util from 'util';

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import moment from 'moment';
import { ZodError } from 'zod';

import 'moment/locale/es';

import { BaseComponent } from '../../../../global/domain/components/base.component';
import { EmailType } from '../schemas/email';

import { TemplateRegistry } from './template.registry';

export class EmailTemplateNotFound extends Error {}

export class TemplateEmailCompilerCrash extends Error {}

@Injectable()
export class TemplateService extends BaseComponent implements OnModuleInit {
  constructor() {
    super(TemplateService.name);
    moment.locale('es');
  }

  async onModuleInit(): Promise<void> {
    this.registerHelpers();
    await this.registerPartials(__dirname + '/partials');
  }

  private registerHelpers(): void {
    Handlebars.registerHelper('formatDate', (date, format) => {
      return moment(date).format(format);
    });

    Handlebars.registerHelper('formatDateCustom', date => {
      return moment(date).format('dddd D [de] MMMM [del] YYYY [a las] HH:mm');
    });
  }

  private async registerPartials(dir: string): Promise<void> {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const template = await this.readFile(path.join(dir, file), 'utf-8');
          const partialName = path.basename(file, '.hbs');
          Handlebars.registerPartial(partialName, template);
        }
      }
    } catch (error) {
      this.logger.error('Error registering partials: ', error);
      throw new Error(`Failed to register partials: ${error}`);
    }
  }

  private readonly readFile = util.promisify(fs.readFile);

  private async loadTemplateFromPath(templatePath: string): Promise<string> {
    try {
      return await this.readFile(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(String(error));
    }
  }

  private compileTemplateString(templateString: string, context: any): string {
    const template = Handlebars.compile(templateString);
    return template(context);
  }

  /**
   * Retrieves the email content and subject from the template.
   * @param templateData The email data transfer object.
   * @throws EmailTemplateNotFound if the template is not found.
   * @throws TemplateEmailCompilerCrash if the template could not be compiled.
   * @throws ZodError if the template data is invalid.
   */
  async getContentAndSubject(
    templateData: EmailType,
  ): Promise<{ html: string; subject: string }> {
    const template = TemplateRegistry[templateData.mailId];

    try {
      template.schema.parse(templateData);
    } catch (error: any | ZodError) {
      this.logger.error(error);
      throw error;
    }

    if (!template) {
      throw new EmailTemplateNotFound();
    }

    const { path } = template;
    let subject = template.subject.replace(
      /:customerName/g,
      (templateData as any).customerName ?? '',
    );
    subject = subject.replace(
      /:artistName/g,
      (templateData as any).artistName ?? '',
    );

    try {
      const templateString = await this.loadTemplateFromPath(path);
      const html = this.compileTemplateString(templateString, templateData);
      return { html, subject };
    } catch (error) {
      this.logger.error(error);
      throw new TemplateEmailCompilerCrash();
    }
  }
}
