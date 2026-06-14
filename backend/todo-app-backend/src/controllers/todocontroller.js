const Todo = require('../models/Todo');

// @desc    Get all todos for a user
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id }).sort('-createdAt');
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a todo
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        
        const todo = await Todo.create({
            title,
            description,
            priority,
            dueDate,
            user: req.user.id
        });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res) => {
    try {
        let todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Make sure user owns the todo
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        todo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Make sure user owns the todo
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await todo.deleteOne();

        res.status(200).json({ message: 'Todo removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTodos,
    createTodo,
    updateTodo,
    deleteTodo
};