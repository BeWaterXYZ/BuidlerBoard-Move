import { create } from 'zustand';

export interface Dialogs {
  builderboard_import?: Record<string, any>;
}

interface DialogStore {
  dialogs: Dialogs;
  open: (type: keyof Dialogs, data?: any) => void;
  close: (type: keyof Dialogs) => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  dialogs: {},
  open: (type, data) => 
    set((state) => ({
      dialogs: { ...state.dialogs, [type]: data },
    })),
  close: (type) =>
    set((state) => {
      const { [type]: _, ...rest } = state.dialogs;
      return { dialogs: rest };
    }),
})); 