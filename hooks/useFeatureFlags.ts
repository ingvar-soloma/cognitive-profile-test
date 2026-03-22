import { useState, useEffect } from 'react';
import { ProfileService } from '@/services/ProfileService';
import { FeatureFlag } from '@/types';

let fetchPromise: Promise<FeatureFlag[]> | null = null;

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fetchPromise) {
      fetchPromise = ProfileService.fetchFeatureFlags();
    }
    
    fetchPromise.then(data => {
      setFlags(data);
      setLoading(false);
    });
  }, []);

  const isEnabled = (code: string) => {
    const flag = flags.find(f => f.code === code);
    return flag ? flag.is_enabled : false;
  };

  const toggleFlag = async (code: string, isEnabled: boolean) => {
    const res = await ProfileService.updateFeatureFlag(code, isEnabled);
    if (res?.status === 'success') {
      setFlags(prev => prev.map(f => f.code === code ? { ...f, is_enabled: isEnabled } : f));
    }
    return res;
  };

  return { flags, isEnabled, toggleFlag, loading };
};
