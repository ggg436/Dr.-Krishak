import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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
import { useNeonPosts } from '@/hooks/useNeonPosts';

interface PostFormProps {
  onPostCreated?: () => void;
  selectedTag?: string;
}

const NeonPostForm: React.FC<PostFormProps> = ({ onPostCreated, selectedTag }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(selectedTag ? [selectedTag] : []);
  
  const { currentUser, openAuthModal } = useAuth();
  const { addPost } = useNeonPosts();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    
    if (!content.trim()) {
      toast.error("Post cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addPost(content, imageFile || undefined, tags.length > 0 ? tags : undefined);
      
      // Reset form
      setContent('');
      setImageFile(null);
      setImagePreview(null);
      setTags(selectedTag ? [selectedTag] : []);
      
      // Notify parent
      if (onPostCreated) {
        onPostCreated();
      }
      
      toast.success("Post created successfully");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput('');
    setShowTagDialog(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start mb-3">
          {currentUser?.photoURL && (
            <img 
              src={currentUser.photoURL} 
              alt="Profile" 
              className="w-10 h-10 rounded-full mr-3"
            />
          )}
          <textarea
            className="flex-1 p-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 dark:bg-gray-900"
            rows={3}
            placeholder={currentUser ? "What's on your mind?" : "Sign in to post"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={!currentUser || isSubmitting}
          />
        </div>
        
        {imagePreview && (
          <div className="relative mb-3">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-60 rounded-lg mx-auto"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
            >
              ×
            </button>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                #{tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-xs hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImageClick}
              disabled={!currentUser || isSubmitting}
            >
              <ImageIcon className="w-4 h-4 mr-1" />
              Photo
            </Button>
            
            <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!currentUser || isSubmitting}
                >
                  <TagIcon className="w-4 h-4 mr-1" />
                  Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a tag</DialogTitle>
                  <DialogDescription>
                    Tags help categorize your post and make it more discoverable.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter tag name"
                    className="flex-1"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={addTag}>Add Tag</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Button 
            type="submit" 
            disabled={!currentUser || !content.trim() || isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NeonPostForm; 