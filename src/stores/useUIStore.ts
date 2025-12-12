import { create } from 'zustand';

interface TipModalState {
  isOpen: boolean;
  recipientAddress: string;
  recipientUsername: string;
  postId: string;
}

interface MintUsernameModalState {
  isOpen: boolean;
}

interface UIStore {
  // Tip Modal
  tipModal: TipModalState;
  openTipModal: (
    postId: string,
    recipientAddress: string,
    recipientUsername: string,
  ) => void;
  closeTipModal: () => void;

  // Mint Username Modal
  mintUsernameModal: MintUsernameModalState;
  openMintUsernameModal: () => void;
  closeMintUsernameModal: () => void;

  // Loading states
  isProcessing: boolean;
  setProcessing: (value: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Tip Modal
  tipModal: {
    isOpen: false,
    recipientAddress: '',
    recipientUsername: '',
    postId: '',
  },
  openTipModal: (postId, recipientAddress, recipientUsername) =>
    set({
      tipModal: { isOpen: true, postId, recipientAddress, recipientUsername },
    }),
  closeTipModal: () =>
    set({
      tipModal: {
        isOpen: false,
        recipientAddress: '',
        recipientUsername: '',
        postId: '',
      },
    }),

  // Mint Username Modal
  mintUsernameModal: { isOpen: false },
  openMintUsernameModal: () => set({ mintUsernameModal: { isOpen: true } }),
  closeMintUsernameModal: () => set({ mintUsernameModal: { isOpen: false } }),

  // Loading
  isProcessing: false,
  setProcessing: (value) => set({ isProcessing: value }),
}));
