const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const User = require('./models/User');
const Task = require('./models/Task');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb+srv://todolist:Tongam08@cluster0.0kxjo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/users', async (req, res) => {
  try {
    const { name } = req.body;
    const user = new User({ name });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err });
  }
});

app.post('/tasks/:userId', async (req, res) => {
  try {
    const { title } = req.body;
    const task = new Task({ title, user: req.params.userId });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error adding task', error: err });
  }
});

app.get('/tasks/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err });
  }
});

app.put('/tasks/:taskId', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, { completed: true }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err });
  }
});

app.delete('/tasks/:taskId', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err });
  }
});

// Fallback for unknown routes
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.delete('/users/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete all tasks for the user
    await Task.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and all tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user and tasks', error: err });
  }
});



// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
