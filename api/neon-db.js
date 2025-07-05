// This file would typically be used with a server framework like Express
// For demonstration purposes, we're creating a standalone file

const { neon } = require('@neondatabase/serverless');

// Connection string
const connectionString = 'postgresql://neondb_owner:npg_aWyRwHeT41rV@ep-misty-bird-a8emrqlr-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require';

// Create SQL client
const sql = neon(connectionString);

// Handler for API requests
async function handleRequest(req, res) {
  try {
    // Parse the request body
    const { action, params } = req.body;
    
    // Handle different actions
    switch (action) {
      case 'test':
        return await handleTestConnection();
      case 'getPosts':
        return await handleGetPosts();
      case 'createPost':
        return await handleCreatePost(params);
      case 'getComments':
        return await handleGetComments(params);
      case 'createComment':
        return await handleCreateComment(params);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('API error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle test connection
async function handleTestConnection() {
  try {
    const result = await sql`SELECT current_timestamp as time`;
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Connection test failed:', error);
    throw error;
  }
}

// Handle get posts
async function handleGetPosts() {
  try {
    const posts = await sql`
      SELECT * FROM posts 
      ORDER BY created_at DESC
    `;
    return {
      success: true,
      posts
    };
  } catch (error) {
    console.error('Error getting posts:', error);
    throw error;
  }
}

// Handle create post
async function handleCreatePost(params) {
  try {
    const { authorId, authorName, authorPhotoURL, content, imageURL, tags } = params;
    
    const result = await sql`
      INSERT INTO posts (
        author_id, 
        author_name, 
        author_photo_url, 
        content, 
        image_url, 
        tags
      ) VALUES (
        ${authorId}, 
        ${authorName}, 
        ${authorPhotoURL || null}, 
        ${content}, 
        ${imageURL || null}, 
        ${tags || null}
      ) 
      RETURNING id
    `;
    
    return {
      success: true,
      postId: result[0].id
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Handle get comments
async function handleGetComments(params) {
  try {
    const { postId } = params;
    
    const comments = await sql`
      SELECT * FROM comments
      WHERE post_id = ${postId}
      ORDER BY created_at ASC
    `;
    
    return {
      success: true,
      comments
    };
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}

// Handle create comment
async function handleCreateComment(params) {
  try {
    const { postId, authorId, authorName, authorPhotoURL, content } = params;
    
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
          ${authorId},
          ${authorName},
          ${authorPhotoURL || null},
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
    
    return {
      success: true,
      commentId: result[0].id
    };
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

// Export for use with a server framework
module.exports = {
  handleRequest,
  handleTestConnection,
  handleGetPosts,
  handleCreatePost,
  handleGetComments,
  handleCreateComment
}; 