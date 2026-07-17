/**
 * API facade. Screens and React Query hooks import only from here. The concrete
 * implementation is chosen by `EXPO_PUBLIC_USE_MOCK` — the mock layer for local
 * dev, or the real SERRALE API client (`./serrale`) in production. Both expose an
 * identical surface, so nothing downstream changes when the flag flips.
 */
import { USE_MOCK } from '../lib/env';
import * as mock from './mock';
import * as real from './serrale';

const impl = USE_MOCK ? mock : real;

export const getCategories = impl.getCategories;
export const getCategory = impl.getCategory;
export const getCategoryGroups = impl.getCategoryGroups;
export const getProviders = impl.getProviders;
export const getProvider = impl.getProvider;
export const getNearbyProviders = impl.getNearbyProviders;
export const getVerifiedProviders = impl.getVerifiedProviders;
export const getProviderPastWork = impl.getProviderPastWork;
export const getRecentWork = impl.getRecentWork;
export const getProviderReviews = impl.getProviderReviews;
export const searchSuggest = impl.searchSuggest;
export const createServiceRequest = impl.createServiceRequest;
export const logProviderContact = impl.logProviderContact;
export const fetchMyActivity = impl.fetchMyActivity;
export const fetchActivityDetail = impl.fetchActivityDetail;
export const fetchPhoneAccountHint = impl.fetchPhoneAccountHint;
export const requestOtp = impl.requestOtp;
export const verifyOtp = impl.verifyOtp;
export const exchangeSession = impl.exchangeSession;
export const refreshSession = impl.refreshSession;
export const logoutSession = impl.logoutSession;
export const fetchCustomerMe = impl.fetchCustomerMe;
export const updateCustomerProfile = impl.updateCustomerProfile;
export const fetchProviderMe = impl.fetchProviderMe;
export const updateProviderProfile = impl.updateProviderProfile;
export const loginProvider = impl.loginProvider;
export const registerProvider = impl.registerProvider;


export type { Page, CategoryGroup, CreatedRequest, OtpChallenge, OtpPurpose, VerifyResult, SearchSuggestion } from './shared';
export { PAGE_SIZE } from './shared';
export type { VerifyArgs } from './mock/auth';
export type { ContactEventType } from './serrale/requests';
export { MIN_SUGGEST_LENGTH, SUGGEST_LIMIT } from './serrale/search';
export { NetworkError, HttpError, ApiBusinessError } from '../lib/http';
