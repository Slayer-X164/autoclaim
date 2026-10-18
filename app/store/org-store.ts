import { create } from 'zustand';

export interface ActiveOrganization {
  id?: string;
  name?: string;
  slug?: string;
  logo?: string | null;
  [key: string]: unknown;
}

interface OrgStore {
  activeOrg: ActiveOrganization | null;
  setActiveOrg: (org: ActiveOrganization | null) => void;
}

export const useOrgStore = create<OrgStore>((set) => ({
  activeOrg: null,
  setActiveOrg: (org) => set({ activeOrg: org }),
}));
