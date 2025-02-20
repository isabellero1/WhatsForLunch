import React from 'react'; // Import React for JSX syntax
import { describe, expect, test } from '@jest/globals';
import { render, act } from '@testing-library/react';
import { get } from 'axios';
import SearchPage from '../client/components/SearchPage';

jest.mock('axios');

describe('SearchPage Component', () => {
  test('should fetch restaurants from Google Map API', async () => {
    const restaurants = [
      {
        place_id: '123',
        name: 'Test Restaurant',
        vicinity: 'Test Address',
        rating: 4.5,
        price_level: 2,
      },
    ];

    get.mockResolvedValue({ data: restaurants });

    let container;
    await act(async () => {
      const result = render(<SearchPage />);
      container = result.container;
    });

    expect(
      container.querySelector('.font-bold.text-lg.mb-2')
    ).toHaveTextContent('Test Restaurant');
  });
});
