import { useOrgStore } from '../store/orgStore';

export function useOrg() {
  const orgId = useOrgStore((s) => s.orgId);
  const org = useOrgStore((s) => s.org);
  const setOrgId = useOrgStore((s) => s.setOrgId);
  const setOrg = useOrgStore((s) => s.setOrg);
  const clearOrg = useOrgStore((s) => s.clearOrg);
  return { orgId, org, setOrgId, setOrg, clearOrg };
}

