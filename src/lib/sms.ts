// SMS reminders not implemented — stub to prevent build errors
interface SmsReminderData {
  to: string;
  customerName: string;
  serviceName: string;
  dateTime: string;
  businessPhone?: string | null;
}

export async function sendSmsReminder(_data: SmsReminderData): Promise<void> {
  // Not implemented
}
