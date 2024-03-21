import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  const todos = await fetch('https://jsonplaceholder.typicode.com/todos');
  return todos;
};
