import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Comment as CommentType,
  getComments, 
  createComment,
  deleteComment
} from '@/services/communityService';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { currentUser, openAuthModal } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Set up real-time listener for comments
    const unsubscribe = getComments(postId, (updatedComments) => {
      setComments(updatedComments);
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [postId]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      await createComment(postId, newComment, currentUser);
      setNewComment('');
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    
    try {
      await deleteComment(commentId, postId);
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };
  
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    // If it's a Firestore timestamp, convert to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  return (
    <div className="mt-4">
      {/* Comment form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="flex items-start space-x-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-medium">
                {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 bg-gray-100 rounded-2xl p-2">
            <textarea
              className="w-full bg-transparent resize-none border-none focus:ring-0 text-sm"
              placeholder="Write a comment..."
              rows={1}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="sm"
                disabled={loading || !newComment.trim()}
                className="mt-1"
              >
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-500">Sign in to join the conversation</p>
          <Button size="sm" onClick={() => openAuthModal('login')}>Sign in</Button>
        </div>
      )}
      
      {/* Comments list - visible to everyone */}
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center my-4">
          No comments yet. {currentUser ? "Be the first to comment!" : "Sign in to be the first to comment!"}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                {comment.authorPhotoURL ? (
                  <img src={comment.authorPhotoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-600 font-medium">
                    {comment.authorName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl p-3 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {comment.authorName}
                      </p>
                      <p className="text-gray-800 text-sm mt-1">
                        {comment.content}
                      </p>
                    </div>
                    
                    {currentUser && comment.authorId === currentUser.uid && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => comment.id && handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 ml-2">
                  {formatTimestamp(comment.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection; 