import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import { useNeonComments } from '@/hooks/useNeonComments';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CommentSectionProps {
  postId: number;
}

const NeonCommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const { currentUser, openAuthModal } = useAuth();
  const { comments, loading, addComment, deleteComment } = useNeonComments(postId);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment(commentText);
      setCommentText('');
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (commentToDelete === null) return;
    
    try {
      await deleteComment(commentToDelete);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t">
      <form onSubmit={handleSubmitComment} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder={currentUser ? "Write a comment..." : "Sign in to comment"}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-grow p-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={!currentUser || isSubmitting}
        />
        <Button 
          type="submit"
          size="icon"
          disabled={!currentUser || !commentText.trim() || isSubmitting}
          variant="default"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {loading ? (
        <div className="text-center py-4">Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start gap-2 p-2">
              {comment.author_photo_url ? (
                <img 
                  src={comment.author_photo_url} 
                  alt={comment.author_name} 
                  className="w-8 h-8 rounded-full" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span>{comment.author_name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-grow">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                  <div className="font-medium text-sm">{comment.author_name}</div>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </div>
              </div>
              
              {currentUser && comment.author_id === currentUser.uid && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCommentToDelete(comment.id)}
                  className="h-6 w-6"
                >
                  <Trash2 className="h-3 w-3 text-gray-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">No comments yet</div>
      )}

      <AlertDialog open={commentToDelete !== null} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NeonCommentSection; 