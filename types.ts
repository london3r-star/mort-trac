export enum Role {
  CLIENT = 'CLIENT',
  BROKER = 'BROKER',
}

// Database uses kebab-case strings for app stages
export type AppStage = 
  | 'new'
  | 'documents-requested'
  | 'submitted-to-lender'
  | 'aip-in-progress'
  | 'aip-approved'
  | 'full-application'
  | 'mortgage-offer'
  | 'contracts-exchanged'
  | 'completed';

// Backward compatibility - ApplicationStatus is now just an alias for AppStage
export type ApplicationStatus = AppStage;

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
  appStage: AppStage; // Changed from 'status' to 'appStage' to match database
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

export const STAGE_DISPLAY_NAMES: Record<AppStage, string> = {
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
export const STATUS_ORDER: AppStage[] = [
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
