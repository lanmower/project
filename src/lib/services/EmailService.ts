import { BaseService } from './BaseService';
import { ProcessedEmail } from '../types/email';
import { where, orderBy } from 'firebase/firestore';

export class EmailService extends BaseService<ProcessedEmail> {
  constructor() {
    super('processedEmails');
  }

  public subscribeToUserEmails(userEmail: string, callback: (emails: ProcessedEmail[]) => void) {
    return this.subscribe(
      callback,
      [
        where('to', 'array-contains', userEmail),
        orderBy('timestamp', 'desc')
      ]
    );
  }

  // Add email-specific operations
}