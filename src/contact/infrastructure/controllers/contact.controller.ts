import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ProcessContactMessageUseCase } from '../../usecases/processContactMessage.usecase';
import { ContactRequestDto } from '../dtos/contactRequest.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(
    private readonly processContactMessageUseCase: ProcessContactMessageUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Send contact message',
    description: 'Sends a contact message (suggestion, bug report, inquiry, etc.) to the Inker team',
  })
  @ApiBody({ type: ContactRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contact message sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to process contact message',
  })
  async sendContactMessage(
    @Body() dto: ContactRequestDto,
  ): Promise<{ message: string }> {
    await this.processContactMessageUseCase.processContactMessage(dto);

    return {
      message: 'Tu mensaje ha sido enviado exitosamente. ¡Gracias por contactarnos!',
    };
  }
}