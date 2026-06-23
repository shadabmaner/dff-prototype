"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

 let sharedQueryClient: QueryClient | null = null;

 export function getSharedQueryClient() {
     if (!sharedQueryClient) {
         sharedQueryClient = new QueryClient({
             defaultOptions: {
                 queries: {
                     staleTime: 60 * 1000,
                     retry: 1,
                 },
             },
         });
     }

     return sharedQueryClient;
 }

 export function clearSharedQueryClient() {
     const client = getSharedQueryClient();
     client.cancelQueries();
     client.clear();
 }

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => getSharedQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
