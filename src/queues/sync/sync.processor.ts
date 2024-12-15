import { Processor, InjectQueue, Process } from "@nestjs/bull";
import { Queue, Job } from "bull";
import { BaseComponent } from "../../global/domain/components/base.component";
import { queues } from "../queues";
import { SyncArtistRatingsJobType, SyncJobIdSchema, SyncJobType } from "./jobs";
import { ArtistProvider } from "../../artists/infrastructure/database/artist.provider";
import { ReviewAvgProvider } from "../../reviews/database/providers/reviewAvg.provider";

@Processor(queues.sync.name)
export class SyncProcessor extends BaseComponent {
    constructor(
        @InjectQueue(queues.deadLetter.name)
        private readonly deadLetterQueue: Queue,
        private readonly artistProvider: ArtistProvider,
        private readonly reviewAvgProvider: ReviewAvgProvider,
    ) {
        super(SyncProcessor.name);
        this.logger.log('Sync processor initialized');
    }

    @Process()
    async process(job: Job<SyncJobType>): Promise<void> {
        if (this.shouldMoveToDeadLetter(job)) {
            await this.moveToDeadLetter(job);
            return;
        }

        if (job.data.jobId === SyncJobIdSchema.enum.SYNC_ARTIST_RATINGS) {
            await this.syncArtistRating(job.data);
            this.logger.log(`Sync job ${job.id} processed successfully`);
        } else {
            this.logger.error(`Invalid job ID: ${job.data.jobId}`);
        }
    }

    private async syncArtistRating(data: SyncArtistRatingsJobType): Promise<void> {
        const reviewAvg = await this.reviewAvgProvider.findByArtistId(data.metadata.artistId);
        if (!reviewAvg) {
            this.logger.error(`Review avg not found for artist ${data.metadata.artistId}`);
            return;
        }
        const queryRunner = this.artistProvider.source.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            await queryRunner.query(
                `UPDATE artist SET rating = ROUND(CAST($1 AS numeric), 1) WHERE id = $2`,
                [reviewAvg.value, data.metadata.artistId]
            );

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private shouldMoveToDeadLetter(job: Job<SyncJobType>): boolean {
        return job.attemptsMade > queues.sync.attempts;
    }

    private async moveToDeadLetter(job: Job<SyncJobType>): Promise<void> {
        await this.deadLetterQueue.add(queues.deadLetter.name, job.data);
        this.logger.warn(
            `Job ${job.id} moved to dead letter queue after ${job.attemptsMade} attempts`,
        );
    }


}
