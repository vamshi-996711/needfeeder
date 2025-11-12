import React, { useState } from 'react';
import { User, NGO, VerificationStatus } from '../../types';
import { loginUser, loginNgo } from '../../services/mockApiService';
import { Building, Users, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onLogin: (entity: User | NGO, type: 'user' | 'ngo') => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [role, setRole] = useState<'user' | 'ngo' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (role === 'user') {
      const user = loginUser(email, password);
      if (user) {
        onLogin(user, 'user');
      } else {
        setError('Invalid donor credentials. Please try again.');
      }
    } else if (role === 'ngo') {
      const ngo = loginNgo(email, password);
      if (ngo) {
        if (ngo.verificationStatus === VerificationStatus.Verified) {
          onLogin(ngo, 'ngo');
        } else {
          setError('Your NGO account is pending verification. You cannot log in until your account has been approved.');
        }
      } else {
        setError('Invalid NGO credentials. Please try again.');
      }
    }
  };

  const resetForm = () => {
      setEmail('');
      setPassword('');
      setError(null);
      setShowPassword(false);
  }

  const handleSetRole = (newRole: 'user' | 'ngo') => {
      resetForm();
      setRole(newRole);
  }
  
  const handleRoleChange = () => {
    resetForm();
    setRole(null);
  }

  return (
    <div className="flex flex-col items-center justify-center mt-10 sm:mt-20">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-on-surface mb-2">Welcome to Need Feeder</h1>
        <p className="text-center text-subtle-text mb-8">Connecting Donors with Charitable Causes.</p>
        
        {!role ? (
          <div className="space-y-4">
             <h2 className="text-lg font-semibold text-center text-on-surface">First, select your role:</h2>
            <button
              onClick={() => handleSetRole('user')}
              className="w-full flex items-center justify-center gap-3 text-lg font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Users /> I am a Donor
            </button>
            <button
              onClick={() => handleSetRole('ngo')}
              className="w-full flex items-center justify-center gap-3 text-lg font-semibold bg-secondary/10 text-secondary hover:bg-secondary hover:text-white p-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Building /> I represent an NGO
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-on-surface">
                  Login as a {role === 'user' ? 'Donor' : 'NGO'}
                </h2>
                <button onClick={handleRoleChange} className="text-sm text-primary hover:underline">
                  Change Role
                </button>
            </div>
            
            <form onSubmit={handleLoginAttempt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-subtle-text mb-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-gray-300 text-on-surface p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-subtle-text mb-1">Password</label>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-gray-300 text-on-surface p-2 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-subtle-text">
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
              
              {error && (
                <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0"/>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
              
              <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-focus transition-colors">
                Login
              </button>
            </form>

             <div className="text-xs text-subtle-text mt-4 bg-background p-3 rounded-lg">
                <h4 className="font-bold mb-1">Demo Credentials:</h4>
                {role === 'user' ? (
                    <p>Email: <span className="font-mono">akash@test.com</span>, Password: <span className="font-mono">password123</span></p>
                ) : (
                    <>
                    <p>Verified: <span className="font-mono">hope@test.com</span>, Pass: <span className="font-mono">password123</span></p>
                    <p>Unverified: <span className="font-mono">goodwill@test.com</span>, Pass: <span className="font-mono">password123</span></p>
                    </>
                )}
             </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;
