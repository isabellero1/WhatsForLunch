// import React, { useState, useEffect } from 'react';
// import { User } from '../../models/restaurantModel';
// import jwt_decode from 'jwt-decode';
// declare const google: any;

// const LoginPage: React.FC = () => {
//   const defaultUser: User = {
//     given_name: '',
//     email: '',
//     picture: '',
//   };

//   const [user, setUser] = useState<User>(defaultUser);

//   function handleCallbackResponse(response: any) {
//     console.log('Encoded JWT ID token:' + response.credential);
//     const userObject: User = jwt_decode(response.credential);
    
//     console.log(userObject.email);
//     setUser(userObject);
//     document.getElementById('signInDiv')!.hidden = true;
//     localStorage.setItem('WFL', 'true');
//   }

//   function handleSignout() {
//     setUser(defaultUser);
//     document.getElementById('signInDiv')!.hidden = false;
//     localStorage.setItem('WFL', 'false');
//   }

//   useEffect(() => {
//     // global google
//     google.accounts.id.initialize({
//       client_id: process.env.REACT_APP_GOOGLELOGINAPI,
//       callback: handleCallbackResponse,
//     });

//     google.accounts.id.renderButton(document.getElementById('signInDiv'), {
//       theme: 'outline',
//       size: 'large',
//       type: 'standard',
//     });

//     google.accounts.id.prompt();
//   }, []);

//   return (
//     <div className='Login'>
//       <div id='signInDiv'></div>
//       {user && <img src={user.picture} alt='' />}
//       <button
//         type='button'
//         className='cursor-pointer bg-blue-200'
//         onClick={handleSignout}
//       >
//         Logout
//       </button>
//     </div>
//   );
// };

// export default LoginPage;
