export interface LeadData {
  name: string;
  email: string;
  phone?: string;
  website: string;
  goals: string[];
}

export interface JourneyProps {
  lead: LeadData;
  routingMessage: string;
  onBack: () => void;
}
