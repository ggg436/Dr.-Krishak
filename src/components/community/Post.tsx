import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Post as PostType,
  toggleLike, 
  checkUserLiked,
  deletePost
} from '@/services/communityService';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import CommentSection from './CommentSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
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

interface PostProps {
  post: PostType;
  onPostDeleted?: () => void;
}

const Post: React.FC<PostProps> = ({ post, onPostDeleted }) => {
  const { currentUser, openAuthModal } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Check if the current user has liked this post
  useEffect(() => {
    const checkLiked = async () => {
      if (currentUser && post.id) {
        try {
          const hasLiked = await checkUserLiked(post.id, currentUser.uid);
          setLiked(hasLiked);
        } catch (error) {
          console.error("Error checking like status:", error);
        }
      }
    };
    
    checkLiked();
  }, [currentUser, post.id]);
  
  const handleLikeToggle = async () => {
    if (!currentUser || !post.id) {
      openAuthModal('login');
      return;
    }
    
    try {
      // Optimistic update
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
      
      // Persist to database
      await toggleLike(post.id, currentUser.uid);
    } catch (error) {
      // Revert optimistic update on failure
      setLiked(liked);
      setLikeCount(likeCount);
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  };
  
  const handleCommentClick = () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    
    setShowComments(!showComments);
  };
  
  const handleDelete = async () => {
    if (!currentUser || !post.id) return;
    
    // Check if the user is the author of the post
    if (post.authorId !== currentUser.uid) {
      toast.error("You can only delete your own posts");
      return;
    }
    
    try {
      setLoading(true);
      await deletePost(post.id);
      toast.success("Post deleted successfully");
      if (onPostDeleted) onPostDeleted();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
    }
  };
  
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
    // If it's a Firestore timestamp, convert to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const isAuthor = currentUser && post.authorId === currentUser.uid;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {post.authorPhotoURL ? (
              <img src={post.authorPhotoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-medium">
                {post.authorName?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium">{post.authorName}</p>
            <p className="text-sm text-gray-500">
              {formatTimestamp(post.createdAt)}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setShowDeleteAlert(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your post and all associated comments.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-gray-800 whitespace-pre-line">
          {post.content}
        </p>
        
        {post.imageURL && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={post.imageURL} 
              alt="Post attachment" 
              className="w-full object-cover max-h-96" 
            />
          </div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center border-t border-b border-gray-100 py-2">
          <div className="flex space-x-4">
            <button 
              className={`flex items-center space-x-1 ${
                liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={handleLikeToggle}
            >
              <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              <span>Like {likeCount > 0 && `(${likeCount})`}</span>
            </button>
            
            <button 
              className="text-gray-500 flex items-center space-x-1 hover:text-blue-600"
              onClick={handleCommentClick}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Comment {post.commentCount > 0 && `(${post.commentCount})`}</span>
            </button>
            
            <button 
              className="text-gray-500 flex items-center space-x-1 hover:text-blue-600"
              onClick={() => {
                if (!currentUser) {
                  openAuthModal('login');
                  return;
                }
                toast.success("Post link copied to clipboard!");
              }}
            >
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
        
        {showComments && post.id && (
          <CommentSection postId={post.id} />
        )}
      </div>
    </div>
  );
};

export default Post; 