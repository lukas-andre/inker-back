import { PartialType } from '@nestjs/swagger';
import { AddEventReqDto } from './addEventReq.dto';

export class UpdateEventReqDto extends PartialType(AddEventReqDto) {}
