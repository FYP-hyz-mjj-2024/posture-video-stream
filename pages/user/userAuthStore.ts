import { create } from 'zustand';

interface AuthState {
    user_id: string | null;
    token: string | null;
    setAuth: (user_id: string, token: string) => void;
    clearAuth: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    user_id: null,
    token: null,
    setAuth: (user_id, token) => set({ user_id, token }),
    clearAuth: () => set({ user_id: null, token: null }),
}));

export default useAuthStore;