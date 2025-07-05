import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
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
import { Badge } from "@/components/ui/badge";
import { DbPost } from '@/services/neonDbService';
import { useNeonPosts } from '@/hooks/useNeonPosts';
import NeonCommentSection from './NeonCommentSection';

interface PostProps {
  post: DbPost;
  onDelete?: () => void;
}

const NeonPost: React.FC<PostProps> = ({ post, onDelete }) => {
  const { currentUser, openAuthModal } = useAuth();
  const { deletePost, likePost, checkIfUserLikedPost } = useNeonPosts();
  const [showComments, setShowComments] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(post.like_count);

  // Check if the user has liked this post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (currentUser) {
        const liked = await checkIfUserLikedPost(post.id);
        setIsLiked(liked);
      }
    };
    
    checkLikeStatus();
  }, [currentUser, post.id, checkIfUserLikedPost]);

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      setIsDeleteDialogOpen(false);
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    try {
      // Optimistic UI update
      setIsLiked(prevIsLiked => !prevIsLiked);
      setOptimisticLikeCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      
      // Actual API call
      const newIsLiked = await likePost(post.id);
      
      // Correct the state if the API result is different from our prediction
      if (newIsLiked !== isLiked) {
        setIsLiked(newIsLiked);
        setOptimisticLikeCount(newIsLiked ? post.like_count + 1 : post.like_count);
      }
    } catch (error) {
      // Revert to original state on error
      setIsLiked(isLiked);
      setOptimisticLikeCount(post.like_count);
      console.error("Error toggling like:", error);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCommentClick = () => {
    if (!currentUser) {
      openAuthModal('login');
    } else {
      setShowComments(true);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-center mb-3">
          {post.author_photo_url ? (
            <img 
              src={post.author_photo_url} 
              alt={post.author_name} 
              className="w-10 h-10 rounded-full mr-3" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
              <span className="text-xl">{post.author_name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h3 className="font-medium">{post.author_name}</h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>

          {currentUser && post.author_id === currentUser.uid && (
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-auto"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-5 w-5 text-gray-500" />
            </Button>
          )}
        </div>

        <p className="whitespace-pre-wrap mb-3">{post.content}</p>

        {post.image_url && (
          <div className="my-3">
            <img 
              src={post.image_url} 
              alt="Post content" 
              className="rounded-md max-h-96 mx-auto"
            />
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-between text-sm text-gray-500 mt-3">
          <div>
            {optimisticLikeCount > 0 && (
              <span className="flex items-center">
                <ThumbsUp className="h-4 w-4 inline mr-1 fill-current text-blue-500" /> 
                {optimisticLikeCount}
              </span>
            )}
          </div>
          <div>
            {post.comment_count > 0 && (
              <span>{post.comment_count} comments</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t flex justify-between py-2">
        <Button 
          variant="ghost" 
          className="flex-1 flex items-center justify-center"
          onClick={handleToggleLike}
        >
          <ThumbsUp className={`h-4 w-4 mr-2 ${isLiked ? 'fill-blue-500 text-blue-500' : ''}`} /> 
          Like
        </Button>

        <Button 
          variant="ghost" 
          className="flex-1 flex items-center justify-center"
          onClick={handleCommentClick}
        >
          <MessageSquare className="h-4 w-4 mr-2" /> 
          Comment
        </Button>
      </CardFooter>

      {showComments && <NeonCommentSection postId={post.id} />}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default NeonPost; 