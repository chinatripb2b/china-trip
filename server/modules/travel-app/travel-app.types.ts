export interface IEstimateForm {
  travelers: number;
  days: number;
  destination: string;
  hotelLevel: '经济型' | '舒适型' | '高端型' | '豪华型';
  transportNeeds?: string;
  guideService?: boolean;
  ticketBudget?: number;
  extraNotes?: string;
}

export interface IEstimateResult {
  totalCost: number;
  perPersonCost: number;
  hotelCost: number;
  transportCost: number;
  guideCost: number;
  ticketCost: number;
  otherCost: number;
}

export interface IUserProfile {
  id: string;
  name: string;
  company?: string;
  role?: string;
  avatar?: string;
  phone?: string;
}

export interface ITravelAppRecord {
  id: string;
  userId: string;
  profileName: string;
  profileCompany: string;
  profileRole: string;
  profileAvatar: string;
  profilePhone: string;
  travelers: number;
  days: number;
  destination: string;
  hotelLevel: string;
  transportNeeds: string;
  guideService: boolean;
  ticketBudget: number;
  extraNotes: string;
  totalCost: number;
  perPersonCost: number;
  hotelCost: number;
  transportCost: number;
  guideCost: number;
  ticketCost: number;
  otherCost: number;
  updatedAt: string;
}

export interface ITravelAppPayload {
  profile: IUserProfile;
  estimateForm: IEstimateForm;
  estimateResult: IEstimateResult;
}

export interface ITravelAppResponse {
  profile: IUserProfile;
  estimateForm: IEstimateForm;
  estimateResult: IEstimateResult;
  updatedAt: string;
}
