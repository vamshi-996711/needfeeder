import React, { useState, useEffect, useCallback } from 'react';
import LoginView from './components/views/LoginView';
import DonorDashboard from './components/views/DonorDashboard';
import NgoDashboard from './components/views/NgoDashboard';
import { User, NGO } from './types';
import Header from './components/Header';
import { HeartHandshake } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentNgo, setCurrentNgo] = useState<NGO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('need-feeder-user');
    localStorage.removeItem('need-feeder-ngo');
    setCurrentUser(null);
    setCurrentNgo(null);
  }, []);
  
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('need-feeder-user');
      const storedNgo = localStorage.getItem('need-feeder-ngo');

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else if (storedNgo) {
        setCurrentNgo(JSON.parse(storedNgo));
      }
    } catch (error) {
      console.error("Failed to parse user/ngo from localStorage", error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);


  const handleLogin = (entity: User | NGO, type: 'user' | 'ngo') => {
    if (type === 'user') {
      const user = entity as User;
      localStorage.setItem('need-feeder-user', JSON.stringify(user));
      setCurrentUser(user);
      setCurrentNgo(null);
    } else {
      const ngo = entity as NGO;
      localStorage.setItem('need-feeder-ngo', JSON.stringify(ngo));
      setCurrentNgo(ngo);
      setCurrentUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <HeartHandshake className="w-16 h-16 text-primary animate-pulse" />
          <p className="text-on-surface text-lg">Loading Need Feeder...</p>
        </div>
      </div>
    );
  }

  const activeUser = currentUser || currentNgo;
  const userType = currentUser ? 'Donor' : (currentNgo ? 'NGO' : '');

  return (
    <div className="min-h-screen bg-background font-sans text-on-surface">
      <Header 
        user={activeUser}
        userType={userType as 'Donor' | 'NGO'}
        onLogout={handleLogout} 
      />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {!currentUser && !currentNgo ? (
          <LoginView onLogin={handleLogin} />
        ) : currentUser ? (
          <DonorDashboard user={currentUser} />
        ) : currentNgo ? (
          <NgoDashboard ngo={currentNgo} />
        ) : null}
      </main>
    </div>
  );
};

export default App;
