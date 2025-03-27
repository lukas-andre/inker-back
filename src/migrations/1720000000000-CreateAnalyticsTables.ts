import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAnalyticsTables1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create content_metrics table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS content_metrics (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        metrics JSONB NOT NULL DEFAULT '{"views":{"count":0,"uniqueCount":0}}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_content UNIQUE(content_id, content_type)
      )
    `);

    // Create artist_metrics table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artist_metrics (
        id SERIAL PRIMARY KEY,
        artist_id INTEGER NOT NULL,
        metrics JSONB NOT NULL DEFAULT '{"views":{"count":0,"uniqueCount":0}}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_artist UNIQUE(artist_id)
      )
    `);

    // Create viewers tables to track unique views
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS content_metrics_viewers (
        id SERIAL PRIMARY KEY,
        metrics_id INTEGER NOT NULL REFERENCES content_metrics(id) ON DELETE CASCADE,
        viewer_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_content_viewer UNIQUE(metrics_id, viewer_key)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS artist_metrics_viewers (
        id SERIAL PRIMARY KEY,
        metrics_id INTEGER NOT NULL REFERENCES artist_metrics(id) ON DELETE CASCADE,
        viewer_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_artist_viewer UNIQUE(metrics_id, viewer_key)
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_content_metrics_content_id ON content_metrics(content_id);
      CREATE INDEX IF NOT EXISTS idx_content_metrics_content_type ON content_metrics(content_type);
      CREATE INDEX IF NOT EXISTS idx_artist_metrics_artist_id ON artist_metrics(artist_id);
      CREATE INDEX IF NOT EXISTS idx_content_metrics_viewers_metrics_id ON content_metrics_viewers(metrics_id);
      CREATE INDEX IF NOT EXISTS idx_artist_metrics_viewers_metrics_id ON artist_metrics_viewers(metrics_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.query(`DROP TABLE IF EXISTS artist_metrics_viewers`);
    await queryRunner.query(`DROP TABLE IF EXISTS content_metrics_viewers`);
    await queryRunner.query(`DROP TABLE IF EXISTS artist_metrics`);
    await queryRunner.query(`DROP TABLE IF EXISTS content_metrics`);
  }
} 