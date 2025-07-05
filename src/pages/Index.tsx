import React, { useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';

const Index = () => {
  // Listen for custom event to open auth modal
  useEffect(() => {
    const handleOpenAuthModal = (event: CustomEvent) => {
      const modal = event.detail?.tab || "register";
      // Find the header element and dispatch a click event on the appropriate button
      if (modal === "register") {
        const registerButton = document.querySelector("button.bg-zinc-900");
        registerButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      } else {
        const loginButton = document.querySelector("button.text-zinc-900.font-medium");
        loginButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    };

    // Add event listener
    document.addEventListener("open-auth-modal", handleOpenAuthModal as EventListener);

    // Clean up
    return () => {
      document.removeEventListener("open-auth-modal", handleOpenAuthModal as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
    </div>
  );
};

export default Index;
