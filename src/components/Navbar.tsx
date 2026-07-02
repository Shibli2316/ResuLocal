'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Button, Popconfirm, Dropdown, message, MenuProps } from 'antd';
import { useResumeStore } from '../store/resumeStore';

export default function Navbar() {
  const router = useRouter();
  const { user, loginUser, logoutUser } = useResumeStore();

  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { name, email, avatarUrl } = event.data;
        loginUser(name, email, avatarUrl);
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [loginUser]);

  const handleGoogleLogin = () => {
    const width = 500;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/login-google-popup',
      'Google Sign-In',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (popup) {
      popup.focus();
    } else {
      message.error('Popup blocker active. Please allow popups for ResuLocal.');
    }
  };

  const handleLogout = () => {
    logoutUser();
    message.success('Successfully logged out of ResuLocal!');
    router.push('/');
  };

  const dropdownMenuItems: MenuProps['items'] = [
    {
      key: 'profile-info',
      label: (
        <div className="px-2 py-1.5 border-b border-slate-100 min-w-[160px]">
          <p className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</p>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    {
      key: 'dashboard',
      label: (
        <span className="text-xs font-semibold text-slate-700 hover:text-teal-600 block py-1" onClick={() => router.push('/')}>
          My Dashboard
        </span>
      ),
    },
    {
      key: 'logout',
      label: (
        <div className="pt-1.5 border-t border-slate-100">
          <Popconfirm
            title="Are you sure you want to log out?"
            onConfirm={handleLogout}
            okText="Yes, Logout"
            cancelText="Cancel"
            placement="bottomRight"
            okButtonProps={{ className: '!bg-red-500 hover:!bg-red-600 !border-0' }}
          >
            <Button 
              type="text" 
              danger 
              size="small"
              icon={<LogOut size={13} />} 
              className="w-full text-left !p-0 flex items-center gap-1.5 text-xs font-bold"
            >
              Log Out
            </Button>
          </Popconfirm>
        </div>
      ),
    }
  ];

  return (
    <nav className="backdrop-blur-md bg-slate-950/80 border-b border-slate-800/40 px-6 py-3.5 flex items-center justify-between text-white sticky top-0 z-50 shadow-sm shadow-black/10">
      {/* Brand Logo & Name */}
      <div 
        className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => router.push('/')}
      >
        <div className="relative flex items-center justify-center bg-gradient-to-tr from-teal-500 to-cyan-400 p-2 rounded-xl shadow-md shadow-teal-500/20">
          {/* Hybrid Locator Pin + CV document logo */}
          <svg className="w-5 h-5 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" fillOpacity="0.2" />
            <line x1="9" y1="7" x2="15" y2="7" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="9" y1="13" x2="13" y2="13" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            ResuLocal
          </span>
          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-slate-400 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800">
            Local First
          </span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          /* Logged In Dropdown */
          <Dropdown menu={{ items: dropdownMenuItems }} trigger={['click']} placement="bottomRight" arrow>
            <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-800/40 px-3 py-1.5 rounded-xl border border-slate-800/80 bg-slate-900/40 transition-colors">
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-teal-400 font-bold text-xs flex items-center justify-center border border-slate-700 shadow-inner">
                  {user.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-slate-200 hover:text-white transition-colors max-w-[120px] truncate">
                {user.name}
              </span>
            </div>
          </Dropdown>
        ) : (
          /* Login Button with Google Indicator */
          <Button 
            type="primary" 
            onClick={handleGoogleLogin}
            className="!bg-teal-500 hover:!bg-teal-400 !border-0 text-slate-950 font-bold text-xs flex items-center gap-2 h-9 px-4 rounded-xl shadow-md shadow-teal-500/10 hover:shadow-teal-500/20 active:scale-[0.98] transition-all"
          >
            {/* Google Icon */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.67-.35-1.37-.35-2.09z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Login with Google</span>
          </Button>
        )}
      </div>
    </nav>
  );
}
