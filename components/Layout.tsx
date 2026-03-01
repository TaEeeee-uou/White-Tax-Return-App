import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Settings,
  FileText,
  History,
  Tag,
  ChevronRight,
  Menu,
  ChevronLeft,
  Calculator
} from 'lucide-react';
import { useUser } from '../UserContext';

interface LayoutProps {
  children: React.ReactNode;
  variant?: 'sidebar' | 'header';
}

export const BackButton = ({ className = "" }: { className?: string }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors mb-4 ${className}`}
    >
      <ChevronLeft size={20} />
      <span className="text-sm font-medium">戻る</span>
    </button>
  );
};

const SidebarLink = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`
      }
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </NavLink>
  );
};

const HeaderLink = ({ to, label, isActiveLink }: { to: string; label: string; isActiveLink?: boolean }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-medium leading-normal transition-colors ${isActive || isActiveLink
          ? 'text-primary font-bold border-b-2 border-primary pb-1'
          : 'text-gray-600 hover:text-primary'
        }`
      }
    >
      {label}
    </NavLink>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children, variant = 'sidebar' }) => {
  const location = useLocation();
  const { profile } = useUser();

  // Header Variant (Income/Expense Input Screens)
  if (variant === 'header') {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background-light">
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
          <NavLink to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="text-primary">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
              </svg>
            </div>
            <h2 className="text-gray-900 text-lg font-bold">白色申告アプリ</h2>
          </NavLink>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <HeaderLink to="/settings" label="基本情報" />
              <HeaderLink to="/income" label="収入" isActiveLink={location.pathname === '/income'} />
              <HeaderLink to="/expense" label="経費" isActiveLink={location.pathname === '/expense'} />
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs font-bold">自動保存</span>
            </div>
          </div>
        </header>
        <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    );
  }

  // Sidebar Variant (Dashboard, History, etc.)
  return (
    <div className="min-h-screen flex w-full bg-background-light">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400"></div>
          <div>
            <h1 className="text-gray-900 font-bold">{profile.name}</h1>
            <p className="text-gray-500 text-sm">{profile.job}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          <SidebarLink to="/" icon={LayoutDashboard} label="ダッシュボード" />
          <SidebarLink to="/income" icon={TrendingUp} label="収入入力" />
          <SidebarLink to="/expense" icon={TrendingDown} label="支出入力" />
          <SidebarLink to="/depreciation" icon={Calculator} label="減価償却費" />
          <SidebarLink to="/history" icon={History} label="過去の履歴" />
          <SidebarLink to="/preview" icon={FileText} label="収支内訳書" />
          <SidebarLink to="/categories" icon={Tag} label="費目カテゴリ管理" />
          <SidebarLink to="/settings" icon={Settings} label="設定" />
        </nav>
      </aside>

      <main className="flex-1 lg:ml-64 p-4 md:p-8 min-h-screen">
        <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20"></div>
            <span className="font-bold">{profile.name}</span>
          </div>
          <button className="p-2"><Menu /></button>
        </div>
        {children}
      </main>
    </div>
  );
};