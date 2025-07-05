import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as neonService from '@/services/neonApiService';
import { DbComment } from '@/services/neonApiService';

export const useNeonComments = (postId: number) => {
  const [comments, setComments] = useState<DbComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const fetchedComments = await neonService.getCommentsByPost(postId);
        setComments(fetchedComments);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load comments'));
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const addComment = async (content: string) => {
    if (!currentUser) {
      throw new Error('User must be logged in to add a comment');
    }

    try {
      // Create comment
      await neonService.createComment(postId, content, currentUser);

      // Refresh comments
      const updatedComments = await neonService.getCommentsByPost(postId);
      setComments(updatedComments);
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!currentUser) {
      throw new Error('User must be logged in to delete a comment');
    }

    try {
      const success = await neonService.deleteComment(commentId, currentUser.uid);
      
      if (success) {
        // Remove the deleted comment from state
        setComments(comments.filter(comment => comment.id !== commentId));
      }
      
      return success;
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment
  };
}; 