# Cloudflare Images Migration - Task Tracking

## Overview
This document tracks all tasks required to migrate from AWS S3 + CloudFront to Cloudflare Images API implementation.

## Migration Strategy
- **Approach**: Complete code replacement (no data migration needed as all current data is test data)
- **Pattern**: Implement Strategy pattern to support both S3 and Cloudflare during transition
- **Module Structure**: Follow Inker's Clean Architecture principles

## Task Categories

### 1. Configuration & Setup Tasks
- [ ] **1.1** Create Cloudflare configuration file (`src/config/cloudflare.config.ts`)
  - Define CloudflareConfig type
  - Create registerAs configuration
  - Create Joi validation schema
  - Add required environment variables (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CLOUDFLARE_IMAGES_DELIVERY_URL)
- [ ] **1.2** Update environment configuration
  - Add Cloudflare variables to `.env.example`
  - Update main config aggregator (`src/config/config.ts`)
  - Add Cloudflare config to validation schemas
- [ ] **1.3** Register Cloudflare configuration in GlobalModule
  - Import CloudflareConfig in global module
  - Add to ConfigModule load array

### 2. Infrastructure Layer Tasks
- [ ] **2.1** Create Cloudflare Images Client (`src/global/infrastructure/clients/cloudflare-images.client.ts`)
  - Implement upload method with metadata support
  - Implement delete method
  - Implement getImageUrl method for variant URLs
  - Add proper error handling
  - Support for 10MB file size limit
  - Handle supported formats (JPEG, PNG, WebP, GIF, SVG)
- [ ] **2.2** Add CloudflareImagesClient to GlobalModule
  - Register as provider
  - Export for use in other modules

### 3. Storage Strategy Implementation
- [ ] **3.1** Create storage strategy interface (`src/multimedias/interfaces/storage-strategy.interface.ts`)
  - Define upload method signature
  - Define delete method signature
  - Define URL generation method
- [ ] **3.2** Implement S3 storage strategy (`src/multimedias/strategies/s3-storage.strategy.ts`)
  - Extract current S3 logic from MultimediasService
  - Implement StorageStrategy interface
  - Maintain existing folder structure logic
- [ ] **3.3** Implement Cloudflare storage strategy (`src/multimedias/strategies/cloudflare-storage.strategy.ts`)
  - Implement StorageStrategy interface
  - Map folder paths to metadata structure
  - Handle variant selection
  - Implement proper metadata schema for different upload types

### 4. MultimediasService Refactoring
- [ ] **4.1** Refactor MultimediasService to use strategy pattern
  - Add strategy selection logic (feature flag or config-based)
  - Update all upload methods to use selected strategy
  - Maintain backward compatibility
- [ ] **4.2** Update specific upload methods
  - `uploadPostMultimedias`: Map to metadata (type: 'post', artistId, postId, index)
  - `uploadWorkEvidence`: Map to metadata (type: 'work-evidence', agendaId, eventId, index)
  - `uploadQuotationReferenceImages`: Map to metadata (type: 'reference-image', quotationId, artistId, index)
  - `uploadQuotationProposedImages`: Map to metadata (type: 'proposed-image', quotationId, artistId, index)
  - `uploadQuotationProposedDesigns`: Map to metadata (type: 'proposed-design', quotationId, artistId, index)

### 5. Database Updates
- [ ] **5.1** Analyze current multimedia URL storage
  - Identify all tables/entities storing S3 URLs
  - Document URL format differences
- [ ] **5.2** Plan database schema updates
  - Consider adding `cloudflareImageId` field
  - Determine if dual URL storage is needed during transition
- [ ] **5.3** Create migration scripts
  - Add new fields if needed
  - Update URL formats if required

### 6. Cloudflare Variants Configuration
- [ ] **6.1** Define variant configurations
  - thumbnail: 150x150 cover
  - small: 400x400 contain
  - medium: 800x800 contain
  - large: 1600x1600 contain
  - public: 2000x2000 contain (default)
- [ ] **6.2** Implement variant selection logic
  - Map use cases to appropriate variants
  - Update URL generation to include variant parameter

### 7. Error Handling & Validation
- [ ] **7.1** Implement Cloudflare-specific error handling
  - Handle 415 (unsupported media type)
  - Handle 413 (payload too large)
  - Handle 5455 (unsupported format)
  - Handle 5559 (temporary API error with retry)
- [ ] **7.2** Add file validation
  - Check file size (max 10MB)
  - Validate supported formats
  - Check image dimensions (max 12,000px per side, 100 megapixels total)

### 8. Feature Flag Implementation
- [ ] **8.1** Create feature flag configuration
  - Add STORAGE_PROVIDER environment variable
  - Support values: 's3' | 'cloudflare'
- [ ] **8.2** Implement feature flag logic in MultimediasService
  - Strategy selection based on flag
  - Ensure smooth switching capability

### 9. Testing
- [ ] **9.1** Unit tests for CloudflareImagesClient
  - Test upload functionality
  - Test delete functionality
  - Test URL generation
  - Test error scenarios
- [ ] **9.2** Unit tests for storage strategies
  - Test S3 strategy
  - Test Cloudflare strategy
  - Test metadata mapping
- [ ] **9.3** Integration tests
  - Test MultimediasService with both strategies
  - Test file upload endpoints
  - Test error handling
- [ ] **9.4** E2E tests
  - Test complete upload flow
  - Test image retrieval
  - Test deletion flow

### 10. Documentation
- [ ] **10.1** Update API documentation
  - Document new URL formats
  - Update Swagger/OpenAPI specs
  - Document variant options
- [ ] **10.2** Update developer documentation
  - Add Cloudflare setup guide
  - Document environment variables
  - Add troubleshooting guide

### 11. Deployment & Rollback
- [ ] **11.1** Create deployment plan
  - Environment variable setup
  - Feature flag configuration
  - Monitoring setup
- [ ] **11.2** Create rollback procedure
  - Document rollback steps
  - Test rollback process
  - Ensure data integrity

### 12. Performance & Monitoring
- [ ] **12.1** Set up monitoring
  - Track upload success/failure rates
  - Monitor API rate limits (1,200 requests/5 min)
  - Track storage usage against quota
- [ ] **12.2** Performance optimization
  - Implement request batching where possible
  - Add caching for frequently accessed images
  - Optimize metadata queries

## Priority Order
1. Configuration & Client Implementation (Tasks 1-2)
2. Strategy Pattern Implementation (Tasks 3-4)
3. Error Handling & Validation (Task 7)
4. Feature Flag (Task 8)
5. Testing (Task 9)
6. Database Updates (Task 5)
7. Variants Configuration (Task 6)
8. Documentation (Task 10)
9. Deployment Planning (Task 11)
10. Monitoring (Task 12)

## Notes
- No data migration needed (all current data is test data)
- Cloudflare Images doesn't support folder structure - use metadata instead
- 10MB file size limit per image
- Supported formats: JPEG, PNG, WebP, GIF, SVG
- Rate limit: 1,200 requests per 5 minutes
- Consider costs: Cloudflare charges per image stored vs S3's storage + transfer model

## Dependencies
- Cloudflare account with Images enabled
- API token with Images permissions
- Environment variables configured
- axios package for HTTP requests
- form-data package for multipart uploads

## Risks & Mitigations
- **Risk**: File size limitations (10MB)
  - **Mitigation**: Add client-side validation and clear error messages
- **Risk**: Format limitations
  - **Mitigation**: Convert unsupported formats or reject with clear message
- **Risk**: No folder structure
  - **Mitigation**: Robust metadata schema and query capabilities
- **Risk**: Rate limiting
  - **Mitigation**: Implement request queuing and retry logic