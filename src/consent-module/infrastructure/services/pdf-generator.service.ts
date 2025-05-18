import { Injectable, Logger } from '@nestjs/common';
import { SignedConsentEntity } from '../../../agenda/infrastructure/entities/signedConsent.entity';
import { FormTemplateEntity } from '../../../agenda/infrastructure/entities/formTemplate.entity';
import { MultimediasService } from '../../../multimedias/services/multimedias.service';
import { FileInterface } from '../../../multimedias/interfaces/file.interface';
import { SignedConsentRepository } from '../repositories/signed-consent.repository';
import { FormTemplateRepository } from '../repositories/form-template.repository';
import { PdfJobPayload } from '../../domain/dtos/pdf-job.payload.schema';
// import * as puppeteer from 'puppeteer'; // Or puppeteer-core

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  constructor(
    private readonly multimediasService: MultimediasService,
    private readonly signedConsentRepository: SignedConsentRepository,
    private readonly formTemplateRepository: FormTemplateRepository,
  ) {}

  async generatePdf(signedConsent: SignedConsentEntity, template: FormTemplateEntity): Promise<Buffer> {
    this.logger.log(`Generating PDF for signed consent: ${signedConsent.id}`);

    // 1. Construct HTML content from signedConsent.signedData and template.schema
    // This will involve iterating through template fields and matching with signedData
    // and laying it out in a nice HTML format.
    const htmlContent = this.constructHtml(signedConsent, template);

    // 2. Use Puppeteer (or similar) to convert HTML to PDF
    // Example (simplified, actual implementation needs error handling, browser management):
    /*
    const browser = await puppeteer.launch(); // Consider launching browser once, or using a pool
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdfBuffer;
    */

    // Placeholder until Puppeteer logic is implemented
    this.logger.warn('PDF generation logic is a placeholder.');
    return Buffer.from(`Placeholder PDF content for consent: ${signedConsent.id}. Title: ${template.title}`);
  }

  private constructHtml(signedConsent: SignedConsentEntity, template: FormTemplateEntity): string {
    // Basic HTML construction - this would be much more sophisticated
    let fieldsHtml = '';
    for (const field of template.content.fields) {
      const value = signedConsent.signedData[field.label] ?? 'N/A'; // Using label as key for now, might need a proper field key/id
      fieldsHtml += `<p><strong>${field.label}:</strong> ${value}</p>`;
    }

    if (signedConsent.digitalSignature) {
        // Assuming digitalSignature is a URL to an image or base64 data URI
        if (signedConsent.digitalSignature.startsWith('data:image') || signedConsent.digitalSignature.startsWith('http')) {
            fieldsHtml += `<div><strong>Signature:</strong><br/><img src="${signedConsent.digitalSignature}" alt="Signature" style="max-width: 200px; max-height: 100px; border: 1px solid #ccc;"/></div>`;
        } else {
            // If it's just a string (e.g. typed name), display as text
            fieldsHtml += `<p><strong>Signature (Typed):</strong> ${signedConsent.digitalSignature}</p>`;
        }
    }

    return `
      <html>
        <head>
          <title>Consent Form: ${template.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            p { margin-bottom: 10px; }
            strong { font-weight: bold; }
            div { margin-top: 15px; }
          </style>
        </head>
        <body>
          <h1>Consent Form: ${template.title}</h1>
          <p><strong>Consent Type:</strong> ${template.consentType}</p>
          <p><strong>Signed At:</strong> ${signedConsent.signedAt.toLocaleString()}</p>
          <p><strong>Signed By User ID:</strong> ${signedConsent.userId}</p>
          <hr/>
          <h2>Details:</h2>
          ${fieldsHtml}
          <hr/>
          <p style="font-size: 0.8em; color: #777;">Document generated on ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `;
  }

  // Method to be called by the Bull job processor
  async processPdfGenerationJob(payload: PdfJobPayload): Promise<void> {
    this.logger.log(`Processing PDF generation job for payload: ${JSON.stringify(payload)}`);
    
    const signedConsent = await this.signedConsentRepository.findOne(payload.signedConsentId);
    if (!signedConsent || !signedConsent.formTemplateId || !signedConsent.event) {
      this.logger.error(`Signed consent, form template ID, or event not found for consent ID: ${payload.signedConsentId}`);
      // TODO: Add error handling, maybe move to dead letter queue or retry with backoff
      return;
    }
    // Ensure event and event.agenda are loaded if needed for path construction in multimediasService
    // The `findOne` in SignedConsentRepository was updated to include `event` relation.
    // Assuming event.agenda.artistId or similar is accessible for path, or adapt `multimediasService` path logic.

    const template = await this.formTemplateRepository.findById(signedConsent.formTemplateId);
    if (!template) {
      this.logger.error(`Form template not found for ID: ${signedConsent.formTemplateId}`);
      // TODO: Add error handling
      return;
    }

    const pdfBuffer = await this.generatePdf(signedConsent, template);

    const file: FileInterface = {
      buffer: pdfBuffer,
      mimetype: 'application/pdf',
      originalname: `consent-${signedConsent.id}-${template.title.replace(/\s+/g, '_')}.pdf`,
      size: pdfBuffer.length,
    };

    // Define a source/path for S3. This should align with your S3 structure.
    // Example: `consents/artist_X/event_Y/consent_Z.pdf`
    // This might require artistId from template or event.agenda.artistId
    const s3SourcePath = `consents/event_${signedConsent.eventId}`;
    const s3FileName = `consent_form_${signedConsent.id}.pdf`;

    try {
      const uploadResult = await this.multimediasService.upload(file, s3SourcePath, s3FileName);
      this.logger.log(`PDF uploaded for consent ${signedConsent.id}: ${uploadResult.cloudFrontUrl}`);

      // Optionally, update SignedConsentEntity with PDF location or status
      // signedConsent.pdfUrl = uploadResult.cloudFrontUrl; // Add a field to SignedConsentEntity for this
      // await this.signedConsentRepository.save(signedConsent);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Failed to upload PDF for consent ${signedConsent.id}: ${error.message}`, error.stack);
      // TODO: Add error handling, retry, or dead-letter queue logic
    }
  }
} 