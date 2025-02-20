import React, { useState, useEffect, useRef } from 'react';
import { Restaurant } from '../../models/restaurantModel';
import ShareIcon from './ShareIcon'; // import the ShareIcon component

interface SavedRestaurantProps {
  savedRestaurants: Restaurant[];
  handleDelete: (place_id: string) => void;
  handleSaveComment: (place_id: string, comment: string) => void; // new prop for saving comments
  handleSaveTags: (place_id: string, tags: string[]) => void; // new prop for saving tags
}

const SavedRestaurant: React.FC<SavedRestaurantProps> = ({
  savedRestaurants,
  handleDelete,
  handleSaveComment,
  handleSaveTags, // New prop for saving tags
}) => {
  const [editingComment, setEditingComment] = useState<{
    [key: string]: string;
  }>({});

  const [editingTagsInput, setEditingTagsInput] = useState<{
    [key: string]: string;
  }>({}); // new state for tags
  // add a state to track the currently edited restaurant's place_id:
  const [currentEditingPlaceId, setCurrentEditingPlaceId] = useState<
    string | null
  >(null);

  // initialize the editingTagsInput state based on the saved restaurants
  useEffect(() => {
    const initialTagsInput: { [key: string]: string } = {};
    savedRestaurants.forEach((restaurant) => {
      if (!editingTagsInput[restaurant.place_id]) {
        initialTagsInput[restaurant.place_id] = '';
      }
    });
    setEditingTagsInput((prevState) => ({ ...prevState, ...initialTagsInput }));
  }, [savedRestaurants]);

  // const handleCommentChange = (place_id: string, comment: string) => {
  //   setEditingComment({ ...editingComment, [place_id]: comment });
  // };
  // Update the handleCommentChange function to set the isCommentChanged state:
  // const handleCommentChange = (place_id: string, comment: string) => {
  //   setEditingComment({ ...editingComment, [place_id]: comment });
  //   setIsCommentChanged(true);
  // };
  const handleCommentChange = (place_id: string, comment: string) => {
    setEditingComment({ ...editingComment, [place_id]: comment });
    setIsCommentChanged({ ...isCommentChanged, [place_id]: true });
  };

  const [suggestion, setSuggestion] = useState<{ [key: string]: string }>({}); // New state for tag suggestions

  // add to handle suggested tags
  const handleTagInputChange = (place_id: string, input: string) => {
    const lowerCaseInput = input.toLowerCase();
    setEditingTagsInput({ ...editingTagsInput, [place_id]: lowerCaseInput });

    if (lowerCaseInput.length === 0) {
      setSuggestion({ ...suggestion, [place_id]: '' });
      return;
    }

    const currentTags =
      savedRestaurants.find((r) => r.place_id === place_id)?.tags || [];

    const allTags = new Set<string>();
    savedRestaurants.forEach((restaurant) => {
      restaurant.tags?.forEach((tag) => {
        if (!currentTags.includes(tag)) {
          allTags.add(tag);
        }
      });
    });

    const matchingTag = Array.from(allTags).find((tag) =>
      tag.startsWith(lowerCaseInput)
    );

    if (matchingTag && lowerCaseInput) {
      setSuggestion({ ...suggestion, [place_id]: matchingTag });
    } else {
      setSuggestion({ ...suggestion, [place_id]: '' });
    }
  };

  const handleTagKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    place_id: string
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = editingTagsInput[place_id].trim().toLowerCase(); // convert to lowercase
      if (input) {
        const currentTags =
          savedRestaurants.find((r) => r.place_id === place_id)?.tags || [];
        if (!currentTags.includes(input)) {
          const newTags = [...currentTags, input];
          handleSaveTags(place_id, newTags);
          setEditingTagsInput({ ...editingTagsInput, [place_id]: '' }); // clear input after tag is added
        } else {
          alert('This tag already exists.');
        }
      }
    } else if (e.key === 'Backspace') {
      const currentInput = editingTagsInput[place_id];
      if (currentInput.length === 0) {
        const currentTags =
          savedRestaurants.find((r) => r.place_id === place_id)?.tags || [];
        const newTags = currentTags.slice(0, -1);
        handleSaveTags(place_id, newTags);
      } else {
        setSuggestion({ ...suggestion, [place_id]: '' }); // clear suggestion when backspace is pressed
      }
    } else if (
      (e.key === 'ArrowRight' || e.key === 'ArrowDown') &&
      suggestion[place_id]
    ) {
      // Add right arrow to handle suggested tags
      e.preventDefault();
      setEditingTagsInput({
        ...editingTagsInput,
        [place_id]: suggestion[place_id],
      });
      setSuggestion({ ...suggestion, [place_id]: '' });
    }
  };
  const removeTag = (place_id: string, tag: string) => {
    const currentTags =
      savedRestaurants.find((r) => r.place_id === place_id)?.tags || [];
    const newTags = currentTags.filter((t) => t !== tag);
    handleSaveTags(place_id, newTags);
  };

  // const saveComment = (place_id: string) => {
  //   const originalComment =
  //     savedRestaurants.find((r) => r.place_id === place_id)?.comment || '';
  //   const newComment = editingComment[place_id];

  //   if (newComment !== undefined && newComment !== originalComment) {
  //     handleSaveComment(place_id, newComment);
  //   }
  //   // Do not clear the editingComment state if no changes are made
  // };

  // Modify the saveComment function to use the currentEditingPlaceId:
  // const saveComment = () => {
  //   if (currentEditingPlaceId) {
  //     const originalComment =
  //       savedRestaurants.find((r) => r.place_id === currentEditingPlaceId)
  //         ?.comment || '';
  //     const newComment = editingComment[currentEditingPlaceId];

  //     if (newComment !== undefined && newComment !== originalComment) {
  //       handleSaveComment(currentEditingPlaceId, newComment);
  //       setIsCommentChanged(false); // Reset the comment change state after saving
  //     }
  //     // Do not clear the editingComment state if no changes are made
  //   }
  // };
  // const saveComments = () => {
  //   Object.keys(editingComment).forEach((place_id) => {
  //     const originalComment =
  //       savedRestaurants.find((r) => r.place_id === place_id)?.comment || '';
  //     const newComment = editingComment[place_id];

  //     if (newComment !== undefined && newComment !== originalComment) {
  //       handleSaveComment(place_id, newComment);
  //     }
  //   });
  //   setIsCommentChanged({});
  // };

  // update the saveComments function to show the alert once after saving all comments:
  const saveComments = async () => {
    const commentUpdates = Object.keys(editingComment).map((place_id) => {
      const originalComment =
        savedRestaurants.find((r) => r.place_id === place_id)?.comment || '';
      const newComment = editingComment[place_id];

      if (newComment !== undefined && newComment !== originalComment) {
        return handleSaveComment(place_id, newComment);
      } else {
        return Promise.resolve();
      }
    });

    await Promise.all(commentUpdates);
    setIsCommentChanged({});
    alert('Your comments have been saved!');
  };

  // add state to track if there are any changes in the comment section:
  // const [isCommentChanged, setIsCommentChanged] = useState<boolean>(false);
  const [isCommentChanged, setIsCommentChanged] = useState<{
    [key: string]: boolean;
  }>({});

  const [filterInput, setFilterInput] = useState<string>('');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>(''); // New state for keyword search

  // const handleFilterInputChange = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   const input = event.target.value;
  //   setFilterInput(input);
  //   // Split the input value by comma, trim whitespace, and filter out empty tags
  //   const tags = input
  //     .split(',')
  //     .map((tag) => tag.trim())
  //     .filter((tag) => tag !== '');
  //   setFilterTags(tags);
  // };

  const handleFilterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();
    setFilterInput(input);

    const allTags = new Set<string>();
    savedRestaurants.forEach((restaurant) => {
      restaurant.tags?.forEach((tag) => {
        allTags.add(tag);
      });
    });

    const matchingTag = Array.from(allTags).find((tag) =>
      tag.startsWith(input)
    );

    if (matchingTag && input) {
      setSuggestion({ ...suggestion, ['filter']: matchingTag });
    } else {
      setSuggestion({ ...suggestion, ['filter']: '' });
    }

    setShowDropdown(false); // hide the dropdown menu when typing
  };

  const handleFilterTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = filterInput.trim().toLowerCase(); // Convert to lowercase
      if (input && !filterTags.includes(input)) {
        setFilterTags([...filterTags, input]);
        setFilterInput('');
      } else if (filterTags.includes(input)) {
        alert('This tag is already added to the filter.');
      }
    } else if (e.key === 'Backspace' && !filterInput) {
      e.preventDefault();
      const newFilterTags = [...filterTags];
      newFilterTags.pop();
      setFilterTags(newFilterTags);
    } else if (
      (e.key === 'ArrowRight' || e.key === 'ArrowDown') &&
      suggestion['filter']
    ) {
      // Handle right arrow or down arrow for suggested tags
      e.preventDefault();
      setFilterInput(suggestion['filter']);
      setSuggestion({ ...suggestion, ['filter']: '' });
    }
  };

  const removeFilterTag = (tag: string) => {
    setFilterTags(filterTags.filter((t) => t !== tag));
  };

  // to add clickable fitlers
  const addTagToFilter = (tag: string) => {
    if (!filterTags.includes(tag)) {
      setFilterTags([...filterTags, tag]);
    }
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  // const saveTags = (place_id: string) => {
  //   const originalTags =
  //     savedRestaurants.find((r) => r.place_id === place_id)?.tags || [];
  //   const newTags =
  //     editingTagsInput[place_id]
  //       ?.split(',')
  //       .map((tag) => tag.trim())
  //       .filter((tag) => tag !== '') || [];

  //   if (newTags.join(',') !== originalTags.join(',')) {
  //     handleSaveTags(place_id, newTags);
  //   }
  //   // Do not clear the editingTagsInput state if no changes are made
  // };

  // dropdown menu for all tags
  const [showDropdown, setShowDropdown] = useState(false);
  const [uniqueTags, setUniqueTags] = useState<string[]>([]);

  const filterInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allTags = new Set<string>();
    savedRestaurants.forEach((restaurant) => {
      restaurant.tags?.forEach((tag) => allTags.add(tag));
    });
    setUniqueTags(Array.from(allTags).sort());
  }, [savedRestaurants]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterInputRef.current &&
        !filterInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // add share feature
  const handleShare = (restaurant: Restaurant) => {
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      restaurant.name
    )}+${encodeURIComponent(restaurant.vicinity)}`;

    const message = `Oh my dear fren, I found this amazing place and thought you might love it too! 😍\n\n🌟 ${
      restaurant.name
    }! 🌟\n\n📍 Location: ${
      restaurant.vicinity
    }\n\n🔗 Link: ${googleMapsLink}\n\n💬 My thoughts: ${
      restaurant.comment || 'No comment yet.'
    }\n\n🏷️ Tags: ${ 
      restaurant.tags && restaurant.tags.length > 0
        ? restaurant.tags.join(', ')
        : 'No tags'
    }\n\n** Powered by WhatsForFun® with ❤️ **`;

    if (navigator.share) {
      navigator
        .share({ text: message })
        .catch((error) => console.error('Error sharing', error));
    }

    // copy message to clipboard
    navigator.clipboard.writeText(message).then(
      () => {
        showTemporaryMessage('Copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  // to show a temporary message that the message is also copied to clipboard
  const showTemporaryMessage = (message: string) => {
    const temporaryMessageDiv = document.createElement('div');
    temporaryMessageDiv.textContent = message;
    const styles = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#333',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      zIndex: '1000',
      fontSize: '16px',
      textAlign: 'center',
    };

    Object.assign(temporaryMessageDiv.style, styles);
    document.body.appendChild(temporaryMessageDiv);

    setTimeout(() => {
      document.body.removeChild(temporaryMessageDiv);
    }, 2000);
  };

  const handleShareAll = () => {
    const filteredRestaurants = savedRestaurants.filter((restaurant) => {
      const matchesTags =
        filterTags.length === 0 ||
        filterTags.every((tag) => restaurant.tags?.includes(tag));
      const matchesSearch =
        searchInput === '' ||
        restaurant.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        restaurant.comment?.toLowerCase().includes(searchInput.toLowerCase()) ||
        restaurant.vicinity.toLowerCase().includes(searchInput.toLowerCase());

      return matchesTags && matchesSearch;
    });

    if (filteredRestaurants.length === 0) {
      alert('No restaurants to share.');
      return;
    }

    let message =
      'Check out these amazing place(s) I found on WhatsForFun®:\n\n';

    filteredRestaurants.forEach((restaurant) => {
      message += `🌟 ${restaurant.name} 🌟\n`;
      message += `📍 Location: ${restaurant.vicinity}\n`;
      message += `🔗 Link: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        restaurant.name
      )}+${encodeURIComponent(restaurant.vicinity)}\n`;
      message += `💬 My thoughts: ${restaurant.comment || 'No comment yet.'}\n`;
      message += `🏷️ Tags: ${
        restaurant.tags && restaurant.tags.length > 0
          ? restaurant.tags.join(', ')
          : 'No tags'
      }\n\n`;
    });

    message += '** Powered by WhatsForFun® with ❤️ **';

    if (navigator.share) {
      navigator
        .share({ text: message })
        .catch((error) => console.error('Error sharing', error));
    } // copy message to clipboard
    navigator.clipboard.writeText(message).then(
      () => {
        showTemporaryMessage('Copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  return (
    <div className='p-4 max-w-7xl mx-auto'>
      <div className='mb-4 text-right flex justify-end'>
        {/* use the ShareIcon component */}
        <ShareIcon onClick={handleShareAll} />
      </div>
      <h2 className='font-bold text-2xl mb-4 text-red-700 text-center mt-8'>
        My Faves
      </h2>
      <div className='mb-4 text-center'>
        <input
          type='text'
          value={searchInput}
          onChange={handleSearchInputChange}
          placeholder='Search by keyword'
          className='border p-2 rounded w-full max-w-md mx-auto'
        />
      </div>
      <div className='mb-4 text-center relative' ref={filterInputRef}>
        <div className='relative flex flex-wrap items-center border p-2 rounded'>
          {filterTags.map((tag) => (
            <span
              key={tag}
              className={`${
                tag === 'wanna try'
                  ? 'bg-gradient-to-r from-blue-400 via-green-500 to-green-600 text-white rounded-full px-3 py-1 text-sm flex items-center mr-2 mb-1 shadow-lg transform hover:scale-110 transition-transform duration-200 animate-pulse'
                  : 'bg-gradient-to-r from-pink-400 via-red-500 to-yellow-500 text-white rounded-full px-3 py-1 text-sm flex items-center mr-2 mb-1 shadow-lg transform hover:scale-110 transition-transform duration-200'
              }`}
            >
              {tag}
              <button
                className='ml-2 text-yellow-400 hover:text-yellow-600 transition-colors duration-200'
                onClick={() => removeFilterTag(tag)}
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type='text'
            value={filterInput || ''}
            onChange={(e) => handleFilterInputChange(e)}
            onKeyDown={(e) => handleFilterTagKeyDown(e)}
            onFocus={() => setShowDropdown(true)}
            placeholder='Filter by tags (comma separated)'
            className='border-none focus:ring-0 flex-grow'
            style={{ flex: '1', minWidth: '150px' }}
          />
          {suggestion['filter'] && (
            <span className='ml-2 text-gray-400'>{suggestion['filter']}</span>
          )}
        </div>
        {showDropdown && (
          <ul
            className='absolute bg-white border mt-1 max-h-40 overflow-y-auto z-10'
            style={{
              width: '100%', // match the width of the input field
              top: '100%', // ensure the dropdown appears below the input field
              left: 0, // align the dropdown with the input field
              boxSizing: 'border-box', // include padding and border in the element's total width and height
            }}
          >
            {uniqueTags.length > 0 ? (
              uniqueTags.map((tag) => (
                <li
                  key={tag}
                  className='cursor-pointer p-2 hover:bg-gray-200'
                  onClick={() => {
                    if (!filterTags.includes(tag)) {
                      setFilterTags([...filterTags, tag]);
                      setFilterInput('');
                    }
                    setShowDropdown(false);
                  }}
                >
                  {tag}
                </li>
              ))
            ) : (
              <li className='p-2 text-gray-500'>No tags created</li>
            )}
          </ul>
        )}
      </div>
      <div className='overflow-x-auto'>
        {' '}
        {/* add this div */}
        <div className='table-wrapper'>
          <table className='min-w-full bg-white border-collapse border-gray-300'>
            <thead>
              <tr>
                <th className='sticky-col py-3 px-4 border-b text-center text-gray-600'>
                  Name
                </th>
                <th className='py-3 px-4 border-b text-center text-gray-600'>
                  📍
                </th>

                <th className='py-3 px-4 border-b text-center text-gray-600'>
                  Comment
                </th>
                {/* New column for tags */}
                <th className='py-3 px-4 border-b text-center text-gray-600'>
                  Tags
                </th>
                {/* New column for sahre feature */}
                <th className='py-3 px-4 border-b text-center text-gray-600'>
                  Share
                </th>
                <th className='py-3 px-4 border-b text-center text-gray-600'>
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {savedRestaurants
                .filter((restaurant) => {
                  const matchesTags =
                    filterTags.length === 0 ||
                    filterTags.every((tag) => restaurant.tags?.includes(tag));
                  const matchesSearch =
                    searchInput === '' ||
                    restaurant.name
                      .toLowerCase()
                      .includes(searchInput.toLowerCase()) ||
                    restaurant.comment
                      ?.toLowerCase()
                      .includes(searchInput.toLowerCase()) ||
                    restaurant.vicinity
                      .toLowerCase()
                      .includes(searchInput.toLowerCase()) ||
                    (restaurant.tags &&
                      restaurant.tags.some((tag) =>
                        tag.toLowerCase().includes(searchInput.toLowerCase())
                      ));

                  return matchesTags && matchesSearch;
                })
                .map((restaurant) => (
                  <tr key={restaurant.place_id} className='hover:bg-gray-50'>
                    <td className='sticky-col py-3 px-4 border-b text-center font-bold'>
                      <a
                        href={restaurant.website || '#'}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-500 underline'
                      >
                        {restaurant.name}
                      </a>
                    </td>
                    <td className='py-3 px-4 border-b text-center'>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          restaurant.name
                        )}+${encodeURIComponent(restaurant.vicinity)}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-500 underline'
                      >
                        {restaurant.vicinity}
                      </a>
                    </td>

                    <td className='py-3 px-4 border-b text-left'>
                      {/* update the textarea onFocus event to set the currently edited restaurant's place_id: */}
                      <textarea
                        value={
                          editingComment[restaurant.place_id] ??
                          restaurant.comment ??
                          ''
                        } // ensure value is always a string
                        onChange={(e) =>
                          handleCommentChange(
                            restaurant.place_id,
                            e.target.value
                          )
                        }
                        onFocus={() =>
                          setCurrentEditingPlaceId(restaurant.place_id)
                        }
                        className='border p-1 rounded'
                      />
                    </td>
                    <td className='py-3 px-4 border-b text-center'>
                      <div className='flex flex-wrap items-center border p-1 rounded'>
                        {restaurant.tags?.map((tag) => (
                          <span
                            key={tag}
                            className={`${
                              tag === 'wanna try'
                                ? 'bg-gradient-to-r from-blue-400 via-green-500 to-green-600 text-white rounded-full px-3 py-1 text-sm flex items-center mr-2 mb-1 shadow-lg transform hover:scale-110 transition-transform duration-200 animate-pulse'
                                : 'bg-gradient-to-r from-pink-400 via-red-500 to-yellow-500 text-white rounded-full px-3 py-1 text-sm flex items-center mr-2 mb-1 shadow-lg transform hover:scale-110 transition-transform duration-200'
                            }`}
                            onClick={() => addTagToFilter(tag)} // clickbale filters
                          >
                            {tag}
                            <button
                              className='ml-2 text-yellow-400 hover:text-yellow-600 transition-colors duration-200'
                              onClick={(e) => {
                                e.stopPropagation(); // prevent the click from bubbling up to the parent span
                                removeTag(restaurant.place_id, tag);
                              }}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                        <input
                          type='text'
                          value={editingTagsInput[restaurant.place_id] || ''}
                          onChange={(e) =>
                            handleTagInputChange(
                              restaurant.place_id,
                              e.target.value
                            )
                          }
                          onKeyDown={(e) =>
                            handleTagKeyDown(e, restaurant.place_id)
                          }
                          className='border-none focus:ring-0 flex-grow'
                          style={{ flex: '1', minWidth: '150px' }}
                        />
                        {suggestion[restaurant.place_id] && (
                          <span className='ml-2 text-gray-400'>
                            {suggestion[restaurant.place_id]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='py-3 px-4 border-b text-center'>
                      <div className='flex justify-center items-center'>
                        <ShareIcon onClick={() => handleShare(restaurant)} />
                      </div>
                    </td>
                    <td className='py-3 px-4 border-b text-center'>
                      <button
                        className='bg-purple-500 text-white p-2 rounded-lg transition duration-300 hover:bg-purple-700'
                        onClick={() => handleDelete(restaurant.place_id)}
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>{' '}
      {/* close the added div */}
      {Object.values(isCommentChanged).some((changed) => changed) && (
        <div className='text-center my-4'>
          <button
            className='bg-green-500 text-white p-2 rounded-lg transition duration-300 hover:bg-green-700'
            onClick={saveComments}
          >
            Save Comments
          </button>
        </div>
      )}
    </div>
  );
};

export default SavedRestaurant;
