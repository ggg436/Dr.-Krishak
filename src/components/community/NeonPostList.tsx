import React, { useState } from 'react';
import { useNeonPosts } from '@/hooks/useNeonPosts';
import NeonPost from './NeonPost';
import NeonPostForm from './NeonPostForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface PostListProps {
  selectedTag?: string;
}

const NeonPostList: React.FC<PostListProps> = ({ selectedTag }) => {
  const { posts, loading, error } = useNeonPosts(selectedTag);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handlePostCreated = () => {
    // Force refresh by incrementing the key
    setRefreshKey(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6">
        <p className="text-red-600 dark:text-red-400">Error loading posts: {error.message}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => setRefreshKey(prev => prev + 1)}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div key={refreshKey} className="space-y-6">
      {selectedTag && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">Filtering by:</span>
            <Badge className="text-sm">{selectedTag}</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center"
            onClick={() => window.location.href = '/community'}
          >
            <X className="w-4 h-4 mr-1" /> Clear filter
          </Button>
        </div>
      )}

      <NeonPostForm 
        onPostCreated={handlePostCreated} 
        selectedTag={selectedTag} 
      />
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading posts...</p>
        </div>
      ) : posts.length > 0 ? (
        posts.map(post => (
          <NeonPost 
            key={post.id} 
            post={post} 
            onDelete={handlePostCreated} 
          />
        ))
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">
            {selectedTag 
              ? `No posts found with the tag "${selectedTag}". Be the first to create one!`
              : "No posts yet. Be the first to share something!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default NeonPostList; 