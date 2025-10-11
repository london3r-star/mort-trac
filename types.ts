export enum Role {
  CLIENT = 'CLIENT',
  BROKER = 'BROKER',
}

export enum ApplicationStatus {
  AWAITING_DOCUMENTS = 'AWAITING_DOCUMENTS',
  AIP_IN_PROGRESS = 'AIP_IN_PROGRESS',
  AIP_APPROVED = 'AIP_APPROVED',
  FULL_APPLICATION_SUBMITTED = 'FULL_APPLICATION_SUBMITTED',
  MORTGAGE_OFFERED = 'MORTGAGE_OFFERED',
  CONTRACTS_EXCHANGED = 'CONTRACTS_EXCHANGED',
  PURCHASE_COMPLETED = 'PURCHASE_COMPLETED',
  RATE_EXPIRY_REMINDER_SENT = 'RATE_EXPIRY_REMINDER_SENT',
}

export interface Solicitor {
  firmName: string;
  solicitorName: string;
  contactNumber: string;
  email: string;
}

export interface ApplicationHistory {
  status: ApplicationStatus;
  date: string;
}

export interface Application {
  id: string;
  clientId: string;
  brokerId: string;
  clientName: string;
  clientEmail: string;
  clientContactNumber: string;
  clientCurrentAddress: string;
  propertyAddress: string;
  loanAmount: number;
  status: ApplicationStatus;
  mortgageLender: string;
  interestRate: number;
  interestRateExpiryDate: string;
  solicitor: Solicitor;
  history: ApplicationHistory[];
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
  contactNumber?: string;
  currentAddress?: string;
  companyName?: string;
  isAdmin?: boolean;
  isTeamManager?: boolean;
  isBrokerAdmin?: boolean;
}

export const STATUS_ORDER: ApplicationStatus[] = [
  ApplicationStatus.AWAITING_DOCUMENTS,
  ApplicationStatus.AIP_IN_PROGRESS,
  ApplicationStatus.AIP_APPROVED,
  ApplicationStatus.FULL_APPLICATION_SUBMITTED,
  ApplicationStatus.MORTGAGE_OFFERED,
  ApplicationStatus.CONTRACTS_EXCHANGED,
  ApplicationStatus.PURCHASE_COMPLETED,
];

export const STATUS_DISPLAY_NAMES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.AWAITING_DOCUMENTS]: 'Awaiting Documents',
  [ApplicationStatus.AIP_IN_PROGRESS]: 'AIP in Progress',
  [ApplicationStatus.AIP_APPROVED]: 'AIP Approved',
  [ApplicationStatus.FULL_APPLICATION_SUBMITTED]: 'Full Application Submitted',
  [ApplicationStatus.MORTGAGE_OFFERED]: 'Mortgage Offered',
  [ApplicationStatus.CONTRACTS_EXCHANGED]: 'Contracts Exchanged',
  [ApplicationStatus.PURCHASE_COMPLETED]: 'Purchase Completed',
  [ApplicationStatus.RATE_EXPIRY_REMINDER_SENT]: 'Rate Expiry Reminder Sent',
};