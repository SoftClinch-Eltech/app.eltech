import React, { useState } from 'react';
import { User } from '../../types';
import { initialUsers } from '../../data/sapMockData';
import { ShieldCheck, Lock, User as UserIcon, RefreshCw, KeyRound, Building2 } from 'lucide-react';


interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      setError('Please select or input a valid SAP Username');
      return;
    }

    const matchedUser = initialUsers.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (matchedUser) {
      if (matchedUser.status === 'Locked') {
        setError('This SAP user account is locked. Contact your Basis Team.');
        return;
      }
      onLoginSuccess(matchedUser);
    } else {
      // Allow general entry if they type a custom one
      const fallbackUser: User = {
        id: 'USR999',
        username: username,
        fullName: username.charAt(0).toUpperCase() + username.slice(1) + ' (Custom User)',
        email: `${username}@softclinch.com`,
        role: 'Accountant',
        department: 'General Ledger Team',
        permissions: {
          fb03: true,
          vf03: true,
          fbl3n: true,
          fbl5n: true,
          fbl1n: true,
          userMaster: false,
          settings: false,
        },
        status: 'Active',
        lastLogin: 'Just now',
      };
      onLoginSuccess(fallbackUser);
    }
  };

  const selectQuickUser = (user: User) => {
    setUsername(user.username);
    setPassword('demopass123');
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-[#FFFFFF] px-4 py-12 select-none">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#D9DEE6] shadow-xl overflow-hidden flex flex-col">
        {/* Card Header Banner */}
        <div className="bg-[#273B5E] text-white p-6 flex flex-col items-center justify-center text-center relative border-b border-[#D9DEE6]">
          
          <div className="mb-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-[#963F29] shadow-lg">
              <span className="font-sans font-black text-[#273B5E] text-2xl tracking-tighter select-none">E</span>
            </div>
          </div>
          <h2 className="font-sans font-extrabold text-base tracking-wider text-white uppercase leading-none">ELTECH APPLIANCES PRIVATE LIMITED</h2>

          <p className="text-slate-300 text-xs mt-3 font-sans font-medium">Enterprise Financial Reporting Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-[#963F29] border border-rose-200 rounded text-xs leading-relaxed font-sans font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold block">
              USERNAME
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-[#D9DEE6] rounded px-3 py-2 text-xs">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <input
                id="login-username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  const sanitizedValue = e.target.value.toLowerCase().replace(/ /g, '_');
                  setUsername(sanitizedValue);
                  setError('');
                }}
                className="bg-transparent outline-none w-full text-slate-800 font-sans font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold">
                PASSWORD
              </label>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-[#D9DEE6] rounded px-3 py-2 text-xs">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent outline-none w-full text-slate-800 font-mono tracking-widest"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            className="w-full bg-[#273B5E] hover:bg-[#3d5680] text-white p-2.5 rounded-lg font-sans font-semibold text-xs tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <span>LOG IN</span>
          </button>
        </form>


      </div>
    </div>
  );
};
