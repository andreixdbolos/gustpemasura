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
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import "./Forum.css";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const { currentUser } = useAuth();

  const categories = [
    { id: "all", label: "All Posts" },
    { id: "recipes", label: "Recipe Discussions" },
    { id: "general", label: "General" },
    { id: "tips", label: "Cooking Tips" },
    { id: "questions", label: "Questions" },
  ];

  useEffect(() => {
    fetchPosts();
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

      // Initialize or get current votes object
      const currentVotes = postData.votes || {};
      const previousVote = currentVotes[currentUser.uid];

      // If user hasn't voted yet
      if (previousVote === undefined) {
        await updateDoc(postRef, {
          likes: increment(isUpvote ? 1 : -1),
          votes: {
            ...currentVotes,
            [currentUser.uid]: isUpvote,
          },
        });
      }
      // If user is changing their vote
      else if (previousVote !== isUpvote) {
        await updateDoc(postRef, {
          likes: increment(isUpvote ? 2 : -2), // +2 or -2 because we're switching from down to up or vice versa
          votes: {
            ...currentVotes,
            [currentUser.uid]: isUpvote,
          },
        });
      }
      // If user clicks the same button they already voted for, do nothing

      fetchPosts();
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
      fetchPosts();
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
    <div className="forum-container">
      <h1>Recipe Discussion Forum</h1>

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

      <form onSubmit={handleSubmitPost} className="post-form">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts, recipes, or ask a question..."
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

export default Forum;
