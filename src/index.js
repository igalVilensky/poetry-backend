require("dotenv").config({ path: ".env" });

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB connection string (use environment variable for security)
const uri = process.env.MONGODB_URI; // Replace with your connection string
const client = new MongoClient(uri); // Remove deprecated options

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
let db;
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db("poetry"); // Replace with your database name
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

connectToDatabase();

// Routes
// Get likes for a specific poem
app.get("/api/likes/:slug", async (req, res) => {
  const { slug } = req.params;
  const collection = db.collection("poems");

  try {
    const poem = await collection.findOne({ slug });
    if (!poem) {
      // If the poem doesn't exist, create it with default values
      await collection.insertOne({
        slug,
        likes: { count: 0, isLiked: false },
        comments: [],
      });
      res.json({ count: 0, isLiked: false });
    } else {
      res.json(poem.likes);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching likes");
  }
});

// Toggle like for a specific poem
app.post("/api/likes/:slug/toggle", async (req, res) => {
  const { slug } = req.params;
  const collection = db.collection("poems");

  try {
    const poem = await collection.findOne({ slug });
    if (!poem) {
      // If the poem doesn't exist, create it with default values
      await collection.insertOne({
        slug,
        likes: { count: 0, isLiked: false },
        comments: [],
      });
      res.json({ count: 0, isLiked: false });
    } else {
      const updatedLikes = {
        count: poem.likes.count + (poem.likes.isLiked ? -1 : 1),
        isLiked: !poem.likes.isLiked,
      };
      await collection.updateOne({ slug }, { $set: { likes: updatedLikes } });
      res.json(updatedLikes);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error toggling like");
  }
});

// Get comments for a specific poem
app.get("/api/comments/:slug", async (req, res) => {
  const { slug } = req.params;
  const collection = db.collection("poems");

  try {
    const poem = await collection.findOne({ slug });
    if (!poem) {
      // If the poem doesn't exist, create it with default values
      await collection.insertOne({
        slug,
        likes: { count: 0, isLiked: false },
        comments: [],
      });
      res.json([]);
    } else {
      res.json(poem.comments);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching comments");
  }
});

// Add a new comment for a specific poem
app.post("/api/comments/:slug", async (req, res) => {
  const { slug } = req.params;
  const { author, avatar, content } = req.body;
  const collection = db.collection("poems");

  if (!content) {
    return res.status(400).json({ error: "Comment content is required" });
  }

  try {
    const poem = await collection.findOne({ slug });
    if (!poem) {
      // If the poem doesn't exist, create it with default values
      await collection.insertOne({
        slug,
        likes: { count: 0, isLiked: false },
        comments: [],
      });
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

    await collection.updateOne({ slug }, { $push: { comments: newComment } });
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding comment");
  }
});

// Like a comment for a specific poem
app.post("/api/comments/:slug/:id/like", async (req, res) => {
  const { slug, id } = req.params;
  const collection = db.collection("poems");

  try {
    const poem = await collection.findOne({ slug });
    if (!poem) {
      return res.status(404).json({ error: "Poem not found" });
    }

    const comment = poem.comments.find((c) => c.id === parseInt(id));
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;

    await collection.updateOne(
      { slug, "comments.id": parseInt(id) },
      { $set: { "comments.$": comment } }
    );

    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error liking comment");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
