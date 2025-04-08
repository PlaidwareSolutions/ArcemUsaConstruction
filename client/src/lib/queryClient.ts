import { QueryClient } from '@tanstack/react-query';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorDetails;
    try {
      errorDetails = await res.json();
    } catch (e) {
      errorDetails = { message: 'Unknown error' };
    }
    throw new Error(errorDetails.message || `API error: ${res.status}`);
  }
}

export async function apiRequest<T = any>(
  options: {
    url: string;
    method?: string;
    body?: any;
    on401?: 'returnNull' | 'throw';
    suppressLogs?: boolean;
    parseResponse?: boolean;
  } | string,
  urlOrMethod?: string,
  data?: any
): Promise<T | null> {
  let url: string;
  let method: string = 'GET';
  let body: any = undefined;
  let on401: 'returnNull' | 'throw' = 'throw';
  let suppressLogs: boolean = false;
  let parseResponse: boolean = true; // Default to parsing JSON response

  // Handle multiple calling patterns
  if (typeof options === 'string' && typeof urlOrMethod === 'string') {
    // Old pattern: apiRequest("METHOD", "URL", data?)
    method = options;
    url = urlOrMethod;
    body = data;
  } else if (typeof options === 'string') {
    // Simple pattern: apiRequest("URL")
    url = options;
  } else {
    // Object pattern: apiRequest({ url, method, body, on401, suppressLogs, parseResponse })
    url = options.url;
    method = options.method || 'GET';
    body = options.body;
    on401 = options.on401 || 'throw';
    suppressLogs = options.suppressLogs || false;
    parseResponse = options.parseResponse !== undefined ? options.parseResponse : true;
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, fetchOptions);
    
    // Handle 401 Unauthorized specifically
    if (res.status === 401) {
      if (on401 === 'returnNull') {
        // Return null without logging error
        return null;
      } else {
        // Only throw error if suppressLogs is false
        if (!suppressLogs) {
          throw new Error('Unauthorized access');
        } else {
          // For suppressLogs=true and 401 response, just return null without error
          return null;
        }
      }
    }
    
    // For non-401 responses, continue with error checking
    await throwIfResNotOk(res);
    
    // For HEAD requests or empty responses
    if (method === 'HEAD' || res.status === 204) {
      return null;
    }
    
    // Skip JSON parsing for specific endpoints or when parseResponse is false
    if (!parseResponse || res.headers.get('content-type')?.includes('text/plain')) {
      return null;
    }
    
    // Check if there's content to parse
    const text = await res.text();
    if (!text) {
      return null;
    }
    
    try {
      return JSON.parse(text);
    } catch (error) {
      if (!suppressLogs) {
        console.warn('Response is not valid JSON:', text);
      }
      return null;
    }
  } catch (error) {
    // Only log errors if suppressLogs is false
    if (!suppressLogs) {
      console.error('API request failed:', error);
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
  suppressLogs?: boolean;
}) => {
  return async (context: any) => {
    const [url, ...params] = context.queryKey;
    
    // Handle query parameters
    const queryParams = params.length > 0 ? `?${new URLSearchParams(params[0]).toString()}` : '';
    const fullUrl = `${url}${queryParams}`;
    
    return apiRequest<T>({ 
      url: fullUrl, 
      on401: options.on401,
      suppressLogs: options.suppressLogs !== undefined ? options.suppressLogs : false 
    });
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      // Set default suppressLogs to true for all authentication-related queries
      queryFn: getQueryFn<any>({ 
        on401: 'throw',
        suppressLogs: true // Suppress logs by default for all queries
      }),
    },
  },
});