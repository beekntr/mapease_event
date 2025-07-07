export const getSubdomainFromHost = (): string | null => {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;
  const parts = host.split(".");

  // For localhost development
  if (host.includes("localhost")) {
    return null;
  }

  // For subdomain.mapease.com
  if (parts.length >= 3 && parts[1] === "mapease" && parts[2] === "com") {
    return parts[0];
  }

  return null;
};

export const getTenantFromSubdomain = async (subdomain: string) => {
  // Mock function - replace with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `tenant-${subdomain}`,
        name: `${subdomain.charAt(0).toUpperCase() + subdomain.slice(1)} Organization`,
        subdomain,
        mapData: "<svg><!-- Mock SVG data --></svg>",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }, 500);
  });
};

export const redirectToTenantDashboard = (subdomain: string) => {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";

  if (window.location.hostname.includes("localhost")) {
    // For development, use query parameter
    window.location.href = `${protocol}//${window.location.hostname}${port}/dashboard?tenant=${subdomain}`;
  } else {
    // For production, use actual subdomain
    window.location.href = `${protocol}//${subdomain}.mapease.com/dashboard`;
  }
};
