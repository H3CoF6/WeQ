/**
 * Win32 detection service — answers "what QQ accounts / processes / files
 * does this machine have?". Reads-only; performs no writes, injection, or
 * network calls.
 *
 * Composed from:
 *   - `Platform` (path resolution, native bundle)
 *   - `nt_helper`'s `decryptLoginDb` (login.db parser)
 *   - `nt_helper`'s `getQqProcesses` + `probeQqLoginInfo` (live QQ probe)
 *
 * One service instance is fine for the whole app lifetime — it's stateless
 * past the constructor.
 */

import { existsSync } from 'node:fs';
import type { Platform } from '@weq/platform';
import type { LoginAccount, QqPortLoginInfo } from '@weq/native';

export interface QqInstallInfo {
  qqExePath: string | null;
  wrapperNodePath: string | null;
  /**
   * Tencent Files roots that actually exist on disk. Platform's
   * `tencentFilesRoots()` returns three CANDIDATE locations (used for
   * error messages), but the diagnostics screen only wants the ones
   * the user actually has.
   */
  tencentFilesRoots: string[];
  loginDbPath: string | null;
}

export interface DetectedQqProcess {
  pid: number;
  loginInfo: QqPortLoginInfo | null;
}

export class Win32DetectService {
  constructor(private readonly platform: Platform) {}

  /** Aggregate the static install / data paths the UI's "diagnostics" screen wants. */
  describeInstall(): QqInstallInfo {
    return {
      qqExePath: this.platform.qqExePath(),
      wrapperNodePath: this.platform.qqWrapperNodePath(),
      tencentFilesRoots: this.platform.tencentFilesRoots().filter((p) => existsSync(p)),
      loginDbPath: this.platform.loginDbPath(),
    };
  }

  /** All historically-cached accounts from `login.db`. Throws if the DB is missing. */
  listAccounts(): LoginAccount[] {
    const dbPath = this.platform.loginDbPath();
    if (!dbPath) {
      throw new Error(
        'login.db not found in any candidate Tencent Files root. Is QQ NT installed?',
      );
    }
    return this.platform.native.ntHelper.decryptLoginDb(dbPath);
  }

  /**
   * Walk every running QQ.exe process and probe its local port for login
   * state. Useful for "you have N logged-in QQ windows — which account do
   * you want to pull a key from?".
   */
  detectRunningProcesses(): DetectedQqProcess[] {
    const pids = this.platform.native.ntHelper.getQqProcesses();
    for (const pid of pids) {
      console.log(this.platform.native.ntHelper.probeQqLoginInfo(pid));
    }
    return pids.map((pid) => ({
      pid,
      loginInfo: this.platform.native.ntHelper.probeQqLoginInfo(pid),
    }));
  }

  /** Convenience: per-account `nt_msg.db` lookup with a clean error. */
  ntMsgDbPath(uin: string): string {
    const path = this.platform.ntMsgDbPath(uin);
    if (!path) {
      throw new Error(`nt_msg.db not found for uin=${uin}`);
    }
    return path;
  }
}
