import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { UserType } from '../../../users/domain/enums/userType.enum';
import {
  JwtPayload,
  JwtPermission,
} from '../../domain/interfaces/jwtPayload.interface';
import { InkerClsStore } from '../guards/auth.guard';

@Injectable()
export class RequestContextService {
  constructor(private readonly cls: ClsService<InkerClsStore>) {}

  get isArtist(): boolean {
    return this.cls.get('jwt').userType === UserType.ARTIST;
  }

  get isNotArtist(): boolean {
    return this.cls.get('jwt').userType !== UserType.ARTIST;
  }

  get isCustomer(): boolean {
    return this.cls.get('jwt').userType === UserType.CUSTOMER;
  }

  get isNotCustomer(): boolean {
    return this.cls.get('jwt').userType !== UserType.CUSTOMER;
  }

  get userId(): string {
    return this.cls.get('jwt').id;
  }

  get userType(): UserType {
    return this.cls.get('jwt').userType;
  }

  get userTypeId(): string {
    return this.cls.get('jwt').userTypeId;
  }

  get jwtPayload(): JwtPayload {
    return this.cls.get('jwt');
  }

  get permission(): JwtPermission[] {
    return this.cls.get('jwt').permission;
  }
}
