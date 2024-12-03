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

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;

    try {
      const postRef = doc(db, "forum_posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion({
          text: commentText[postId],
          userId: currentUser.uid,
          userName: currentUser.email,
          createdAt: new Date().toISOString(),
        }),
      });
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      fetchRecipePosts();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
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
                  {post.comments?.map((comment, index) => (
                    <div key={index} className="comment">
                      <div className="comment-header">
                        <span className="comment-author">
                          {comment.userName}
                        </span>
                        <span className="comment-date">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="comment-text">{comment.text}</div>
                    </div>
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
