import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/services/communityService';
import { toast } from 'sonner';
import { ImageIcon, MapPinIcon, TagIcon } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PostFormProps {
  onPostCreated?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { currentUser, openAuthModal } = useAuth();
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be signed in to create a post");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }
    
    try {
      setLoading(true);
      await createPost(content, currentUser, image || undefined, tags.length > 0 ? tags : undefined);
      
      // Reset form
      setContent('');
      setImage(null);
      setImagePreview(null);
      setTags([]);
      
      toast.success("Post created successfully!");
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">?</span>
            </div>
          </div>
          <div className="flex-1">
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Share something with the community..."
              rows={3}
              onClick={() => openAuthModal('register')}
              readOnly
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2 text-gray-400">
                <span className="flex items-center"><ImageIcon className="h-4 w-4 mr-1" /> Photo</span>
                <span className="flex items-center"><TagIcon className="h-4 w-4 mr-1" /> Tags</span>
              </div>
              <Button 
                type="button"
                onClick={() => openAuthModal('register')}
              >
                Sign in to Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-blue-600 font-medium">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <textarea 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Share something with the community..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            
            {imagePreview && (
              <div className="mt-2 relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-32 w-auto rounded-md object-cover" 
                />
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  &times;
                </Button>
              </div>
            )}
            
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <button 
                      type="button" 
                      className="text-xs ml-1" 
                      onClick={() => handleRemoveTag(tag)}
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  ref={fileInputRef}
                />
                
                <button 
                  type="button" 
                  className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span>Photo</span>
                </button>
                
                <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
                  <DialogTrigger asChild>
                    <button 
                      type="button" 
                      className="text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                    >
                      <TagIcon className="h-5 w-5" />
                      <span>Tags</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Tags</DialogTitle>
                      <DialogDescription>
                        Add tags to help others find your post.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter tag name" 
                        value={tagInput} 
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddTag}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          #{tag}
                          <button 
                            type="button" 
                            className="text-xs ml-1" 
                            onClick={() => handleRemoveTag(tag)}
                          >
                            &times;
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button>Done</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Button 
                type="submit" 
                disabled={loading || !content.trim()}
              >
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm; 