import React from 'react';
import { TopNav } from '../nav/TopNav';
import { BUILD_VERSION } from '../../buildInfo';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-border py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-1">
          <div>
            © 2026. Built with love using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
          <div className="text-xs opacity-60">
            Build: {BUILD_VERSION}
          </div>
        </div>
      </footer>
    </div>
  );
}
