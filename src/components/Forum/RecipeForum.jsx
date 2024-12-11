import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment,
  arrayUnion,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./Forum.css";

const RecipeForum = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const { currentUser } = useAuth();
  const [recipeName, setRecipeName] = useState("");
  // Add new states for comments
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    fetchRecipePosts();
  }, [recipeId]);

  const fetchRecipePosts = async () => {
    try {
      const q = query(
        collection(db, "forum_posts"),
        where("recipeId", "==", recipeId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);

      if (postsData.length > 0) {
        setRecipeName(postsData[0].recipeName);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      await addDoc(collection(db, "forum_posts"), {
        content: newPost,
        userId: currentUser.uid,
        userName: currentUser.email,
        recipeId: recipeId,
        recipeName: recipeName,
        category: "recipes",
        createdAt: serverTimestamp(),
        likes: 0,
        votes: {},
        comments: [],
      });
      setNewPost("");
      fetchRecipePosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleVote = async (postId, isUpvote) => {
    try {
      const postRef = doc(db, "forum_posts", postId);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();

      const currentVotes = postData.votes || {};
      const previousVote = currentVotes[currentUser.uid];

      if (previousVote === undefined) {
        await updateDoc(postRef, {
          likes: increment(isUpvote ? 1 : -1),
          votes: {
            ...currentVotes,
            [currentUser.uid]: isUpvote,
          },
        });
      } else if (previousVote !== isUpvote) {
        await updateDoc(postRef, {
          likes: increment(isUpvote ? 2 : -2),
          votes: {
            ...currentVotes,
            [currentUser.uid]: isUpvote,
          },
        });
      }
      fetchRecipePosts();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const buildCommentTree = (comments) => {
    if (!comments) return [];

    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = {
        ...comment,
        replies: [],
      };
    });

    comments.forEach((comment) => {
      if (comment.parentId) {
        const parentComment = commentMap[comment.parentId];
        if (parentComment) {
          parentComment.replies.push(commentMap[comment.id]);
        } else {
          rootComments.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const handleComment = async (
    postId,
    parentComment = null,
    replyContent = null
  ) => {
    const commentContent = parentComment ? replyContent : commentText[postId];
    if (!commentContent?.trim()) return;

    try {
      const postRef = doc(db, "forum_posts", postId);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();

      const newComment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: commentContent.trim(),
        userId: currentUser.uid,
        userName: currentUser.email,
        createdAt: new Date().toISOString(),
        parentId: parentComment ? parentComment.id : null,
        replyTo: parentComment ? parentComment.userName : null,
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
      });

      // Create notification for post owner if it's a new comment
      if (!parentComment && postData.userId !== currentUser.uid) {
        await addDoc(collection(db, "notifications"), {
          recipientId: postData.userId,
          senderId: currentUser.uid,
          senderName: currentUser.email,
          type: "comment",
          postId,
          recipeName: recipeName,
          content: commentContent.trim(),
          createdAt: serverTimestamp(),
          read: false,
        });
      }

      // Create notification for comment owner if it's a reply
      if (parentComment && parentComment.userId !== currentUser.uid) {
        await addDoc(collection(db, "notifications"), {
          recipientId: parentComment.userId,
          senderId: currentUser.uid,
          senderName: currentUser.email,
          type: "reply",
          postId,
          recipeName: recipeName,
          content: commentContent.trim(),
          createdAt: serverTimestamp(),
          read: false,
        });
      }

      if (!parentComment) {
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
      }

      fetchRecipePosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (postId, commentToDelete) => {
    if (commentToDelete.userId !== currentUser.uid) return;

    try {
      const postRef = doc(db, "forum_posts", postId);
      const postDoc = await getDoc(postRef);
      const currentComments = postDoc.data().comments || [];

      // Helper function to get all reply IDs recursively
      const getAllReplyIds = (commentId) => {
        const replyIds = new Set();
        currentComments.forEach((comment) => {
          if (comment.parentId === commentId) {
            replyIds.add(comment.id);
            // Recursively get replies to this reply
            getAllReplyIds(comment.id).forEach((id) => replyIds.add(id));
          }
        });
        return Array.from(replyIds);
      };

      // Get all reply IDs for the comment being deleted
      const replyIds = getAllReplyIds(commentToDelete.id);

      // Filter out the comment and all its nested replies
      const updatedComments = currentComments.filter(
        (comment) =>
          comment.id !== commentToDelete.id && !replyIds.includes(comment.id)
      );

      await updateDoc(postRef, {
        comments: updatedComments,
      });

      fetchRecipePosts();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const CommentThread = ({ comment, postId, level = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");

    return (
      <div className={`comment-thread level-${level}`} key={comment.id}>
        <div className="comment">
          <div className="comment-header">
            <div className="comment-author-section">
              {comment.replyTo ? (
                <span className="reply-to">
                  {comment.userName}
                  <span className="reply-to-arrow">→</span>
                  {comment.replyTo}
                </span>
              ) : (
                <span className="comment-author">{comment.userName}</span>
              )}
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            {comment.userId === currentUser.uid && (
              <button
                onClick={() => handleDeleteComment(postId, comment)}
                className="delete-comment-btn"
                title="Delete comment"
              >
                🗑️
              </button>
            )}
          </div>
          <div className="comment-text">{comment.text}</div>
          <div className="comment-actions">
            <button
              className="reply-btn"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
          </div>

          {isReplying && (
            <div className="reply-form">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${comment.userName}...`}
                className="comment-input"
              />
              <div className="reply-actions">
                <button
                  onClick={() => {
                    if (replyText.trim()) {
                      handleComment(postId, comment, replyText);
                      setIsReplying(false);
                      setReplyText("");
                    }
                  }}
                  className="comment-submit-btn"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyText("");
                  }}
                  className="comment-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                postId={postId}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="recipe-forum-container">
      <div className="recipe-forum-header">
        <Link to="/forum" className="back-button">
          ← Back to Forum
        </Link>
        <h1>{recipeName || "Recipe"} Discussion</h1>
      </div>

      <div className="recipe-card-preview">
        <div className="recipe-preview-info">
          <h2 className="recipe-title">{recipeName}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmitPost} className="post-form">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts about this recipe..."
          className="post-input"
        />
        <button type="submit" className="post-btn">
          Post
        </button>
      </form>

      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="forum-post">
            <div className="post-header">
              <span className="post-author">{post.userName}</span>
              <span className="post-date">
                {post.createdAt?.toDate().toLocaleDateString()}
              </span>
            </div>
            <div className="post-content">{post.content}</div>
            <div className="post-footer">
              <div className="vote-buttons">
                <button
                  className={`vote-btn upvote ${
                    post.votes?.[currentUser.uid] === true ? "active" : ""
                  }`}
                  onClick={() => handleVote(post.id, true)}
                  disabled={post.votes?.[currentUser.uid] === true}
                >
                  👍
                </button>
                <span className="vote-count">{post.likes || 0}</span>
                <button
                  className={`vote-btn downvote ${
                    post.votes?.[currentUser.uid] === false ? "active" : ""
                  }`}
                  onClick={() => handleVote(post.id, false)}
                  disabled={post.votes?.[currentUser.uid] === false}
                >
                  👎
                </button>
              </div>
              <button
                className="comment-btn"
                onClick={() => toggleComments(post.id)}
              >
                💬 {post.comments?.length || 0}
              </button>
            </div>

            {showComments[post.id] && (
              <div className="comments-section">
                <div className="comments-list">
                  {buildCommentTree(post.comments || []).map((comment) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      postId={post.id}
                      level={0}
                    />
                  ))}
                </div>
                <div className="add-comment">
                  <textarea
                    value={commentText[post.id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    placeholder="Write a comment..."
                    className="comment-input"
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    className="comment-submit-btn"
                  >
                    Comment
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeForum;
