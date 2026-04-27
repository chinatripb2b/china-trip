import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

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

export async function getLatestTravelAppRecord() {
  const response = await axiosForBackend.get<ITravelAppResponse | null>('/api/travel-app/latest');
  return response.data;
}

export async function saveTravelAppRecord(payload: ITravelAppPayload) {
  const response = await axiosForBackend.post<ITravelAppResponse>('/api/travel-app/save', payload);
  return response.data;
}
