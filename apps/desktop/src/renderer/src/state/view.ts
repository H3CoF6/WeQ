/**
 * Top-level view router. We have three screens and don't want a real
 * router for one or two transitions — zustand holds the current view
 * and any data that needs to survive across them.
 */

import { create } from 'zustand';

export type View = 'bootstrap' | 'pick-account' | 'main';

interface ViewState {
  view: View;
  /** Set once an account is opened — drives the main view. */
  openedUin: string | null;
  /**
   * Tencent Files root used to derive per-uin `nt_msg.db` paths.
   * Null = use the first auto-discovered root; a non-null value comes
   * from the user picking via dialog.
   */
  tencentFilesRoot: string | null;
  goTo(view: View): void;
  setOpenedUin(uin: string | null): void;
  setTencentFilesRoot(root: string | null): void;
}

export const useViewState = create<ViewState>((set) => ({
  view: 'bootstrap',
  openedUin: null,
  tencentFilesRoot: null,
  goTo: (view) => set({ view }),
  setOpenedUin: (openedUin) => set({ openedUin }),
  setTencentFilesRoot: (tencentFilesRoot) => set({ tencentFilesRoot }),
}));
