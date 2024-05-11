import * as fs from 'fs';
import * as util from 'util';

import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';

import {
  AgendaEventCreatedDto,
  BaseEmailDto,
  RsvpAcceptedDto,
} from './email.dto';

@Injectable()
export class TemplateService {
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

  async getContent(dto: BaseEmailDto): Promise<string> {
    if (dto instanceof AgendaEventCreatedDto) {
      const template = await this.loadTemplate(
        'templates/agendaEventCreated.hbs',
      );
      return this.compileTemplate(template, {
        eventName: dto.eventName,
        eventDate: dto.eventDate.toDateString(),
      });
    } else if (dto instanceof RsvpAcceptedDto) {
      const template = await this.loadTemplate('templates/rsvpAccepted.hbs');
      return this.compileTemplate(template, {
        eventDate: dto.eventDate.toDateString(),
        hostName: dto.hostName,
      });
    }
    throw new Error('Unsupported notification type');
  }
}
