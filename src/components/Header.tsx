import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const { currentUser, logout } = useAuth();

  const handleOpenLoginModal = () => {
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const handleOpenRegisterModal = () => {
    setAuthModalTab("register");
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className="w-full px-8 py-6 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <h1 className="text-lg font-bold text-zinc-900 tracking-[3px]">
            <Link to="/" className="hover:text-zinc-700">DR. KRISHAK</Link>
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
            <Link to="/community" className="text-zinc-900 font-medium hover:text-blue-600 transition-colors">
              Community
            </Link>
            <Link to="/neon-community" className="text-zinc-900 font-medium hover:text-green-600 transition-colors">
              Neon Community
            </Link>
            <Link to="/neon-test" className="text-zinc-900 font-medium hover:text-purple-600 transition-colors">
              Neon Test
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-6">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-zinc-700">
                {currentUser.email}
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-zinc-200 text-zinc-900 hover:bg-zinc-100"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <>
              <button 
                onClick={handleOpenLoginModal} 
                className="text-zinc-900 font-medium hover:text-zinc-600 transition-colors"
              >
                Sign in
              </button>
              <Button 
                onClick={handleOpenRegisterModal}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg font-medium"
              >
                Create free account
              </Button>
            </>
          )}
        </div>
      </div>

      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
        defaultTab={authModalTab} 
      />
    </header>
  );
};

export default Header;
