/**
 * Screen 3 — main view.
 *
 * Two panes:
 *   - Left  — peer list (distinct peerUin's from c2c_msg_table)
 *   - Right — JSON-stringified messages with one peer, paginated
 *
 * `peerUin` is a string here because the IPC boundary stringifies bigints
 * (see `main/ipc/serde.ts`). The renderer treats them as opaque ids.
 *
 * Avatar comes from `https://thirdqq.qlogo.cn/g?b=sdk&nk=<uin>&s=0` —
 * no local caching for v0.
 */

import { useState, type ReactElement } from 'react';
import { trpc } from '../trpc/client';
import { useViewState } from '../state/view';
import { client } from '../trpc/client';

const PAGE_SIZE = 50;

export function MainView(): ReactElement {
  const peers = trpc.account.listPeers.useQuery();
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const openedUin = useViewState((s) => s.openedUin);
  const goTo = useViewState((s) => s.goTo);
  const setOpenedUin = useViewState((s) => s.setOpenedUin);

  const messages = trpc.account.listMessagesWithPeer.useQuery(
    {
      peerUin: selectedPeer ?? '0',
      limit: PAGE_SIZE,
      offset,
    },
    { enabled: selectedPeer !== null },
  );

  async function closeAccount(): Promise<void> {
    await client.bootstrap.closeAccount.mutate();
    setOpenedUin(null);
    goTo('bootstrap');
  }

  return (
    <main className="flex h-screen font-sans bg-background text-foreground overflow-hidden">
      <aside className="w-72 border-r border-border flex flex-col bg-secondary/30">
        <div className="p-4 border-b border-border bg-background/50 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold tracking-tight">weQ</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full font-medium uppercase tracking-wider">当前会话</span>
          </div>
          <div className="text-[11px] text-muted-foreground mb-2 px-1 font-medium">账号 (UIN): {openedUin}</div>
          <button 
            onClick={() => void closeAccount()}
            className="w-full px-3 py-1.5 text-xs bg-background border border-border text-foreground rounded-md shadow-sm hover:bg-accent transition-all active:scale-[0.98] font-medium"
          >
            退出当前账号
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {peers.isLoading && (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">正在同步好友列表…</p>
            </div>
          )}
          {peers.data && (
            <ul className="space-y-0.5">
              {peers.data.map((p) => (
                <li
                  key={p.peerUin}
                  onClick={() => {
                    setSelectedPeer(p.peerUin);
                    setOffset(0);
                  }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                    selectedPeer === p.peerUin 
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]' 
                      : 'hover:bg-accent/50 text-foreground/80 hover:text-foreground'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={`https://thirdqq.qlogo.cn/g?b=sdk&nk=${p.peerUin}&s=0`}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full bg-background object-cover border border-black/5"
                      onError={(e) => ((e.target as HTMLImageElement).classList.add('hidden'))}
                    />
                    {selectedPeer !== p.peerUin && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm truncate">{p.peerUin}</div>
                    <div className={`text-[11px] truncate ${selectedPeer === p.peerUin ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {p.msgCount} 条消息
                    </div>
                  </div>
                  <div className={`text-[10px] shrink-0 ${selectedPeer === p.peerUin ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                    {new Date(Number(p.lastSendTime) * 1000).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-w-0 bg-background relative">
        {selectedPeer === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-accent/5">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
               <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-sm font-medium italic">请从左侧选择一个会话开始浏览</p>
          </div>
        ) : (
          <>
            <header className="h-16 px-6 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="font-bold text-base">{selectedPeer}</div>
                <div className="h-4 w-px bg-border mx-1" />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                    disabled={offset === 0}
                    className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30 transition-colors"
                    title="查看较新消息"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button 
                    onClick={() => setOffset((o) => o + PAGE_SIZE)}
                    className="p-1.5 rounded-md hover:bg-accent transition-colors"
                    title="查看较旧消息"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>
              <div className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
                第 {Math.floor(offset / PAGE_SIZE) + 1} 页
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 bg-accent/5">
              {messages.isLoading && (
                 <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                 </div>
              )}
              {messages.data && (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">消息原文 (JSON 格式)</span>
                    <span className="text-[10px] text-muted-foreground/60 italic">当前页面显示 {messages.data.length} 条记录</span>
                  </div>
                  <pre className="whitespace-pre-wrap break-all text-[12px] font-mono bg-background shadow-md shadow-black/5 p-6 rounded-2xl border border-border/50 leading-relaxed text-foreground/80">
                    {JSON.stringify(messages.data, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2)}
                  </pre>
                  <div className="mt-8 text-center text-[11px] text-muted-foreground border-t border-border/50 pt-4 mb-10">
                    — 已显示本页全部内容 —
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function formatTime(secStr: string): string {
  return new Date(Number(secStr) * 1000).toLocaleString();
}
