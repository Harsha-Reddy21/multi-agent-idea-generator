import { SessionProvider, useSession } from './contexts/SessionContext';
import ChatPanel from './components/ChatPanel/ChatPanel';
import InfoPanels from './components/InfoPanels/InfoPanels';
import SessionStarter from './components/SessionStarter/SessionStarter';

function AppContent() {
  const { sessionId } = useSession();

  if (!sessionId) {
    return <SessionStarter />;
  }

  return (
    <div className="app-layout">
      <aside className="app-layout__panels">
        <InfoPanels />
      </aside>
      <main className="app-layout__chat">
        <ChatPanel />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}
