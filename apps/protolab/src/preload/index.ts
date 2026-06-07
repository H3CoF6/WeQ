import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc';
import type { CellSample, ColumnRow, SampleReq, TableRow } from '../shared/ipc';

const api = {
  openDb: (req: { dbPath: string; key: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.openDb, req) as Promise<{ ok: true }>,
  listTables: (req: { dbPath: string; key: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.listTables, req) as Promise<TableRow[]>,
  listColumns: (req: { dbPath: string; key: string; table: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.listColumns, req) as Promise<ColumnRow[]>,
  sampleColumn: (req: SampleReq) =>
    ipcRenderer.invoke(IPC_CHANNELS.sampleColumn, req) as Promise<CellSample[]>,
  closeDb: (dbPath: string) => ipcRenderer.invoke(IPC_CHANNELS.closeDb, dbPath) as Promise<void>,
};

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('protolab', api);
} else {
  // @ts-expect-error legacy non-isolated mode
  window.protolab = api;
}

export type ProtolabApi = typeof api;
