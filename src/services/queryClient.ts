import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time for smooth browsing without aggressive refetching
      staleTime: 1000 * 60 * 5,
      // Keep inactive cache in memory for 30 minutes
      gcTime: 1000 * 60 * 30,
      // Retry failed queries twice before throwing
      retry: 2,
      // In mobile, avoid aggressive refetch on window focus
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
