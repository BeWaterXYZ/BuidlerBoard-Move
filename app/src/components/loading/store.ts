import { create } from 'zustand';

interface LoadingStore {
  isLoading: boolean;
  showLoading: () => void;
  dismissLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  showLoading: () => set({ isLoading: true }),
  dismissLoading: () => set({ isLoading: false }),
}));

export const useLoadingStoreAction = () => {
  const { showLoading, dismissLoading } = useLoadingStore();
  return { showLoading, dismissLoading };
}; 