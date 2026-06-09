/**
 * Top-level switch over the three views.
 *
 * Intentionally NOT using a router lib — we have three screens and
 * sequential navigation. `useViewState` from `state/view.ts` holds the
 * current view enum.
 */

import type { ReactElement } from 'react';
import { useViewState } from './state/view';
import { BootstrapView } from './views/BootstrapView';
import { PickAccountView } from './views/PickAccountView';
import { MainView } from './views/MainView';

export default function App(): ReactElement {
  const view = useViewState((s) => s.view);
  if (view === 'bootstrap') return <BootstrapView />;
  if (view === 'pick-account') return <PickAccountView />;
  return <MainView />;
}
