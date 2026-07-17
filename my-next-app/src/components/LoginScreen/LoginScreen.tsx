import React, { useState } from 'react';
import { User } from '../../types';
import { initialUsers } from '../../data/sapMockData';
import { ShieldCheck, Lock, User as UserIcon, RefreshCw, KeyRound, Building2 } from 'lucide-react';
import { SoftClinchLogo } from '../CommonUI/CommonUI';

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
          <div className="absolute right-4 top-4 bg-slate-800 text-amber-500 font-mono text-[9px] px-2 py-0.5 rounded font-bold border border-slate-700">
            TLS SECURE
          </div>
          <div className="mb-4">
            <SoftClinchLogo darkBg={true} size="lg" hideText={true} />
          </div>
          <h2 className="font-sans font-bold text-lg tracking-tight leading-tight">Softclinch Consult Services</h2>
          <p className="text-slate-350 text-xs mt-1">Enterprise Financial Reporting Portal</p>
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
              SAP GUI USERNAME / EMAIL
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-[#D9DEE6] rounded px-3 py-2 text-xs">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <input
                id="login-username"
                type="text"
                placeholder="sap_arch_softclinch"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="bg-transparent outline-none w-full text-slate-800 font-sans font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider font-mono text-slate-500 font-bold">
                SYSTEM PASSWORD
              </label>
              <button
                type="button"
                onClick={() => alert('Basis password reset instructions have been dispatched to your email.')}
                className="text-[10px] text-[#963F29] hover:underline font-medium"
              >
                Forgot?
              </button>
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

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                id="login-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="rounded border-[#D9DEE6] text-[#273B5E] focus:ring-[#273B5E]"
              />
              <span className="font-sans">Remember Client 800</span>
            </label>
            <span className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
              <Building2 className="w-3 h-3 text-slate-300" />
              System S4P-12A
            </span>
          </div>

          {/* Submit Button */}
          <button
            id="btn-login-submit"
            type="submit"
            className="w-full bg-[#273B5E] hover:bg-[#3d5680] text-white p-2.5 rounded-lg font-sans font-semibold text-xs tracking-wide transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AUTHENTICATE & LOG IN</span>
          </button>
        </form>

        {/* Quick Credentials Preset (Gives exact luxury UX to check roles) */}
        <div className="bg-[#FFFFFF] p-4 border-t border-[#D9DEE6] space-y-2.5">
          <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold block text-center">
            Quick-Fill Operator Roles
          </span>
          <div className="grid grid-cols-2 gap-2">
            {initialUsers.map((u) => (
              <button
                key={u.id}
                id={`btn-quickfill-${u.username}`}
                type="button"
                onClick={() => selectQuickUser(u)}
                className="text-[10px] bg-white hover:bg-slate-50 border border-[#D9DEE6] rounded-md p-2 text-left hover:border-[#273B5E] transition-colors flex flex-col gap-0.5 group"
              >
                <span className="font-semibold text-slate-700 group-hover:text-[#273B5E] font-sans truncate">
                  {u.fullName.split(' ')[2] || u.fullName.split(' ')[1] || u.fullName}
                </span>
                <span className="text-[9px] text-slate-400 font-mono italic">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
