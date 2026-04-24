import { EmailService } from '../lib/services/EmailService';

test('EmailService fetches emails for a user', async () => {
  const service = new EmailService();
  const mockCallback = jest.fn();
  
  await service.subscribeToUserEmails('test@example.com', mockCallback);
  
  expect(mockCallback).toHaveBeenCalled(); // Use a mock response to validate this
});
