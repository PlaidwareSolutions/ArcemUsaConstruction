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
  } | string,
  urlOrMethod?: string,
  data?: any
): Promise<T | null> {
  let url: string;
  let method: string = 'GET';
  let body: any = undefined;
  let on401: 'returnNull' | 'throw' = 'throw';

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
    // Object pattern: apiRequest({ url, method, body, on401 })
    url = options.url;
    method = options.method || 'GET';
    body = options.body;
    on401 = options.on401 || 'throw';
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
        return null;
      } else {
        throw new Error('Unauthorized access');
      }
    }
    
    await throwIfResNotOk(res);
    
    // For HEAD requests or empty responses
    if (method === 'HEAD' || res.status === 204) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <T>(options: {
  on401: UnauthorizedBehavior;
}) => {
  return async (context: any) => {
    const [url, ...params] = context.queryKey;
    
    // Handle query parameters
    const queryParams = params.length > 0 ? `?${new URLSearchParams(params[0]).toString()}` : '';
    const fullUrl = `${url}${queryParams}`;
    
    return apiRequest<T>({ url: fullUrl, on401: options.on401 });
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      queryFn: getQueryFn<any>({ on401: 'throw' }),
    },
  },
});