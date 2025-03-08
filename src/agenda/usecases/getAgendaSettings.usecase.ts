import { Injectable, Logger } from '@nestjs/common';
import { GetAgendaSettingsResDto } from '../infrastructure/dtos/getAgendaSettingsRes.dto';
import { AgendaProvider } from '../infrastructure/providers/agenda.provider';

@Injectable()
export class GetAgendaSettingsUseCase {
  private readonly logger = new Logger(GetAgendaSettingsUseCase.name);

  private readonly DEFAULT_SETTINGS = {
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    workingDays: ['1', '2', '3', '4', '5'],
    public: false,
    open: true,
  };

  constructor(
    private readonly agendaProvider: AgendaProvider,
  ) { }

  async execute(agendaId: number): Promise<GetAgendaSettingsResDto> {
    try {
      const agenda = await this.agendaProvider.findOne({
        where: { id: agendaId },
      });

      if (!agenda) {
        this.logger.log(`No agenda found for ID ${agendaId}, returning default settings`);
        return { ...this.DEFAULT_SETTINGS };
      }

      return {
        workingHoursStart: this.validateTimeString(agenda.workingHoursStart)
          ? agenda.workingHoursStart
          : this.DEFAULT_SETTINGS.workingHoursStart,

        workingHoursEnd: this.validateTimeString(agenda.workingHoursEnd)
          ? agenda.workingHoursEnd
          : this.DEFAULT_SETTINGS.workingHoursEnd,

        workingDays: Array.isArray(agenda.workingDays) && agenda.workingDays.length > 0
          ? agenda.workingDays
          : this.DEFAULT_SETTINGS.workingDays,

        public: typeof agenda.public === 'boolean'
          ? agenda.public
          : this.DEFAULT_SETTINGS.public,

        open: typeof agenda.open === 'boolean'
          ? agenda.open
          : this.DEFAULT_SETTINGS.open,
      };
    } catch (error) {
      this.logger.error(`Error retrieving agenda settings: ${(error as Error).message}`, (error as Error).stack);
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  private validateTimeString(time: string | null | undefined): boolean {
    if (!time) return false;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;
    return timeRegex.test(time);
  }
}