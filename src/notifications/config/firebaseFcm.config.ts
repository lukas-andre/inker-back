import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseFcmConfig {
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;
    if (process.env.ENV === 'production') {
      try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (!serviceAccountJson) {
          throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
        }

        const serviceAccount = JSON.parse(serviceAccountJson);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        Logger.log('Firebase FCM initialized', FirebaseFcmConfig.name);
        this.isInitialized = true;
      } catch (error) {
        Logger.error('Failed to initialize Firebase FCM', error, FirebaseFcmConfig.name);
        throw error;
      }
    } else {
      Logger.log('Firebase FCM not initialized in development', FirebaseFcmConfig.name);

      // Initialize Firebase Admin with application default credentials
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });

      this.isInitialized = true;
    }
  }
}