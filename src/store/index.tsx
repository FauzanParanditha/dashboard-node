import { create } from "zustand";
interface StoreState {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
  isLoading: false,
  setIsLoading: (loading: boolean) => set((state) => ({ isLoading: loading })),
  isLogin: false,
}));

export default useStore;
