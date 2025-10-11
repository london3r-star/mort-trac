import { User, Application, Role, ApplicationStatus } from '../types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: Role.CLIENT, contactNumber: '07123456789', currentAddress: '1 London Road, London, SW1A 0AA' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com', role: Role.CLIENT, contactNumber: '07987654321', currentAddress: '2 Buckingham Palace Road, London, SW1W 0PP' },
  { id: 'user-3', name: 'Peter Jones', email: 'peter.jones@example.com', role: Role.CLIENT, contactNumber: '07555666777', currentAddress: '3 Whitehall, London, SW1A 2DD' },
  { id: 'broker-1', name: 'Alice Williams', email: 'alice.williams@broker.com', password: 'brokerpass', role: Role.BROKER, contactNumber: '020 1234 5678', companyName: 'Future Mortgages', isTeamManager: true },
  { id: 'broker-2', name: 'Bob Brown', email: 'bob.brown@broker.com', password: 'brokerpass', role: Role.BROKER, contactNumber: '020 8765 4321', companyName: 'Secure Homes Finance', isBrokerAdmin: true },
  { id: 'broker-3', name: 'Shahid Anwar', email: 'shahid.anwar@broker.com', password: 'brokerpass', role: Role.BROKER, isAdmin: true, contactNumber: '020 1122 3344', companyName: 'Future Mortgages' },
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    clientId: 'user-1',
    brokerId: 'broker-1',
    clientName: 'John Doe',
    clientEmail: 'john.doe@example.com',
    clientContactNumber: '07123456789',
    clientCurrentAddress: '1 London Road, London, SW1A 0AA',
    propertyAddress: '123 Abbey Road, London, NW8 9AY',
    loanAmount: 350000,
    status: ApplicationStatus.FULL_APPLICATION_SUBMITTED,
    mortgageLender: 'Nationwide',
    interestRate: 4.75,
    interestRateExpiryDate: '2025-11-01',
    solicitor: {
      firmName: 'Eversheds Sutherland',
      solicitorName: 'David Attenborough',
      contactNumber: '020 7946 0958',
      email: 'd.attenborough@eversheds.example.com',
    },
    history: [
      { status: ApplicationStatus.AWAITING_DOCUMENTS, date: '2023-10-01T10:00:00Z' },
      { status: ApplicationStatus.AIP_IN_PROGRESS, date: '2023-10-05T14:30:00Z' },
      { status: ApplicationStatus.AIP_APPROVED, date: '2023-10-07T11:00:00Z' },
      { status: ApplicationStatus.FULL_APPLICATION_SUBMITTED, date: '2023-10-15T09:00:00Z' },
    ],
    notes: 'Client has provided all initial documentation. Awaiting valuation report, which is scheduled for next Tuesday. Follow up with the lender on Wednesday.'
  },
  {
    id: 'app-2',
    clientId: 'user-2',
    brokerId: 'broker-2',
    clientName: 'Jane Smith',
    clientEmail: 'jane.smith@example.com',
    clientContactNumber: '07987654321',
    clientCurrentAddress: '2 Buckingham Palace Road, London, SW1W 0PP',
    propertyAddress: '221B Baker Street, London, NW1 6XE',
    loanAmount: 500000,
    status: ApplicationStatus.AIP_APPROVED,
    mortgageLender: 'HSBC',
    interestRate: 5.10,
    interestRateExpiryDate: '2026-01-15',
    solicitor: {
      firmName: 'Slater and Gordon',
      solicitorName: 'Mary Berry',
      contactNumber: '020 7123 4567',
      email: 'm.berry@slatergordon.example.com',
    },
    history: [
      { status: ApplicationStatus.AWAITING_DOCUMENTS, date: '2023-11-01T12:00:00Z' },
      { status: ApplicationStatus.AIP_IN_PROGRESS, date: '2023-11-03T16:00:00Z' },
      { status: ApplicationStatus.AIP_APPROVED, date: '2023-11-05T10:00:00Z' },
    ],
    notes: ''
  },
  {
    id: 'app-3',
    clientId: 'user-3',
    brokerId: 'broker-3',
    clientName: 'Peter Jones',
    clientEmail: 'peter.jones@example.com',
    clientContactNumber: '07555666777',
    clientCurrentAddress: '3 Whitehall, London, SW1A 2DD',
    propertyAddress: '10 Downing Street, London, SW1A 2AA',
    loanAmount: 1200000,
    status: ApplicationStatus.PURCHASE_COMPLETED,
    mortgageLender: 'Santander',
    interestRate: 4.25,
    interestRateExpiryDate: '2025-09-30',
    solicitor: {
      firmName: 'Irwin Mitchell',
      solicitorName: 'Gordon Ramsay',
      contactNumber: '020 8765 4321',
      email: 'g.ramsay@irwinmitchell.example.com',
    },
    history: [
      { status: ApplicationStatus.AWAITING_DOCUMENTS, date: '2023-08-10T09:00:00Z' },
      { status: ApplicationStatus.AIP_IN_PROGRESS, date: '2023-08-12T11:00:00Z' },
      { status: ApplicationStatus.AIP_APPROVED, date: '2023-08-14T15:00:00Z' },
      { status: ApplicationStatus.FULL_APPLICATION_SUBMITTED, date: '2023-08-20T10:00:00Z' },
      { status: ApplicationStatus.MORTGAGE_OFFERED, date: '2023-09-05T14:00:00Z' },
      { status: ApplicationStatus.CONTRACTS_EXCHANGED, date: '2023-09-25T17:00:00Z' },
      { status: ApplicationStatus.PURCHASE_COMPLETED, date: '2023-10-02T13:00:00Z' },
    ],
    notes: 'Completed successfully. Client is very happy.'
  },
];