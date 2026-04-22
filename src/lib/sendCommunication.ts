import nodemailer from 'nodemailer';
import type { CommunicationSettings } from './communicationSettings';

export type SendChannel = 'email' | 'sms';

export type SendCommunicationPayload = {
  channel: SendChannel;
  to: string;
  subject?: string;
  body: string;
  settings: CommunicationSettings;
};

type SendResult = {
  status: number;
  body: Record<string, unknown>;
};

const sendEmail = async ({ to, subject, body, settings }: SendCommunicationPayload): Promise<SendResult> => {
  const missing = [
    !settings?.smtp_host && 'SMTP host',
    !settings?.smtp_port && 'SMTP port',
    !settings?.smtp_user && 'SMTP username',
    !settings?.smtp_password && 'SMTP password',
    !settings?.smtp_from_email && 'From email',
  ].filter(Boolean);

  if (missing.length > 0) {
    return {
      status: 400,
      body: { error: `Email credentials missing: ${missing.join(', ')}. Save them in Settings first.` },
    };
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: Number(settings.smtp_port),
    secure: Boolean(settings.smtp_secure),
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password,
    },
  });

  await transporter.sendMail({
    from: settings.smtp_from_name
      ? `${settings.smtp_from_name} <${settings.smtp_from_email}>`
      : settings.smtp_from_email,
    to,
    subject: subject || 'Credibility Suite message',
    text: body,
  });

  return { status: 200, body: { ok: true, channel: 'email' } };
};

const sendSms = async ({ to, body, settings }: SendCommunicationPayload): Promise<SendResult> => {
  const missing = [
    !settings?.twilio_account_sid && 'Twilio Account SID',
    !settings?.twilio_auth_token && 'Twilio Auth Token',
    !settings?.twilio_from_number && 'Twilio phone number',
  ].filter(Boolean);

  if (missing.length > 0) {
    return {
      status: 400,
      body: { error: `SMS credentials missing: ${missing.join(', ')}. Save them in Settings first.` },
    };
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${settings.twilio_account_sid}/Messages.json`;
  const formData = new URLSearchParams();
  formData.set('To', to);
  formData.set('From', settings.twilio_from_number as string);
  formData.set('Body', body);

  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${settings.twilio_account_sid}:${settings.twilio_auth_token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio error: ${text}`);
  }

  return { status: 200, body: { ok: true, channel: 'sms' } };
};

export const sendCommunication = async (payload: SendCommunicationPayload): Promise<SendResult> => {
  if (payload.channel === 'email') return sendEmail(payload);
  if (payload.channel === 'sms') return sendSms(payload);
  return { status: 400, body: { error: 'Invalid channel' } };
};
