import type { ReactNode } from 'react';
import '../styles/layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout-container">
      <header className="app-header">
        <h1 className="app-title">Chat App</h1>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
};
