import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Tenant } from "../types";
import { getSubdomainFromHost, getTenantFromSubdomain } from "../utils/tenant";

interface TenantContextType {
  tenant: Tenant | null;
  subdomain: string | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTenant = async () => {
      try {
        const currentSubdomain = getSubdomainFromHost();
        setSubdomain(currentSubdomain);

        if (currentSubdomain) {
          const tenantData = await getTenantFromSubdomain(currentSubdomain);
          setTenant(tenantData as Tenant);
        }
      } catch (error) {
        console.error("Error loading tenant:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initTenant();
  }, []);

  const value: TenantContextType = {
    tenant,
    subdomain,
    isLoading,
    setTenant,
  };

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};
