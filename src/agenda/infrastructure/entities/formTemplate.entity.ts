import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ConsentType } from '../../domain/enum/consentType.enum';

// Placeholder for FormSchema, will be defined more concretely later
export interface FormSchemaField {
  type: string; // e.g., 'checkbox', 'signature', 'text', 'date'
  label: string;
  required: boolean;
  options?: string[] | Record<string, any>[]; // For checkboxes, radio buttons, dropdowns
  placeholder?: string;
  defaultValue?: any;
  validation?: Record<string, any>; // e.g., { minLength: 5, pattern: '^[A-Za-z]+$' }
}

export interface FormSchemaLogicCondition {
  field: string;
  condition: string; // e.g., '>=18', 'EQUALS_OPTION_A'
  value?: any; // Value to compare against, if not implicit in condition
}

export interface FormSchemaLogic {
  showIf?: FormSchemaLogicCondition;
  // Potentially other logic types: hideIf, requireIf, etc.
}

export interface FormSchema {
  title: string;
  description?: string;
  fields: FormSchemaField[];
  logic?: FormSchemaLogic;
}

@Entity('form_templates')
export class FormTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column('jsonb')
  content: Record<string, any>;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({
    type: 'enum',
    enum: ConsentType,
    enumName: 'consent_type_enum',
    name: 'consent_type',
    default: ConsentType.GENERAL_TERMS,
  })
  consentType: ConsentType;

  @Column({ type: 'uuid', name: 'artist_id' })
  artistId: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;
}
