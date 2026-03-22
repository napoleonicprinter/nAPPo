import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import MapView from './components/MapView';
import CardView from './components/CardView';
import CalendarView from './components/CalendarView';
import ShoppingView from './components/ShoppingView';

const MainApp = () => {
  const { view } = useAppContext();

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {view === 'map' ? <MapView /> : 
         view === 'calendar' ? <CalendarView /> : 
         view === 'shopping' ? <ShoppingView /> : 
         <CardView />}
      </main>
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
