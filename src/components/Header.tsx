
import React from 'react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="w-full px-8 py-6 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <h1 className="text-lg font-bold text-zinc-900 tracking-[3px]">
            DR. KRISHAK
          </h1>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-zinc-900 font-medium hover:text-zinc-600 transition-colors">
              Solutions
            </a>
            <a href="#" className="text-zinc-900 font-medium hover:text-zinc-600 transition-colors">
              Industries
            </a>
            <a href="#" className="text-zinc-900 font-medium hover:text-zinc-600 transition-colors">
              Fees
            </a>
            <a href="#" className="text-zinc-900 font-medium hover:text-zinc-600 transition-colors">
              About Rareblocks
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-6">
          <a href="#" className="text-zinc-900 font-medium hover:text-zinc-600 transition-colors">
            Sign in
          </a>
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg font-medium">
            Create free account
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
