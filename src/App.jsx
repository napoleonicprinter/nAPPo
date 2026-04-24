import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import MapView from './components/MapView';
import CardView from './components/CardView';
import CalendarView from './components/CalendarView';
import ShoppingView from './components/ShoppingView';
import DevicePreviewer from './components/DevicePreviewer';
import AnnouncementModal from './components/AnnouncementModal';

const MainApp = () => {
  const { view, messagesData } = useAppContext();
  const [announcementMessage, setAnnouncementMessage] = useState(null);

  useEffect(() => {
    if (!messagesData || messagesData.length === 0) return;

    const now = new Date();
    // Strip time for clean date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find the first active message that hasn't exhausted its view count
    const activeMessage = messagesData.find(msg => {
      const from = new Date(msg.from + 'T00:00:00');
      const until = new Date(msg.until + 'T23:59:59');

      if (today < from || today > until) return false;

      const seenCount = parseInt(localStorage.getItem(`announcement_seen_${msg.id}`) || '0', 10);
      return seenCount < msg.maxShows;
    });

    if (activeMessage) {
      // Small delay so the app renders first
      const timer = setTimeout(() => setAnnouncementMessage(activeMessage), 800);
      return () => clearTimeout(timer);
    }
  }, [messagesData]);

  const handleCloseAnnouncement = () => {
    if (announcementMessage) {
      const key = `announcement_seen_${announcementMessage.id}`;
      const current = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(current + 1));
    }
    setAnnouncementMessage(null);
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {view === 'map' ? <MapView /> : 
         view === 'calendar' ? <CalendarView /> : 
         view === 'shopping' ? <ShoppingView /> : 
         view === 'preview' ? <DevicePreviewer /> :
         <CardView />}
      </main>

      {/* Auto-show announcement popup */}
      {announcementMessage && (
        <AnnouncementModal
          message={announcementMessage}
          onClose={handleCloseAnnouncement}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
