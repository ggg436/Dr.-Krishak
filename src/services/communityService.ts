import { db, storage } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  where,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "firebase/auth";

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  imageURL?: string;
  createdAt: Timestamp;
  likeCount: number;
  commentCount: number;
  tags?: string[];
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Timestamp;
}

export interface Like {
  postId: string;
  userId: string;
}

// Posts
export const createPost = async (
  content: string, 
  user: User, 
  imageFile?: File,
  tags?: string[]
): Promise<string> => {
  try {
    let imageURL;

    // Upload image if provided
    if (imageFile) {
      const storageRef = ref(storage, `community_images/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageURL = await getDownloadURL(snapshot.ref);
    }

    // Create post document
    const postData: Omit<Post, 'id'> = {
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorPhotoURL: user.photoURL || undefined,
      content,
      imageURL,
      createdAt: serverTimestamp() as Timestamp,
      likeCount: 0,
      commentCount: 0,
      tags: tags || []
    };

    const postRef = await addDoc(collection(db, "posts"), postData);
    return postRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getPosts = (callback: (posts: Post[]) => void): () => void => {
  const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  
  // Set up real-time listener
  const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    callback(posts);
  }, (error) => {
    console.error("Error getting posts:", error);
  });

  return unsubscribe;
};

export const getPostsByTag = (tag: string, callback: (posts: Post[]) => void): () => void => {
  const postsQuery = query(
    collection(db, "posts"), 
    where("tags", "array-contains", tag),
    orderBy("createdAt", "desc")
  );
  
  const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as Post);
    });
    callback(posts);
  }, (error) => {
    console.error("Error getting posts by tag:", error);
  });

  return unsubscribe;
};

export const deletePost = async (postId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "posts", postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// Comments
export const createComment = async (
  postId: string,
  content: string,
  user: User
): Promise<string> => {
  try {
    // Create comment document
    const commentData: Omit<Comment, 'id'> = {
      postId,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
      authorPhotoURL: user.photoURL || undefined,
      content,
      createdAt: serverTimestamp() as Timestamp
    };

    // Add comment to comments collection
    const commentRef = await addDoc(collection(db, "comments"), commentData);
    
    // Update post with incremented comment count
    await updateDoc(doc(db, "posts", postId), {
      commentCount: increment(1)
    });

    return commentRef.id;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const getComments = (postId: string, callback: (comments: Comment[]) => void): () => void => {
  const commentsQuery = query(
    collection(db, "comments"), 
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  
  const unsubscribe = onSnapshot(commentsQuery, (querySnapshot) => {
    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() } as Comment);
    });
    callback(comments);
  }, (error) => {
    console.error("Error getting comments:", error);
  });

  return unsubscribe;
};

export const deleteComment = async (commentId: string, postId: string): Promise<void> => {
  try {
    // Delete comment
    await deleteDoc(doc(db, "comments", commentId));
    
    // Update post with decremented comment count
    await updateDoc(doc(db, "posts", postId), {
      commentCount: increment(-1)
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Likes
export const toggleLike = async (postId: string, userId: string): Promise<boolean> => {
  try {
    // Check if the user already liked the post
    const likesQuery = query(
      collection(db, "likes"),
      where("postId", "==", postId),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(likesQuery);
    
    if (querySnapshot.empty) {
      // User hasn't liked the post yet - add a like
      await addDoc(collection(db, "likes"), {
        postId,
        userId,
        createdAt: serverTimestamp()
      });
      
      // Update post with incremented like count
      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(1)
      });
      
      return true; // Liked
    } else {
      // User already liked the post - remove the like
      const likeDoc = querySnapshot.docs[0];
      await deleteDoc(doc(db, "likes", likeDoc.id));
      
      // Update post with decremented like count
      await updateDoc(doc(db, "posts", postId), {
        likeCount: increment(-1)
      });
      
      return false; // Unliked
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const checkUserLiked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const likesQuery = query(
      collection(db, "likes"),
      where("postId", "==", postId),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(likesQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error("Error checking if user liked post:", error);
    throw error;
  }
};

export const getUserLikes = (userId: string, callback: (postIds: string[]) => void): () => void => {
  const likesQuery = query(
    collection(db, "likes"),
    where("userId", "==", userId)
  );
  
  const unsubscribe = onSnapshot(likesQuery, (querySnapshot) => {
    const postIds: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      postIds.push(data.postId);
    });
    callback(postIds);
  }, (error) => {
    console.error("Error getting user likes:", error);
  });

  return unsubscribe;
}; 