const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data storage
const poemData = {};

// Routes
// Get likes for a specific poem
app.get("/api/likes/:slug", (req, res) => {
  const { slug } = req.params;
  if (!poemData[slug]) {
    poemData[slug] = { likes: { count: 0, isLiked: false }, comments: [] };
  }
  res.json(poemData[slug].likes);
});

// Toggle like for a specific poem
app.post("/api/likes/:slug/toggle", (req, res) => {
  const { slug } = req.params;
  if (!poemData[slug]) {
    poemData[slug] = { likes: { count: 0, isLiked: false }, comments: [] };
  }
  poemData[slug].likes.isLiked = !poemData[slug].likes.isLiked;
  poemData[slug].likes.count += poemData[slug].likes.isLiked ? 1 : -1;
  res.json(poemData[slug].likes);
});

// Get comments for a specific poem
app.get("/api/comments/:slug", (req, res) => {
  const { slug } = req.params;
  if (!poemData[slug]) {
    poemData[slug] = { likes: { count: 0, isLiked: false }, comments: [] };
  }
  res.json(poemData[slug].comments);
});

// Add a new comment for a specific poem
app.post("/api/comments/:slug", (req, res) => {
  const { slug } = req.params;
  const { author, avatar, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  if (!poemData[slug]) {
    poemData[slug] = { likes: { count: 0, isLiked: false }, comments: [] };
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

  poemData[slug].comments.unshift(newComment);
  res.status(201).json(newComment);
});

// Like a comment for a specific poem
app.post("/api/comments/:slug/:id/like", (req, res) => {
  const { slug, id } = req.params;
  if (!poemData[slug]) {
    return res.status(404).json({ error: "Poem not found" });
  }

  const comment = poemData[slug].comments.find((c) => c.id === parseInt(id));
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
