import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import NeonPostList from '@/components/community/NeonPostList';

const NeonCommunity: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag') || undefined;

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Connect with others, share ideas, and join the conversation.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <NeonPostList selectedTag={selectedTag} />
      </div>
    </div>
  );
};

export default NeonCommunity; 