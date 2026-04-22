export type CommunicationSettings = {
  smtp_host: string;
  smtp_port: string;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password: string;
  smtp_from_email: string;
  smtp_from_name: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_from_number: string;
};

const STORAGE_KEY = 'credibility-suite:communication-settings';

export const emptyCommunicationSettings: CommunicationSettings = {
  smtp_host: '',
  smtp_port: '',
  smtp_secure: false,
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_from_number: '',
};

export const saveLocalCommunicationSettings = (settings: CommunicationSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore local storage failures
  }
};

export const loadLocalCommunicationSettings = (): CommunicationSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCommunicationSettings;
    const parsed = JSON.parse(raw) as Partial<CommunicationSettings>;
    return {
      ...emptyCommunicationSettings,
      ...parsed,
    };
  } catch {
    return emptyCommunicationSettings;
  }
};

export const hasLocalCommunicationSettings = () => {
  const settings = loadLocalCommunicationSettings();
  return Boolean(
    settings.smtp_host ||
    settings.smtp_port ||
    settings.smtp_user ||
    settings.smtp_password ||
    settings.smtp_from_email ||
    settings.twilio_account_sid ||
    settings.twilio_auth_token ||
    settings.twilio_from_number,
  );
};
