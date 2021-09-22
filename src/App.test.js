
import React from 'react'
import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom'
import App from './App';

// test('render App', async() => {
//   const { getByText } = render(<App />);
//   fireEvent.click(screen.getByText('Save'));
//
//   const al =   await screen.getByRole('alert');
//   expect(al).toBeInTheDocument();
// });

test('resets the document', async () => {
  render(<App />);
  const save = screen.getByText(/Save/i);
  expect(save).toBeInTheDocument();
  const create = screen.getByText(/Create new/i);
  expect(create).toHaveTextContent('Create new');
  const name = screen.getByPlaceholderText('Document name');
  expect(name).toHaveTextContent('');
});

test('Test for select document', () => {
  const { getByText } = render(<App />);
  const button = screen.getByText('Create new')
  button.click();
  const text = screen.getByText('Choose or create a document');
  expect(text).toBeInTheDocument()
})
