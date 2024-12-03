import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  arrayUnion,
  increment,
  serverTimestamp,
  getDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./Forum.css";
import { Link } from "react-router-dom";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const { currentUser } = useAuth();

  const [recipePosts, setRecipePosts] = useState([]);

  const categories = [
    { id: "all", label: "All Posts" },
    { id: "recipes", label: "Recipe Discussions" },
  ];

  useEffect(() => {
    fetchPosts();
    if (selectedCategory === "recipes") {
      fetchRecipePosts();
    }
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const q = query(
        collection(db, "forum_posts"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (selectedCategory !== "all") {
        setPosts(
          postsData.filter((post) => post.category === selectedCategory)
        );
      } else {
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchRecipePosts = async () => {
    try {
      const q = query(
        collection(db, "forum_posts"),
        where("category", "==", "recipes"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Group posts by recipe
      const recipeGroups = posts.reduce((acc, post) => {
        if (!post.recipeId) return acc;

        if (!acc[post.recipeId]) {
          acc[post.recipeId] = {
            recipeId: post.recipeId,
            recipeName: post.recipeName,
            posts: [],
            lastPost: post.createdAt,
          };
        }
        acc[post.recipeId].posts.push(post);
        return acc;
      }, {});

      const recipeGroupsArray = Object.values(recipeGroups);
      // Sort by most recent post
      recipeGroupsArray.sort((a, b) => b.lastPost - a.lastPost);

      setRecipePosts(recipeGroupsArray);
    } catch (error) {
      console.error("Error fetching recipe posts:", error);
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
        category: selectedCategory,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: [],
      });
      setNewPost("");
      fetchPosts();
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

      fetchPosts();
    } catch (error) {
      console.error("Error voting:", error);
    }
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
      const currentComments = postDoc.data().comments || [];

      const newComment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: commentContent,
        userId: currentUser.uid,
        userName: currentUser.email,
        createdAt: new Date().toISOString(),
        replyTo: parentComment ? parentComment.userName : null,
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
      });

      if (!parentComment) {
        setCommentText((prev) => ({ ...prev, [postId]: "" }));
      }

      fetchPosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const buildCommentTree = (comments) => {
    if (!comments) return [];

    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment, index) => {
      const commentId = comment.id || `${comment.createdAt}-${index}`;
      commentMap[commentId] = {
        ...comment,
        id: commentId,
        replies: [],
      };
    });

    comments.forEach((comment, index) => {
      const commentId = comment.id || `${comment.createdAt}-${index}`;
      const commentWithReplies = commentMap[commentId];

      if (comment.replyTo) {
        const parentComment = Object.values(commentMap).find(
          (c) => c.userName === comment.replyTo
        );
        if (parentComment) {
          parentComment.replies.push(commentWithReplies);
        } else {
          rootComments.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const CommentThread = ({ comment, postId, level = 0 }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [localReplyText, setLocalReplyText] = useState("");

    const handleReply = () => {
      handleComment(postId, comment, localReplyText);
      setIsReplying(false);
      setLocalReplyText("");
    };

    return (
      <div className={`comment-thread level-${level}`}>
        <div className="comment">
          <div className="comment-header">
            <span className="comment-author">
              {comment.replyTo ? (
                <span className="reply-to">
                  {comment.userName}
                  <span className="reply-to-arrow">→</span>
                  {comment.replyTo}
                </span>
              ) : (
                comment.userName
              )}
            </span>
            <span className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
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
                value={localReplyText}
                onChange={(e) => setLocalReplyText(e.target.value)}
                placeholder={`Reply to ${comment.userName}...`}
                className="comment-input"
              />
              <div className="reply-actions">
                <button onClick={handleReply} className="comment-submit-btn">
                  Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setLocalReplyText("");
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
          <div className={`comment-replies level-${level}`}>
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
    <div className="forum-container">
      <h1>Community Forum</h1>

      <div className="forum-categories">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-btn ${
              selectedCategory === category.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      {selectedCategory === "recipes" ? (
        <div className="recipe-discussions-grid">
          {recipePosts.length > 0 ? (
            recipePosts.map((recipeGroup) => (
              <Link
                to={`/forum/recipe/${recipeGroup.recipeId}`}
                key={recipeGroup.recipeId}
                className="recipe-discussion-card"
              >
                <h3>{recipeGroup.recipeName}</h3>
                <div className="recipe-discussion-stats">
                  <span>{recipeGroup.posts.length} posts</span>
                  <span>
                    Last post:{" "}
                    {recipeGroup.lastPost?.toDate()?.toLocaleDateString() ||
                      "N/A"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-discussions">
              No recipe discussions yet. Start one from your favorites!
            </div>
          )}
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmitPost} className="post-form">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your thoughts or ask a question..."
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
                {post.category === "recipes" && (
                  <div className="recipe-reference">
                    <span className="recipe-tag">Recipe Discussion:</span>
                    <span className="recipe-name">{post.recipeName}</span>
                  </div>
                )}
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
        </>
      )}
    </div>
  );
};

export default Forum;
