'use client';

import { create } from 'zustand';

interface NotificationStore {
  refreshKey: number;
  triggerRefresh: () => void;
}

export const useNotificationStore = create<NotificationStore>()((set) => ({
  refreshKey: 0,
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
