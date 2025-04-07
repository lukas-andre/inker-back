import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseFcmConfig {
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    // Using ADC (Application Default Credentials)
    // You should set the GOOGLE_APPLICATION_CREDENTIALS environment variable to the path of the service account key file.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });

    Logger.log('Firebase FCM initialized', FirebaseFcmConfig.name);

    this.isInitialized = true;
  }
}
