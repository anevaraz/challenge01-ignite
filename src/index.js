const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const userAccount = users.find((user) => user.username === username);
  if (!userAccount){
    return  response.status(404).json({'error': 'userAccount not exists!'});
  };

  request.userAccount = userAccount;

  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);
  if (userAlreadyExists){
    return  response.status(400).json({'error': 'userAccount already exists!'});
  };

  const user = {
    id: uuidv4(), 
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const todos = userAccount.todos;

  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { userAccount } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(), 
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  userAccount.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userAccount } = request;
  const { title, deadline } = request.body;

  let todo = userAccount.todos.find((todo) => todo.id === id);

  if (!todo){
    return response.status(404).json({'error': 'This todo is not found!'});
  };

  if (title){
    todo.title = title;
  };

  if (deadline){
    todo.deadline = new Date(deadline);
  };

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userAccount } = request;

  const todo = userAccount.todos.find((todo) => todo.id === id);

  if (!todo){
    return response.status(404).json({'error': 'This todo is not found!'});
  };

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { userAccount } = request;

  const todo = userAccount.todos.find((todo) => todo.id === id);

  if (!todo){
    return response.status(404).json({'error': 'This todo is not found!'});
  };

  userAccount.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;