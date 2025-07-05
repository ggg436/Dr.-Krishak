import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as neonService from '@/services/neonApiService';
import { DbPost } from '@/services/neonApiService';

export const useNeonPosts = (tag?: string) => {
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        let fetchedPosts: DbPost[];
        
        if (tag) {
          fetchedPosts = await neonService.getPostsByTag(tag);
        } else {
          fetchedPosts = await neonService.getPosts();
        }
        
        setPosts(fetchedPosts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load posts'));
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [tag]);

  const addPost = async (content: string, imageFile?: File, tags?: string[]) => {
    if (!currentUser) {
      throw new Error('User must be logged in to create a post');
    }

    try {
      // Upload image if provided and get URL
      let imageUrl: string | undefined;
      if (imageFile) {
        // For this demo, we'll just use a placeholder URL
        // In a real app, you would upload to storage and get the URL
        imageUrl = "https://via.placeholder.com/300";
      }

      // Create post
      const newPostId = await neonService.createPost(
        content,
        currentUser,
        imageUrl,
        tags
      );

      // Refresh posts after creating a new one
      const updatedPosts = tag
        ? await neonService.getPostsByTag(tag)
        : await neonService.getPosts();
      
      setPosts(updatedPosts);
      return newPostId;
    } catch (err) {
      console.error('Error adding post:', err);
      throw err;
    }
  };

  const deletePost = async (postId: number) => {
    if (!currentUser) {
      throw new Error('User must be logged in to delete a post');
    }

    try {
      const success = await neonService.deletePost(postId, currentUser.uid);
      
      if (success) {
        // Remove the deleted post from state
        setPosts(posts.filter(post => post.id !== postId));
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting post:', err);
      throw err;
    }
  };

  const likePost = async (postId: number) => {
    if (!currentUser) {
      throw new Error('User must be logged in to like a post');
    }

    try {
      const isLiked = await neonService.toggleLike(postId, currentUser.uid);
      
      // Update the post's like count in the local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            like_count: isLiked ? post.like_count + 1 : post.like_count - 1
          };
        }
        return post;
      }));
      
      return isLiked;
    } catch (err) {
      console.error('Error liking post:', err);
      throw err;
    }
  };

  const checkIfUserLikedPost = async (postId: number) => {
    if (!currentUser) {
      return false;
    }

    try {
      return await neonService.checkIfUserLiked(postId, currentUser.uid);
    } catch (err) {
      console.error('Error checking if user liked post:', err);
      return false;
    }
  };

  return { 
    posts, 
    loading, 
    error, 
    addPost, 
    deletePost, 
    likePost, 
    checkIfUserLikedPost 
  };
}; 