
import React from 'react'
import {render, fireEvent, waitFor, screen} from '@testing-library/react'
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom'
import App from './App';

test('Test default values', () => {
  render(<App />);
  const name = screen.getByPlaceholderText('Document name');
  expect(name).toHaveTextContent('');
  const create = screen.getByText(/Create new/i);
  expect(create).toHaveTextContent('Create new');
  const save = screen.getByText(/Save/i);
  expect(save).toBeInTheDocument();
});

test('See if alert shows if no title', () => {
  render(<App />);

  fireEvent.click(screen.getByText('Save'))

  waitFor(() => {
    expect(screen.getByText("Add a document name with at least one letter")).toBeInTheDocument()
  })
})

test('Test for select document', () => {
  const { getByText } = render(<App />);
  const button = screen.getByText('Create new')
  button.click();
  const text = screen.getByText('Choose or create a document');
  expect(text).toBeInTheDocument()
})
