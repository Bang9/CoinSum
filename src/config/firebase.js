import * as firebase from 'firebase';

const config = {
  apiKey: 'AIzaSyDBuMV9uJAU-SVlFCv34nEr8TqNpZzVrPA',
  authDomain: 'coinsumapp.firebaseapp.com',
  databaseURL: 'https://coinsumapp.firebaseio.com',
  projectId: 'coinsumapp',
  storageBucket: '',
  messagingSenderId: '736174420217',
};

firebase.initializeApp(config);

export default firebase;
