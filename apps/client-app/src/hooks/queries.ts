import { useMutation, useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import * as api from '../api';
import type { VerifyArgs } from '../api';
import { generateRequestId } from '../lib/request-policy';
import type { ProviderQuery, ServiceRequest } from '../types';

export const keys = {
  categories: ['categories'] as const,
  categoryGroups: (q: string) => ['categories', 'groups', q] as const,
  category: (id: string) => ['category', id] as const,
  providers: (q: ProviderQuery) => ['providers', q] as const,
  provider: (id: string) => ['provider', id] as const,
  nearby: (area: string) => ['providers', 'nearby', area] as const,
  verified: ['providers', 'verified'] as const,
  recentWork: ['pastwork', 'recent'] as const,
  providerWork: (id: string) => ['pastwork', id] as const,
  reviews: (id: string) => ['reviews', id] as const,
  customerProfile: ['customer', 'profile'] as const,
  providerAccount: ['provider', 'account'] as const,
};

export const useCategories = () =>
  useQuery({ queryKey: keys.categories, queryFn: api.getCategories });

export const useCategoryGroups = (query: string) =>
  useQuery({ queryKey: keys.categoryGroups(query), queryFn: () => api.getCategoryGroups(query) });

export const useCategory = (id: string) =>
  useQuery({ queryKey: keys.category(id), queryFn: () => api.getCategory(id), enabled: !!id });

export const useProviders = (query: ProviderQuery) =>
  useQuery({ queryKey: keys.providers(query), queryFn: () => api.getProviders(query) });

export const useProvider = (id: string) =>
  useQuery({ queryKey: keys.provider(id), queryFn: () => api.getProvider(id), enabled: !!id });

export const useNearbyProviders = (area: string) =>
  useQuery({ queryKey: keys.nearby(area), queryFn: () => api.getNearbyProviders(area) });

export const useVerifiedProviders = () =>
  useQuery({ queryKey: keys.verified, queryFn: () => api.getVerifiedProviders() });

export const useRecentWork = () =>
  useQuery({ queryKey: keys.recentWork, queryFn: () => api.getRecentWork() });

export const useProviderWork = (id: string) =>
  useQuery({ queryKey: keys.providerWork(id), queryFn: () => api.getProviderPastWork(id), enabled: !!id });

export const useProviderReviews = (id: string) =>
  useQuery({ queryKey: keys.reviews(id), queryFn: () => api.getProviderReviews(id, 10), enabled: !!id });

export const useReviewEligibility = (id: string, enabled = true) =>
  useQuery({
    queryKey: ['reviews', 'eligibility', id] as const,
    queryFn: () => api.getReviewEligibility(id),
    enabled: !!id && enabled,
    staleTime: 30_000,
  });

/**
 * Service-request submission with a stable Idempotency-Key per LOGICAL
 * submission: the key is minted on the first attempt and reused across
 * retry-taps (offline/timeout → error → tap again), so the backend replays the
 * original result instead of creating a duplicate lead. Only a confirmed
 * success clears the key; the next distinct submission then gets a fresh one.
 */
export const useCreateRequest = () => {
  const keyRef = useRef<string | null>(null);
  return useMutation({
    mutationFn: (input: ServiceRequest) => {
      if (!keyRef.current) keyRef.current = generateRequestId();
      return api.createServiceRequest(input, keyRef.current);
    },
    onSuccess: () => {
      keyRef.current = null;
    },
  });
};


export const useRequestCustomerOtp = (purpose: 'directory_customer_login' | 'directory_customer_request') =>
  useMutation({
    mutationKey: ['requestOtp', purpose],
    mutationFn: (v: { phone: string; idempotencyKey?: string }) =>
      api.requestOtp(v.phone, purpose, v.idempotencyKey),
  });

/** Default customer login OTP — existing account required. */
export const useRequestOtp = () => useRequestCustomerOtp('directory_customer_login');

/** Request-tab / new-customer OTP — may create account on session exchange. */
export const useRequestCustomerSignupOtp = () => useRequestCustomerOtp('directory_customer_request');

export const useVerifyCustomerOtp = (purpose: 'directory_customer_login' | 'directory_customer_request') =>
  useMutation({
    mutationKey: ['verifyOtp', purpose],
    mutationFn: (v: { phone: string; code: string; challengeId: string }) =>
      api.verifyOtp({ phone: v.phone, code: v.code, challengeId: v.challengeId, purpose } satisfies VerifyArgs),
  });

export const useVerifyOtp = () => useVerifyCustomerOtp('directory_customer_login');

export const useVerifyCustomerSignupOtp = () => useVerifyCustomerOtp('directory_customer_request');

export const useRequestProviderOtp = () =>
  useMutation({
    mutationKey: ['requestProviderOtp'],
    mutationFn: (v: { phone: string; idempotencyKey?: string }) =>
      api.requestOtp(v.phone, 'directory_provider_login', v.idempotencyKey),
  });

export const useVerifyProviderOtp = () =>
  useMutation({
    mutationKey: ['verifyProviderOtp'],
    mutationFn: (v: { phone: string; code: string; challengeId: string }) =>
      api.verifyOtp({ phone: v.phone, code: v.code, challengeId: v.challengeId, purpose: 'directory_provider_login' } satisfies VerifyArgs),
  });

export const useLoginProvider = () =>
  useMutation({
    mutationFn: (v: { verifyToken: string; phone: string }) => api.loginProvider(v.verifyToken, v.phone),
  });

export const useCustomerProfile = (enabled = true) =>
  useQuery({ queryKey: keys.customerProfile, queryFn: () => api.fetchCustomerMe(), enabled });

export const useProviderAccount = (enabled = true) =>
  useQuery({ queryKey: keys.providerAccount, queryFn: () => api.fetchProviderMe(), enabled });

export const useUpdateCustomerProfile = () =>
  useMutation({
    mutationFn: (payload: Parameters<typeof api.updateCustomerProfile>[0]) => api.updateCustomerProfile(payload),
  });

export const useUpdateProviderProfile = () =>
  useMutation({
    mutationFn: (payload: Parameters<typeof api.updateProviderProfile>[0]) => api.updateProviderProfile(payload),
  });
