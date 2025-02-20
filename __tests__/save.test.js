// import { describe, expect, test } from '@jest/globals';
// import React from 'react';
// import { render, fireEvent } from '@testing-library/react';
// import SearchPage from '../client/components/SearchPage';

// describe('SearchPage Component', () => {
//   test('should save a restaurant', () => {
//     const { getByText } = render(<SearchPage />);
//     const saveButton = getByText('Save');
//     fireEvent.click(saveButton);
//     expect(
//       getByText('This restaurant is already in your saved list.')
//     ).toBeInTheDocument();
//   });
// });

import React from 'react';
import { describe, expect, test, jest } from '@jest/globals';
import { render, fireEvent } from '@testing-library/react';
import SearchPage from '../client/components/SearchPage';

describe('SearchPage Component', () => {
  test('should save a restaurant', () => {
    const mockHandleSave = jest.fn();
    const restaurants = [
      {
        place_id: '123',
        name: 'Test Restaurant',
        vicinity: 'Test Address',
      },
    ];

    // Mock the useState hook for savedRestaurants
    const useStateSpy = jest.spyOn(React, 'useState');
    useStateSpy.mockImplementation((init) => [init, mockHandleSave]);

    const { getByText } = render(<SearchPage />);

    // Mock the restaurants list
    restaurants.forEach((restaurant) => {
      const saveButton = getByText(/save/i);
      fireEvent.click(saveButton);
      expect(mockHandleSave).toHaveBeenCalledWith(
        expect.arrayContaining([restaurant])
      );
    });
  });
});
