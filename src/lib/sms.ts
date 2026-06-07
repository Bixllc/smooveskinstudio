import twilio from "twilio";

interface SmsReminderData {
  to: string;
  customerName: string;
  serviceName: string;
  dateTime: string;
  businessPhone?: string | null;
}

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  return twilio(sid, token);
}

export async function sendSmsReminder(data: SmsReminderData): Promise<void> {
  const client = getClient();
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!client || !from) return;

  const firstName = data.customerName.split(" ")[0];
  const contactLine = data.businessPhone
    ? ` Questions? Call us at ${data.businessPhone}.`
    : "";

  const body = `Hi ${firstName}, just a reminder that your ${data.serviceName} appointment is tomorrow at ${data.dateTime}.${contactLine} Reply STOP to opt out.`;

  await client.messages.create({ body, from, to: data.to });
}
