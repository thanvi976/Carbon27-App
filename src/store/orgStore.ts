import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Organisation } from '../types';

type OrgState = {
  orgId: string | null;
  org: Organisation | null;
  setOrgId: (orgId: string | null) => void;
  setOrg: (org: Organisation | null) => void;
  clearOrg: () => void;
};

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      orgId: null,
      org: null,
      setOrgId: (orgId) => set({ orgId }),
      setOrg: (org) => set({ org }),
      clearOrg: () => set({ orgId: null, org: null }),
    }),
    { name: 'carbon27_org', storage: createJSONStorage(() => AsyncStorage) }
  )
);

