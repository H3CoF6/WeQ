import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// electron-trpc preload will be wired in a later step.
// For now expose only the toolkit electronAPI so the renderer can detect
// that it is running inside Electron.

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
  } catch (err) {
    console.error('contextBridge expose failed:', err);
  }
} else {
  // @ts-expect-error legacy non-isolated mode
  window.electron = electronAPI;
}
