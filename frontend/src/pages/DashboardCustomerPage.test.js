import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DashboardCustomerPage from './DashboardCustomerPage';
import api from '../api';

// Mock the api module to control its behavior in tests
jest.mock('../api');

// Mock the localStorage
const mockUserInfo = {
  name: 'Test User',
  token: 'fake-token',
};
Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUserInfo));

describe('DashboardCustomerPage', () => {
  // Reset mocks before each test to ensure test isolation
  beforeEach(() => {
    api.get.mockRestore();
  });

  it('should display a loading spinner initially', () => {
    // Mock the API to be in a pending state
    api.get.mockImplementation(() => new Promise(() => {})); // A promise that never resolves

    render(
      <BrowserRouter>
        <DashboardCustomerPage />
      </BrowserRouter>
    );

    // Check for the loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display stats after data is fetched successfully', async () => {
    // Mock the API response
    const mockBooks = [{ _id: '1', releaseDate: new Date().toISOString() }];
    const mockPulls = [];

    api.get.mockImplementation(url => {
      if (url.includes('/api/books')) {
        return Promise.resolve({ data: mockBooks });
      }
      if (url.includes('/api/users/pull-list')) {
        return Promise.resolve({ data: mockPulls });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <BrowserRouter>
        <DashboardCustomerPage />
      </BrowserRouter>
    );

    // Wait for the "All Releases" card to appear with the correct count
    await waitFor(() => {
      expect(screen.getByText('All Releases')).toBeInTheDocument();
    });
    
    // Check if a specific stat is rendered correctly
    const allReleasesCard = screen.getByText('All Releases').closest('a');
    expect(allReleasesCard.querySelector('h2')).toHaveTextContent('1'); // Based on our mockBooks
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should display an error message if fetching data fails', async () => {
    // Mock a failed API call
    api.get.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <DashboardCustomerPage />
      </BrowserRouter>
    );

    // Wait for the error message to be displayed
    const errorMessage = await screen.findByText(/Failed to fetch dashboard data/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
