const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ message: 'User not found!' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.find((user) => user.username === username);

  if (usernameExists) {
    return response.status(400).json({ error: 'User already exists!' });
  }

  const id = uuidv4();

  const user = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const id = uuidv4();

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'error' });
  }

  const todoUpdated = { ...todo, title: title, deadline: new Date(deadline) };

  user.todos = user.todos.map((item) => {
    if (item.id === todoUpdated.id) {
      return todoUpdated;
    }

    return item;
  });

  return response.status(200).json(todoUpdated);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'error' });
  }

  const todoUpdated = { ...todo, done: true };

  user.todos = user.todos.map((item) => {
    if (item.id === todoUpdated.id) {
      return todoUpdated;
    }

    return item;
  });

  return response.status(200).json(todoUpdated);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'error' });
  }

  user.todos = user.todos.filter((item) => {
    if (item.id !== todo.id) {
      return item;
    }
  });

  return response.status(204).send();
});

module.exports = app;