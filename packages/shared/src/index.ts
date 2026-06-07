/**
 * Common types and constants shared between main and renderer processes.
 * Keep this package dependency-free so both Node and browser bundlers can
 * pull it in cheaply.
 */

export type Platform = 'win32' | 'linux' | 'darwin';
export type Arch = 'x64' | 'arm64';

export interface QqAccount {
  uin: string;
  uid: string;
  userName: string;
  avatarUrl: string;
  lastLoginAt: number;
}
