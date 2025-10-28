export enum Role {
  CLIENT = 'CLIENT',
  BROKER = 'BROKER',
}

// Using enum instead of type union so Rollup can properly resolve it at build time
export enum AppStage {
  NEW = 'new',
  DOCUMENTS_REQUESTED = 'documents-requested',
  SUBMITTED_TO_LENDER = 'submitted-to-lender',
  AIP_IN_PROGRESS = 'aip-in-progress',
  AIP_APPROVED = 'aip-approved',
  FULL_APPLICATION = 'full-application',
  MORTGAGE_OFFER = 'mortgage-offer',
  CONTRACTS_EXCHANGED = 'contracts-exchanged',
  COMPLETED = 'completed',
}

// Backward compatibility
export type ApplicationStatus = AppStage;

// Helper type for the string values
export type AppStageValue = `${AppStage}`;

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
  appStage: AppStageValue; // Use string value type
  mortgageLender: string;
  interestRate: string;
  interestRateExpiryDate: string;
  solicitorFirmName: string;
  solicitorName: string;
  solicitorEmail: string;
  solicitorContactNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Solicitor {
  firmName: string;
  solicitorName: string;
  contactNumber: string;
  email: string;
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
  mustChangePassword?: boolean;
}

export const STAGE_DISPLAY_NAMES: Record<AppStageValue, string> = {
  'new': 'New',
  'documents-requested': 'Awaiting Documents',
  'submitted-to-lender': 'Submitted to Lender',
  'aip-in-progress': 'AIP in Progress',
  'aip-approved': 'AIP Approved',
  'full-application': 'Full Application Submitted',
  'mortgage-offer': 'Mortgage Offered',
  'contracts-exchanged': 'Contracts Exchanged',
  'completed': 'Purchase Completed',
};

// Backward compatibility
export const STATUS_DISPLAY_NAMES = STAGE_DISPLAY_NAMES;
export const STATUS_ORDER: AppStageValue[] = [
  'new',
  'documents-requested',
  'submitted-to-lender',
  'aip-in-progress',
  'aip-approved',
  'full-application',
  'mortgage-offer',
  'contracts-exchanged',
  'completed',
];