import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UpdateOpenQuotationReqDto } from '../infrastructure/dtos/updateOpenQuotationReq.dto';
import { QuotationRepository } from '../infrastructure/repositories/quotation.provider';

@Injectable()
export class UpdateOpenQuotationUseCase {
  constructor(private readonly quotationRepository: QuotationRepository) {}

  async execute(
    quotationId: string,
    customerId: string,
    dto: UpdateOpenQuotationReqDto
  ): Promise<void> {
    // Buscar la cotización
    const quotation = await this.quotationRepository.findOne({ where: { id: quotationId } });
    if (!quotation) {
      throw new NotFoundException('Cotización no encontrada');
    }
    // Verificar que sea del customer
    if (quotation.customerId !== customerId) {
      throw new UnauthorizedException('No puedes editar esta cotización');
    }
    // Verificar que esté abierta
    if (quotation.type !== 'OPEN') {
      throw new BadRequestException('Solo puedes editar cotizaciones abiertas');
    }
    // Construir objeto de actualización solo con campos presentes
    const updateData: any = {};
    if (dto.minBudget) updateData.minBudget = dto.minBudget;
    if (dto.maxBudget) updateData.maxBudget = dto.maxBudget;
    if (dto.referenceBudget) updateData.referenceBudget = dto.referenceBudget;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.generatedImageId !== undefined) updateData.generatedImageId = dto.generatedImageId;
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No hay campos para actualizar');
    }
    await this.quotationRepository.updateSimple(quotationId, updateData);
  }
} 