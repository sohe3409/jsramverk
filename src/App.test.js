
import React from 'react'
import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom'
import App from './App';

// test('render App', async() => {
//   const { getByText } = render(<App />);
//   fireEvent.click(screen.getByText('Save'));
//
//   const al =   await screen.getByText('Untitled');
//   expect(al).toBeInTheDocument();
// });

// test('resets the document', () => {
//   render(<App />);
//   const documentName = screen.getByPlaceholderText(/Document name/i);
//   const newBtn = screen.getByText(/Save/i);
//   userEvent.click(newBtn);
//   expect(documentName).toHaveTextContent('Untitled');
// });

test('Test default values', () => {
  render(<App />);
  const name = screen.getByPlaceholderText('Document name');
  expect(name).toHaveTextContent('');
  const create = screen.getByText(/Create new/i);
  expect(create).toHaveTextContent('Create new');
  const save = screen.getByText(/Save/i);
  expect(save).toBeInTheDocument();

});

test('Test for select document', () => {
  const { getByText } = render(<App />);
  const button = screen.getByText('Create new')
  button.click();
  const text = screen.getByText('Choose or create a document');
  expect(text).toBeInTheDocument()
})
