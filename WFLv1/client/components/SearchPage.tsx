// client/components/SearchPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
declare const google: any;
import { Restaurant } from '../../models/restaurantModel';
import { User } from '../../models/restaurantModel';
import SavedRestaurant from './SavedRestaurant'; // import the SaveRestaurant component
import Logo from './assets/wfl_logo4.png';
import Logo2 from './assets/pikachu_icon.png';
import Logo3 from './assets/wfl_name.png';
import ConfirmationDialog from './ConfirmationDialog';

import DropdownMenu from './Dropdown';

// add radius opitons for user
const radiusOptions = [
  { label: `Let's explore!`, value: 15 },
  { label: 'Walking Distance (0.25 miles)', value: 0.25 },
  { label: '1 mile', value: 1 },
  { label: '2 miles', value: 2 },
  { label: '3 miles', value: 3 },
  { label: '4 miles', value: 4 },
  { label: '5 miles', value: 5 },
  { label: '6 miles', value: 6 },
  { label: '7 miles', value: 7 },
  { label: '8 miles', value: 8 },
  { label: '9 miles', value: 9 },
  { label: '10 miles', value: 10 },
];

const SearchPage: React.FC = () => {
  const defaultUser: User = {
    given_name: '',
    email: '',
    picture: '',
  };

  const [isLoggedin, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User>(defaultUser);

  // default radius to walking distance at 0.25 miles
  const [radius, setRadius] = useState<number>(0.25);

  // set location to either current or searched
  const [locationType, setLocationType] = useState<string>('current');
  const [searchedLocation, setSearchedLocation] = useState<string>('');

  // add a state to manage the confirmation dialog
  const [confirmDialogVisible, setConfirmDialogVisible] =
    useState<boolean>(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(
    null
  );
  // add state variables to manage the collapsed state of each section.
  const [isRestaurantsCollapsed, setIsRestaurantsCollapsed] =
    useState<boolean>(false);
  const [isSavedCollapsed, setIsSavedCollapsed] = useState<boolean>(false);

  // add functions to toggle the collapsed state
  const toggleRestaurantsCollapse = () => {
    setIsRestaurantsCollapsed((prev) => !prev);
  };

  const toggleSavedCollapse = () => {
    setIsSavedCollapsed((prev) => !prev);
  };

  function fetchSavedRestaurants(email: string) {
    axios
      .post('/api/getSavedRestaurants', { email: email })
      .then((response) => {
        setSavedRestaurants(response.data.savedRestaurants);
      })
      .catch((error) => {
        console.error('Error fetching saved restaurants:', error);
      });
  }

  function handleCallbackResponse(response: any) {
    const userObject: User = jwt_decode(response.credential);
    document.cookie = `userToken=${response.credential}; max-age=3600; path=/;`; //add cookie to stay logged in
    console.log(userObject.email);
    setUser(userObject);
    setIsLoggedIn(true);
    fetchSavedRestaurants(userObject.email);
  }

  function handleSignout() {
    setUser(defaultUser);
    setIsLoggedIn(false);
    document.cookie = 'userToken=; max-age=0; path=/;'; // Clear cookie when signing out
    window.location.reload(); // Refresh the page to re-initialize the Google sign-in button
  }

  useEffect(() => {
    // change this section to fetch the google login api from the backend for safety reason
    axios.get('/api/fetchGoolgeLoginAPI').then((response) => {
      const clientId = response.data.clientId;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCallbackResponse,
      });

      google.accounts.id.renderButton(document.getElementById('signInDiv'), {
        theme: 'outline',
        size: 'large',
        type: 'standard',
      });

      // Check for cookie and validate user
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('userToken'))
        ?.split('=')[1];

      if (token) {
        try {
          const userObject: User = jwt_decode(token);
          setUser(userObject);
          setIsLoggedIn(true);
          fetchSavedRestaurants(userObject.email);
        } catch (error) {
          console.error('Invalid token', error);
        }
      }
    });
  }, []);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [foodType, setFoodType] = useState<string>('');
  const [searchInitiated, setSearchInitiated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]); // Add a new state variable to hold the saved restaurants

  // set origin for the path
  const [origin, setOrigin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (locationType === 'current') {
      navigator.geolocation.getCurrentPosition((position) => {
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      });
    }
  }, [locationType]);

  // to obtain the current city and country of the saved place
  const [locationDetails, setLocationDetails] = useState<{
    neighborhood: string;
    sublocality: string;
    city: string;
    state: string;
    country: string;
  } | null>(null);

  const fetchLocationDetails = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get('/api/locationDetails', {
        params: { latitude, longitude },
      });
      const city = response.data.city;
      const country = response.data.country;
      const state = response.data.state;
      const sublocality = response.data.sublocality;
      const neighborhood = response.data.neighborhood;
      console.log('response.data :>> ', response.data);
      console.log('Fetched location details:', {
        sublocality,
        city,
        state,
        country,
      });
      setLocationDetails({ neighborhood, sublocality, city, state, country });
    } catch (error) {
      console.error('Error fetching location details', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true); // set loading to true when the search is initiated
      if (locationType === 'current') {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          setOrigin({ latitude, longitude }); // set origin to current location
          await fetchLocationDetails(latitude, longitude); // to fetch current country and city
          const response = await axios.get('/api/restaurants', {
            params: {
              latitude,
              longitude,
              keyword: foodType,
              radius: radius * 1609.34, // convert miles to meters
            },
          });
          setRestaurants(response.data);
          setLoading(false); // set loading to false when the search is completed
          setSearchInitiated(true); // set searchInitiated to true once the search is completed
        });
      } else {
        const response = await axios.get(`/api/geocode`, {
          params: { location: searchedLocation },
        });
        const location = response.data.results[0].geometry.location;
        const latitude = location.lat;
        const longitude = location.lng;
        setOrigin({ latitude, longitude }); // set origin to searched location
        await fetchLocationDetails(latitude, longitude); // to fetch current country and city
        console.log('Searched Location:', { latitude, longitude });
        const restaurantResponse = await axios.get('/api/restaurants', {
          params: {
            latitude,
            longitude,
            keyword: foodType,
            radius: radius * 1609.34,
          },
        });
        setRestaurants(restaurantResponse.data);
        setLoading(false);
        setSearchInitiated(true);
      }
    } catch (error: any) {
      console.error('Error fetching restaurants', error);
      setLoading(false);
    }
  };

  //add to handle location autocomplete
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>(
    []
  );
  const handleAutocomplete = async (input: string) => {
    if (input.length < 3) {
      setAutocompleteSuggestions([]);
      return;
    }
    try {
      const response = await axios.get('/api/autocomplete', {
        params: { input },
      });
      setAutocompleteSuggestions(response.data.predictions);
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target.value;
    setSearchedLocation(input);
    handleAutocomplete(input);
  };

  const handleSelectSuggestion = (suggestion: any) => {
    setSearchedLocation(suggestion.description);
    setAutocompleteSuggestions([]);
  };

  const handleGenerateRestaurants = () => {
    setSelectedRestaurant(null); // this line clears the selected restaurant
    setSearchInitiated(false); // reset searchInitiated to false when the button is clicked
    fetchRestaurants();
    // Ensure the generated restaurant div is expanded
    if (isRestaurantsCollapsed) {
      toggleRestaurantsCollapse();
    }
  };

  const handleRandomSelect = () => {
    const randomRestaurant =
      restaurants[Math.floor(Math.random() * restaurants.length)];
    if (!randomRestaurant) {
      alert('Please generate some fun.');
    }
    setSelectedRestaurant(randomRestaurant);
    // ensure the saved restaurant div is expanded
    if (randomRestaurant && isSavedCollapsed) {
      toggleSavedCollapse();
    }
  };

  const handleSave = async (restaurant: Restaurant) => {
    // check if the user is logged in
    if (!isLoggedin) {
      alert('Please log in to save your favorite places');
      return;
    }

    // check if the restaurant is already in the saved list
    if (
      savedRestaurants.some(
        (savedRestaurant) => savedRestaurant.place_id === restaurant.place_id
      )
    ) {
      alert('This restaurant is already in your saved list.');
      return; // exit the function early
    }

    // Show confirmation dialog
    setCurrentRestaurant(restaurant);
    setConfirmDialogVisible(true);
  };

  const confirmSave = async (wannaTry: boolean) => {
    const restaurant = currentRestaurant;
    if (!restaurant) return;

    try {
      // fetch location details using the restaurant's latitude and longitude
      const locationResponse = await axios.get('/api/locationDetails', {
        params: {
          latitude: restaurant.geometry.location.lat,
          longitude: restaurant.geometry.location.lng,
        },
      });
      const locationDetails = locationResponse.data;
      console.log('Fetched location details for restaurant:', locationDetails);

      // to automatically set current country and city as tags
      // use a set to remove repeating tags
      const tags = Array.from(
        new Set(
          [
            foodType.toLowerCase(),
            locationDetails?.neighborhood?.toLowerCase() || '',
            locationDetails?.city?.toLowerCase() || '',
            locationDetails?.state?.toLowerCase() || '',
            locationDetails?.country?.toLowerCase() || '',
          ].filter(Boolean)
        )
      );

      if (wannaTry) {
        tags.push('wanna try');
      }

      console.log('Saving restaurant with tags:', tags); // log tags before saving

      let dataBody = {
        email: user.email,
        place_id: restaurant.place_id,
        name: restaurant.name,
        vicinity: restaurant.vicinity,
        website: restaurant.website, // Include website
        link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          restaurant.name
        )}+${encodeURIComponent(restaurant.vicinity)}`,
        tags: tags,
      };
      const response = await fetch('/api/saveLoc', {
        method: 'POST',
        body: JSON.stringify(dataBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      // update the state with the new restaurant including the tags
      setSavedRestaurants((prevRestaurants) => {
        const updatedRestaurants = prevRestaurants.map((savedRestaurant) =>
          savedRestaurant.place_id === restaurant.place_id
            ? { ...savedRestaurant, tags: tags }
            : savedRestaurant
        );

        // add the new restaurant if it wasn't already in the saved list
        if (
          !updatedRestaurants.some(
            (savedRestaurant) =>
              savedRestaurant.place_id === restaurant.place_id
          )
        ) {
          updatedRestaurants.push({ ...restaurant, tags: tags });
        }

        return updatedRestaurants;
      });

      setConfirmDialogVisible(false);
    } catch (error) {
      console.log('Error in the saveIt function:', error);
    }
  };

  const handleDelete = async (place_id: string) => {
    // add a confirmation for user
    const userConfirmed = window.confirm(
      'Are you sure you want to delete this place? Your comment and tags will be gone permanently.'
    );

    if (!userConfirmed) {
      return;
    }

    setSavedRestaurants((prev) =>
      prev.filter((restaurant) => restaurant.place_id !== place_id)
    );
    try {
      let dataBody = {
        email: user.email,
        place_id: place_id,
      };
      const response = await fetch('/api/delLoc', {
        method: 'POST',
        body: JSON.stringify(dataBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
    } catch (error) {
      console.log('Error in the saveIt function:', error);
    }
  };

  const handleSaveComment = async (place_id: string, comment: string) => {
    const email = user.email;

    try {
      const response = await fetch('/api/updateComment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, place_id, comment }),
      });

      if (response.ok) {
        // update the state with the new comment
        setSavedRestaurants((prevRestaurants) =>
          prevRestaurants.map((restaurant) =>
            restaurant.place_id === place_id
              ? { ...restaurant, comment }
              : restaurant
          )
        );
      } else {
        console.error('Error updating comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleSaveTags = async (place_id: string, tags: string[]) => {
    const email = user.email;

    try {
      const response = await fetch('/api/updateTags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, place_id, tags }),
      });

      if (response.ok) {
        // update the state with the new tags
        setSavedRestaurants((prevRestaurants) =>
          prevRestaurants.map((restaurant) =>
            restaurant.place_id === place_id
              ? { ...restaurant, tags }
              : restaurant
          )
        );
      } else {
        console.error('Error updating tags');
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };

  const isRestaurantSaved = (place_id: string) => {
    return savedRestaurants.some(
      (restaurant) => restaurant.place_id === place_id
    );
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    const starStyle = {
      color: '#FFD700', // gold color for the stars
      fontSize: '1.5rem', // adjust the size of the stars
    };

    return (
      <span>
        <span style={starStyle}>{'★'.repeat(fullStars)}</span>
        {halfStar && <span style={starStyle}>☆</span>}
        <span style={{ ...starStyle, color: '#ccc' }}>
          {'☆'.repeat(emptyStars)}
        </span>
      </span>
    );
  };

  return (
    <>
      <nav className='flex justify-between fixed top-0 w-full backdrop-blur-sm bg-white/30 shadow-md p-2 z-50'>
        {' '}
        {/* add z-50 to make sure nav always stay on top */}
        <img src={Logo} className='w-48 h-48  mx-3 my-3 '></img>
        <img src={Logo3} className='w-auto h-48  mx-3 my-3 '></img>
        <div className='mr-5'>
          <div>
            {isLoggedin && (
              <button
                type='button'
                className='cursor-pointer h-10 w-52 bg-white'
                onClick={handleSignout}
              >
                Logout
              </button>
            )}
            {!isLoggedin && (
              <div id='signInDiv' style={{ display: 'block' }}></div>
            )}
          </div>
          <img
            src={isLoggedin ? user.picture : Logo2}
            className='w-28 h-28 object-cover rounded-full mt-3 mx-auto'
          />
          <h1 className='my-1'>{isLoggedin ? user.given_name : 'Guest'}</h1>
        </div>
      </nav>
      {/* add location - current vs searched location */}
      <div className='searchPage flex flex-col items-center bg-white min-h-screen pt-72 px-32'>
        <div className='flex space-x-4 mb-3'>
          {/* <label htmlFor='locationType' className='block mb-1 text-gray-700'>
            Location Type
          </label> */}

          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value)}
            className='p-2 border rounded-lg bg-gray-100'
          >
            <option value='current'>Current Location</option>
            <option value='searched'>Search Location</option>
          </select>
          {locationType === 'searched' && (
            <div className='relative w-60'>
              <label
                htmlFor='searchedLocation'
                className='block mb-1 text-gray-700 text-center'
              >
                Enter a Location
              </label>
              <input
                type='text'
                value={searchedLocation}
                onChange={handleLocationInputChange}
                placeholder='Enter a location'
                className='p-2 border rounded-lg w-60 bg-gray-100'
              />
              {/* add below to handle location suggestion */}
              {autocompleteSuggestions.length > 0 && (
                <ul className='absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10'>
                  {autocompleteSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className='cursor-pointer p-2 hover:bg-gray-100'
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div>
            <label
              htmlFor='foodType'
              className='block mb-1 text-gray-700 text-center'
            >
              Keyword
            </label>
            <input
              id='foodType'
              type='text'
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleGenerateRestaurants();
                }
              }}
              placeholder="What's for fun?"
              className='p-2 border rounded-lg w-60 bg-gray-100'
            />
          </div>
          {/* add radius selections for users */}
          <div>
            <label
              htmlFor='radius'
              className='block mb-1 text-gray-700 text-center'
            >
              Radius
            </label>
            <select
              id='radius'
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value))}
              className='p-2 border rounded-lg bg-gray-100'
            >
              {radiusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerateRestaurants}
            className='bg-blue-500 text-white p-2 rounded-lg transition duration-300 hover:bg-blue-700'
          >
            Generate Fun
          </button>
          <button
            onClick={handleRandomSelect}
            className='bg-purple-500 text-white p-2 rounded-lg transition duration-300 hover:bg-purple-700'
          >
            Random Select
          </button>
        </div>
        {loading && <div className='spinner'></div>}{' '}
        <div className='flex flex-col lg:flex-row w-full '>
          <button
            onClick={toggleRestaurantsCollapse}
            className='bg-teal-100 text-grey p-2 rounded-lg transition duration-300 hover:bg-teal-200 sm:2-1/30 lg:w-1/20 flex items-start'
          >
            {isRestaurantsCollapsed ? '>>' : '<<'}
          </button>
          <ul
            className={`grid grid-cols-1 gap-4 w-full transition-transform duration-300 ${
              isSavedCollapsed
                ? 'md:grid-cols-3 lg:grid-cols-4'
                : 'md:grid-cols-2 lg:grid-cols-3'
            } ${isRestaurantsCollapsed ? 'hidden' : ''}`}
          >
            {searchInitiated && restaurants.length === 0 ? (
              <p>No luck! Try something different!</p>
            ) : (
              restaurants.map((restaurant) => (
                <li
                  key={restaurant.place_id}
                  className='bg-white p-4 rounded-lg shadow-lg'
                >
                  <p className='font-bold text-lg mb-2 text-center'>
                    {restaurant.name}
                  </p>
                  <p>
                    <strong>Rating:</strong> {renderStars(restaurant.rating)}
                  </p>
                  <p>
                    <strong>Price Level:</strong>{' '}
                    {'$'.repeat(restaurant.price_level)}
                  </p>

                  <p>
                    <strong>Address:</strong> {restaurant.vicinity}
                  </p>
                  {restaurant.photos && restaurant.photos[0] && (
                    <img
                      src={restaurant.photo_url}
                      alt='Restaurant Image'
                      className='w-full h-40 object-cover rounded-lg mb-2'
                    />
                  )}
                  <p>
                    <a>🌐 </a>
                    <a
                      href={restaurant.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Website
                    </a>
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      restaurant.name
                    )}+${encodeURIComponent(restaurant.vicinity)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 underline mt-2 inline-block'
                  >
                    <img
                      src='https://img.icons8.com/color/48/000000/google-maps.png'
                      alt='Google Maps Icon'
                      className='inline-block mr-1 h-5 w-5'
                    />
                    View on Google Maps
                  </a>
                  <p>
                    <a>🚆 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&destination=${encodeURIComponent(
                        restaurant.vicinity
                      )}&travelmode=transit`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Let's go!
                    </a>
                  </p>
                  {/* <p>
                    <a>🚶 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&destination=${encodeURIComponent(
                        restaurant.vicinity
                      )}&travelmode=walking`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Walking There
                    </a>
                  </p>
                  <p>
                    <a>🚴 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&destination=${encodeURIComponent(
                        restaurant.vicinity
                      )}&travelmode=bicycling`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Biking There
                    </a>
                  </p>

                  <p>
                    <a>🚗 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&destination=${encodeURIComponent(
                        restaurant.vicinity
                      )}&travelmode=driving`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Driving There
                    </a>
                  </p> */}
                  <div className='flex justify-center items-center'>
                    <div className='flex justify-center items-center'>
                      <button
                        onClick={() => handleSave(restaurant)}
                        className={`mt-4 p-2 rounded-lg transition duration-300 ${
                          isRestaurantSaved(restaurant.place_id)
                            ? 'bg-gray-500 text-white cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-700'
                        }`}
                        disabled={isRestaurantSaved(restaurant.place_id)}
                      >
                        {isRestaurantSaved(restaurant.place_id)
                          ? 'Saved'
                          : 'Save'}
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          <button
            onClick={toggleSavedCollapse}
            className='bg-yellow-100 text-black p-2 rounded-lg transition duration-300 hover:bg-yellow-200 flex items-start ml-2'
          >
            {isSavedCollapsed ? '>>' : '<<'}
          </button>
          {(selectedRestaurant || isLoggedin) && (
            <div
              className={`backdrop-blur-sm bg-white/30 p-4 rounded-lg shadow-lg w-full ${
                isRestaurantsCollapsed ? 'lg:w-full' : 'lg:w-1/2'
              } max-h-70 transition-transform duration-300 ${
                isSavedCollapsed ? 'hidden' : ''
              }`}
            >
              {selectedRestaurant && (
                <div className='rounded-lg shadow-lg p-4 backdrop-blur-sm bg-white/30'>
                  <h2 className='font-bold text-xl mb-2 text-red-700 text-center'>
                    Selected Fun
                  </h2>
                  <p className='font-bold text-2xl text-center text-blue-700'>
                    {selectedRestaurant.name}
                  </p>
                  <p className='text-lg'>
                    <strong>Rating:</strong>{' '}
                    {renderStars(selectedRestaurant.rating)}
                  </p>
                  <p className='text-lg'>
                    <strong>Price Level:</strong>{' '}
                    {'$'.repeat(selectedRestaurant.price_level)}
                  </p>
                  <p className='text-lg'>
                    <strong>Address:</strong> {selectedRestaurant.vicinity}
                  </p>
                  {selectedRestaurant.photo_url && (
                    <img
                      src={selectedRestaurant.photo_url}
                      alt='Restaurant Image'
                      className='w-full h-40 object-cover rounded-lg mb-2'
                    />
                  )}
                  <p>
                    <a>🌐 </a>
                    <a
                      href={selectedRestaurant.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Website
                    </a>
                  </p>
                  <p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&query=${encodeURIComponent(
                        selectedRestaurant.name
                      )}+${encodeURIComponent(selectedRestaurant.vicinity)}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      <img
                        src='https://img.icons8.com/color/48/000000/google-maps.png'
                        alt='Google Maps Icon'
                        className='inline-block mr-1 h-5 w-5'
                      />
                      View on Google Maps
                    </a>
                  </p>
                  <p>
                    <a>🚶 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&destination=${encodeURIComponent(
                        selectedRestaurant.vicinity
                      )}&travelmode=walking`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Walking There
                    </a>
                  </p>
                  <p>
                    <a>🚴 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&destination=${encodeURIComponent(
                        selectedRestaurant.vicinity
                      )}&travelmode=bicycling`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Biking There
                    </a>
                  </p>
                  <p>
                    <a>🚆 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${
                        origin?.latitude
                      },${origin?.longitude}&destination=${encodeURIComponent(
                        selectedRestaurant.vicinity
                      )}&travelmode=transit`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Taking a Train There
                    </a>
                  </p>
                  <p>
                    <a>🚗 </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        selectedRestaurant.vicinity
                      )}&travelmode=driving`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline mt-2 inline-block'
                    >
                      Driving There
                    </a>
                  </p>
                  <div className='flex justify-center items-center'>
                    <button
                      onClick={() => handleSave(selectedRestaurant)}
                      className={`mt-2 p-2 rounded-lg transition duration-300 ${
                        isRestaurantSaved(selectedRestaurant.place_id)
                          ? 'bg-gray-500 text-white cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-700'
                      }`}
                      disabled={isRestaurantSaved(selectedRestaurant.place_id)}
                    >
                      {isRestaurantSaved(selectedRestaurant.place_id)
                        ? 'Saved'
                        : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {isLoggedin && (
                <div>
                  <SavedRestaurant
                    savedRestaurants={savedRestaurants}
                    handleDelete={handleDelete}
                    handleSaveComment={handleSaveComment}
                    handleSaveTags={handleSaveTags}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {confirmDialogVisible && (
        <ConfirmationDialog
          message='Have you been to this place before?'
          onConfirm={(wannaTry) => confirmSave(wannaTry)}
          onCancel={() => setConfirmDialogVisible(false)}
        />
      )}
    </>
  );
};

export default SearchPage;
