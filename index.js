const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data storage
let likes = {
  count: 42,
  isLiked: false,
};

let comments = [
  {
    id: 1,
    author: "Анна Петрова",
    avatar: "/api/placeholder/40/40",
    content:
      "Прекрасное стихотворение! Особенно понравились метафоры в третьей строфе.",
    date: new Date(Date.now() - 86400000).toISOString(),
    likes: 5,
    isLiked: false,
  },
];

// Routes
// Get likes
app.get("/api/likes", (req, res) => {
  res.json(likes);
});

// Toggle like
app.post("/api/likes/toggle", (req, res) => {
  likes.isLiked = !likes.isLiked;
  likes.count += likes.isLiked ? 1 : -1;
  res.json(likes);
});

// Get comments
app.get("/api/comments", (req, res) => {
  res.json(comments);
});

// Add a new comment
app.post("/api/comments", (req, res) => {
  const { author, avatar, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const newComment = {
    id: Date.now(),
    author: author || "Гость",
    avatar: avatar || "/api/placeholder/40/40",
    content,
    date: new Date().toISOString(),
    likes: 0,
    isLiked: false,
  };

  comments.unshift(newComment);
  res.status(201).json(newComment);
});

// Like a comment
app.post("/api/comments/:id/like", (req, res) => {
  const commentId = parseInt(req.params.id);
  const comment = comments.find((c) => c.id === commentId);

  if (!comment) {
    return res.status(404).json({ error: "Comment not found" });
  }

  comment.isLiked = !comment.isLiked;
  comment.likes += comment.isLiked ? 1 : -1;
  res.json(comment);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
