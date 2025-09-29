export interface Profile {
  id: string; // This will be the Firebase Auth UID
  email: string;
  fullName: string;
  role: 'admin' | 'resident';
  phone: string;
  interiorNumber: number;
  houseNumber: string;
  paymentStatus: 'current' | 'overdue'; // Estado de pagos de administración
  lastPaymentDate?: any; // Fecha del último pago (opcional para nuevos residentes)
  createdAt: any; // Can be Date or Firebase Timestamp
}

export interface Vehicle {
  id: string;
  userId: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  active: boolean;
}

export interface ParkingSpot {
  id: string;
  spotNumber: string; // P01 to P32
  status: 'available' | 'occupied' | 'assigned';
  location: string;
}

export interface ParkingAssignment {
  id: string;
  parkingSpotId: string;
  userId: string;
  vehicleId: string;
  startDate: any; // Can be Date or Firebase Timestamp
  endDate: any; // Can be Date or Firebase Timestamp
  paymentStatus: 'paid' | 'unpaid';
  status: 'active' | 'expired' | 'cancelled';
  createdAt: any; // Can be Date or Firebase Timestamp
}

export interface CommunityProject {
  id: string;
  title: string;
  description: string;
  justification: string;
  priority: 'high' | 'medium' | 'low';
  viability: string;
  budget: number;
  status: 'proposal' | 'voting' | 'approved' | 'rejected';
  votingDeadline: any; // Can be Date or Firebase Timestamp
  createdBy: string; // user id
  createdAt: any; // Can be Date or Firebase Timestamp
}

export interface ProjectQuote {
  id: string;
  projectId: string;
  providerName: string;
  amount: number;
  description: string;
  fileUrl: string;
  fileName: string;
  createdAt: any; // Can be Date or Firebase Timestamp
}

export interface ProjectVote {
  id: string;
  projectId: string;
  userId: string;
  voteChoice: string; // quote id
  createdAt: any; // Can be Date or Firebase Timestamp
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'parking' | 'project' | 'general' | 'payment';
  read: boolean;
  createdAt: any; // Can be Date or Firebase Timestamp
}
