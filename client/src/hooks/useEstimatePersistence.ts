import React from 'react';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';

import {
  getLatestTravelAppRecord,
  saveTravelAppRecord,
  type IEstimateForm,
  type IEstimateResult,
  type IUserProfile,
} from '@/api/travel-app';

const fallbackUserProfile: IUserProfile = {
  id: 'guest-biz-user',
  name: '刘晨',
  company: '华旅国际渠道中心',
  role: '采购经理',
  avatar: '',
  phone: '400-820-1688',
};

export function useEstimatePersistence<TForm extends Partial<IEstimateForm>>(defaultForm: TForm) {
  const currentUser = useCurrentUserProfile();
  const [initialForm, setInitialForm] = React.useState<TForm>(defaultForm);
  const [latestResult, setLatestResult] = React.useState<IEstimateResult | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState('');

  const profile = React.useMemo<IUserProfile>(
    () => ({
      ...fallbackUserProfile,
      id: currentUser.user_id || fallbackUserProfile.id,
      name: currentUser.name || fallbackUserProfile.name,
      avatar: currentUser.avatar || fallbackUserProfile.avatar,
      company: fallbackUserProfile.company,
      role: fallbackUserProfile.role,
      phone: fallbackUserProfile.phone,
    }),
    [currentUser.avatar, currentUser.name, currentUser.user_id],
  );

  React.useEffect(() => {
    let active = true;

    getLatestTravelAppRecord().then((record) => {
      if (!active || !record) {
        return;
      }

      setInitialForm(record.estimateForm as TForm);
      setLatestResult(record.estimateResult);
      setUpdatedAt(record.updatedAt);
    });

    return () => {
      active = false;
    };
  }, []);

  const save = React.useCallback(
    async (estimateForm: IEstimateForm, estimateResult: IEstimateResult) => {
      const record = await saveTravelAppRecord({
        profile,
        estimateForm,
        estimateResult,
      });

      setInitialForm(record.estimateForm as TForm);
      setLatestResult(record.estimateResult);
      setUpdatedAt(record.updatedAt);
      return record;
    },
    [profile],
  );

  return {
    initialForm,
    latestResult,
    updatedAt,
    profile,
    save,
  };
}
