import React from 'react';
import { describe, expect, test } from '@jest/globals';
import { render, fireEvent } from '@testing-library/react';
import SavedRestaurant from '../client/components/SavedRestaurant';

describe('SavedRestaurant Component', () => {
  test('should delete a saved restaurant', () => {
    const mockHandleDelete = jest.fn();
    const savedRestaurants = [
      {
        place_id: '123',
        name: 'Test Restaurant',
        vicinity: 'Test Address',
      },
    ];
    const { getByRole } = render(
      <SavedRestaurant
        savedRestaurants={savedRestaurants}
        handleDelete={mockHandleDelete}
      />
    );
    const deleteButton = getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    expect(mockHandleDelete).toHaveBeenCalledWith('123');
  });
});
