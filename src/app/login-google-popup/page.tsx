'use client';

import React, { useState } from 'react';
import { useResumeStore } from '../../store/resumeStore';

export default function GoogleLoginPopup() {
  const loginUser = useResumeStore(state => state.loginUser);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);

  const handleSelectAccount = (name: string, email: string, avatarUrl: string) => {
    setLoadingAccount(email);
    setTimeout(() => {
      // Log the user in
      loginUser(name, email, avatarUrl);
      
      // Notify parent window to update state immediately
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', name, email, avatarUrl }, '*');
      }
      
      window.close();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-[448px] p-8 md:p-10 flex flex-col items-center">
        {/* Google Logo */}
        <div className="flex items-center gap-1.5 mb-6">
          <svg className="w-8 h-8" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-slate-800 mb-1.5">Sign in with Google</h1>
        <p className="text-sm text-slate-500 mb-8 text-center">to continue to <span className="font-semibold text-teal-600">ResuLocal</span></p>

        {/* Account List */}
        <div className="w-full flex flex-col gap-3">
          {[
            { name: 'Shibli Deutschland', email: 'shibli.deutschland@gmail.com', avatar: 'SD' },
            { name: 'Max Mustermann', email: 'max.mustermann@gmail.com', avatar: 'MM' },
            { name: 'John Doe', email: 'john.doe@gmail.com', avatar: 'JD' }
          ].map((acc) => {
            const isLoading = loadingAccount === acc.email;
            return (
              <button 
                key={acc.email}
                disabled={loadingAccount !== null}
                onClick={() => handleSelectAccount(acc.name, acc.email, `https://api.dicebear.com/7.x/initials/svg?seed=${acc.avatar}`)}
                className={`flex items-center gap-3.5 w-full p-3.5 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer text-left transition-all hover:bg-slate-50/80 active:bg-slate-100 ${loadingAccount && !isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {isLoading ? (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 flex-shrink-0">
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-800 text-teal-400 font-bold text-sm flex items-center justify-center border border-slate-700 shadow-inner flex-shrink-0">
                    {acc.avatar}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 leading-tight truncate">{acc.name}</p>
                  <p className="text-xs text-slate-500 leading-none mt-0.5 truncate">{acc.email}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 max-w-[280px]">
          To continue, Google will share your name, email address, and profile picture with ResuLocal.
        </div>
      </div>
    </div>
  );
}
