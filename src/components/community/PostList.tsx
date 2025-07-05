import React, { useState, useEffect } from 'react';
import { getPosts, Post as PostType, getPostsByTag } from '@/services/communityService';
import Post from './Post';
import { Skeleton } from '@/components/ui/skeleton';

interface PostListProps {
  selectedTag?: string;
}

const PostList: React.FC<PostListProps> = ({ selectedTag }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let unsubscribe: () => void;
    
    const fetchPosts = () => {
      setLoading(true);
      
      if (selectedTag) {
        unsubscribe = getPostsByTag(selectedTag, (fetchedPosts) => {
          setPosts(fetchedPosts);
          setLoading(false);
        });
      } else {
        unsubscribe = getPosts((fetchedPosts) => {
          setPosts(fetchedPosts);
          setLoading(false);
        });
      }
    };
    
    fetchPosts();
    
    // Clean up listener on unmount or when selectedTag changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [selectedTag]);
  
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex space-x-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          {selectedTag 
            ? `No posts with the tag #${selectedTag} yet` 
            : "No posts yet"}
        </h3>
        <p className="text-gray-600 mb-6">
          {selectedTag 
            ? `Be the first to post about #${selectedTag}!` 
            : "Be the first to share something with the community!"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Post 
          key={post.id} 
          post={post} 
          onPostDeleted={() => {
            // Just let the real-time listener update the UI
          }} 
        />
      ))}
    </div>
  );
};

export default PostList; 