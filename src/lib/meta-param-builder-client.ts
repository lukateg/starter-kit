/**
 * Meta Parameter Builder - Client-Side
 * 
 * Implements Meta's Parameter Builder best practices for collecting
 * fbc, fbp, and client_ip_address parameters on the client side.
 * 
 * Based on: https://developers.facebook.com/docs/marketing-api/conversions-api/parameter-builder-feature-library
 */

/**
 * Get IP address from a configured endpoint
 * This function should be implemented to fetch IPv6 first, then fallback to IPv4
 */
type GetIpFunction = () => Promise<string | null>;

/**
 * Process and collect all parameters according to Meta's best practices
 * 
 * @param url - The current page URL (including query parameters like fbclid)
 * @param getIpFn - Optional function to retrieve IP address (IPv6 preferred, IPv4 fallback)
 * @returns Object containing fbc, fbp, and client_ip_address
 */
export async function processAndCollectAllParams(
  url: string = typeof window !== "undefined" ? window.location.href : "",
  getIpFn?: GetIpFunction
): Promise<{
  fbc: string | null;
  fbp: string | null;
  clientIpAddress: string | null;
}> {
  if (typeof window === "undefined") {
    return { fbc: null, fbp: null, clientIpAddress: null };
  }

  // Parse URL to check for fbclid parameter
  const urlObj = new URL(url);
  const fbclid = urlObj.searchParams.get("fbclid");

  // Get or create _fbc cookie (Facebook Click ID)
  let fbc: string | null = null;
  if (fbclid) {
    // Generate fbc value: fb.{subdomain_index}.{click_id}.{timestamp}
    // Format: fb.1.{fbclid}.{timestamp}
    const timestamp = Math.floor(Date.now() / 1000);
    fbc = `fb.1.${fbclid}.${timestamp}`;
    
    // Store in cookie with 90-day expiry
    setCookie("_fbc", fbc, 90);
  } else {
    // Try to read existing _fbc cookie
    fbc = getCookie("_fbc");
  }

  // Get or create _fbp cookie (Facebook Browser ID)
  let fbp: string | null = getCookie("_fbp");
  if (!fbp) {
    // Generate fbp value: fb.{subdomain_index}.{random}.{timestamp}
    // Format: fb.1.{random}.{timestamp}
    const random = Math.random().toString(36).substring(2, 15);
    const timestamp = Math.floor(Date.now() / 1000);
    fbp = `fb.1.${random}.${timestamp}`;
    
    // Store in cookie with 90-day expiry
    setCookie("_fbp", fbp, 90);
  }

  // Get client IP address
  let clientIpAddress: string | null = null;
  if (getIpFn) {
    try {
      clientIpAddress = await getIpFn();
      if (clientIpAddress) {
        // Store IP in _fbi cookie for later retrieval
        setCookie("_fbi", clientIpAddress, 1); // 1 day expiry
      }
    } catch (error) {
      console.warn("Failed to retrieve IP address:", error);
    }
  } else {
    // Try to read from existing cookie
    clientIpAddress = getCookie("_fbi");
  }

  return { fbc, fbp, clientIpAddress };
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  
  return null;
}

/**
 * Set cookie with specified expiry days
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === "undefined") return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Set cookie with SameSite=Lax for better compatibility
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get IP address using a public IP service
 * Tries IPv6 first, then falls back to IPv4
 */
export async function getClientIpAddress(): Promise<string | null> {
  try {
    // Try IPv6 first
    try {
      const ipv6Response = await fetch("https://api64.ipify.org?format=json", {
        method: "GET",
        cache: "no-store",
      });
      const ipv6Data = await ipv6Response.json();
      if (ipv6Data.ip && ipv6Data.ip.includes(":")) {
        return ipv6Data.ip;
      }
    } catch (error) {
      console.debug("IPv6 fetch failed, trying IPv4:", error);
    }

    // Fallback to IPv4
    const ipv4Response = await fetch("https://api.ipify.org?format=json", {
      method: "GET",
      cache: "no-store",
    });
    const ipv4Data = await ipv4Response.json();
    return ipv4Data.ip || null;
  } catch (error) {
    console.warn("Failed to retrieve IP address:", error);
    return null;
  }
}

