import React from 'react';
import { HeartHandshake, LogOut, User as UserIcon, Building, BadgeCheck } from 'lucide-react';
import { User, NGO } from '../types';

interface HeaderProps {
  user: User | NGO | null;
  userType: 'Donor' | 'NGO';
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, userType, onLogout }) => {
  return (
    <header className="bg-surface shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-on-surface">Need Feeder</span>
          </div>
          {user && (
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-sm">
                {userType === 'Donor' ? <UserIcon className="h-5 w-5 text-primary"/> : <Building className="h-5 w-5 text-primary"/>}
                <span className="font-medium hidden sm:inline">{user.name}</span>
                <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-full">{userType}</span>
                {userType === 'NGO' && (user as NGO).verificationStatus === 'Verified' && (
                  <span className="hidden sm:flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      <BadgeCheck size={12} />
                      Verified
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-subtle-text hover:text-primary transition-colors duration-200"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
                 <span className="text-sm font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
