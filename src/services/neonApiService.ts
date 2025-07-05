import { User } from 'firebase/auth';

// Types
export interface DbPost {
  id: number;
  author_id: string;
  author_name: string;
  author_photo_url: string | null;
  content: string;
  image_url: string | null;
  created_at: Date;
  like_count: number;
  comment_count: number;
  tags: string[] | null;
}

export interface DbComment {
  id: number;
  post_id: number;
  author_id: string;
  author_name: string;
  author_photo_url: string | null;
  content: string;
  created_at: Date;
}

// In a real application, this would be an API endpoint
// For this demo, we'll use our direct Neon DB connection
// In production, you should use a server-side API for security
import { sql } from '../db/neon';

// Test connection
export const testConnection = async () => {
  try {
    const result = await sql`SELECT current_timestamp as time`;
    return { success: true, result };
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error };
  }
};

// Post Functions
export const createPost = async (
  content: string,
  user: User,
  imageUrl?: string,
  tags?: string[]
): Promise<number> => {
  try {
    const result = await sql`
      INSERT INTO posts (
        author_id, 
        author_name, 
        author_photo_url, 
        content, 
        image_url, 
        tags
      ) VALUES (
        ${user.uid}, 
        ${user.displayName || user.email?.split('@')[0] || 'Anonymous'}, 
        ${user.photoURL || null}, 
        ${content}, 
        ${imageUrl || null}, 
        ${tags || null}
      ) 
      RETURNING id
    `;
    
    return result[0].id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async (): Promise<DbPost[]> => {
  try {
    const posts = await sql<DbPost[]>`
      SELECT * FROM posts 
      ORDER BY created_at DESC
    `;
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
};

export const getPostsByTag = async (tag: string): Promise<DbPost[]> => {
  try {
    const posts = await sql<DbPost[]>`
      SELECT * FROM posts 
      WHERE ${tag} = ANY(tags)
      ORDER BY created_at DESC
    `;
    return posts;
  } catch (error) {
    console.error('Error getting posts by tag:', error);
    throw error;
  }
};

export const deletePost = async (postId: number, userId: string): Promise<boolean> => {
  try {
    // Only allow deletion if the user is the author
    const result = await sql`
      DELETE FROM posts 
      WHERE id = ${postId} AND author_id = ${userId}
      RETURNING id
    `;
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Comment Functions
export const createComment = async (
  postId: number,
  content: string,
  user: User
): Promise<number> => {
  try {
    // Start a transaction
    const result = await sql.begin(async (tx) => {
      // Insert the comment
      const commentResult = await tx`
        INSERT INTO comments (
          post_id,
          author_id,
          author_name,
          author_photo_url,
          content
        ) VALUES (
          ${postId},
          ${user.uid},
          ${user.displayName || user.email?.split('@')[0] || 'Anonymous'},
          ${user.photoURL || null},
          ${content}
        )
        RETURNING id
      `;
      
      // Update comment count on the post
      await tx`
        UPDATE posts
        SET comment_count = comment_count + 1
        WHERE id = ${postId}
      `;
      
      return commentResult;
    });
    
    return result[0].id;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

export const getCommentsByPost = async (postId: number): Promise<DbComment[]> => {
  try {
    const comments = await sql<DbComment[]>`
      SELECT * FROM comments
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `;
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
};

export const deleteComment = async (commentId: number, userId: string): Promise<boolean> => {
  try {
    // Start a transaction
    const result = await sql.begin(async (tx) => {
      // Get the comment to verify ownership and get post ID
      const comment = await tx`
        SELECT * FROM comments
        WHERE id = ${commentId} AND author_id = ${userId}
      `;
      
      if (comment.length === 0) {
        return [];
      }
      
      const postId = comment[0].post_id;
      
      // Delete the comment
      await tx`
        DELETE FROM comments
        WHERE id = ${commentId}
      `;
      
      // Update the post's comment count
      await tx`
        UPDATE posts
        SET comment_count = comment_count - 1
        WHERE id = ${postId}
      `;
      
      return comment;
    });
    
    return result.length > 0;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Like Functions
export const toggleLike = async (postId: number, userId: string): Promise<boolean> => {
  try {
    // Start a transaction
    const result = await sql.begin(async (tx) => {
      // Check if user already liked the post
      const existingLike = await tx`
        SELECT * FROM likes
        WHERE post_id = ${postId} AND user_id = ${userId}
      `;
      
      let isLiked = false;
      
      if (existingLike.length === 0) {
        // User hasn't liked the post yet, so add a like
        await tx`
          INSERT INTO likes (post_id, user_id)
          VALUES (${postId}, ${userId})
        `;
        
        // Increment like count
        await tx`
          UPDATE posts
          SET like_count = like_count + 1
          WHERE id = ${postId}
        `;
        
        isLiked = true;
      } else {
        // User already liked the post, so remove the like
        await tx`
          DELETE FROM likes
          WHERE post_id = ${postId} AND user_id = ${userId}
        `;
        
        // Decrement like count
        await tx`
          UPDATE posts
          SET like_count = like_count - 1
          WHERE id = ${postId}
        `;
        
        isLiked = false;
      }
      
      return isLiked;
    });
    
    return result;
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

export const checkIfUserLiked = async (postId: number, userId: string): Promise<boolean> => {
  try {
    const result = await sql`
      SELECT * FROM likes
      WHERE post_id = ${postId} AND user_id = ${userId}
    `;
    return result.length > 0;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    throw error;
  }
}; 