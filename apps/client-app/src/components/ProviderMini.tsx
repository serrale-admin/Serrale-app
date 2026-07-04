import type { Provider } from '../types';
import ProviderCard from './ProviderCard';

/** Backward-compatible verified-provider presentation. */
export default function ProviderMini({ provider }: { provider: Provider }) {
  return <ProviderCard provider={provider} variant="verified" />;
}
