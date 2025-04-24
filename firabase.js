// services/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDkvEACFapUswPeYF8Y0ElXVQ5B7mi5D90",  // Insira aqui as credenciais que você obteve 
  authDomain: "seu-app.firebaseapp.com", // do console do Firebase
  projectId: "acr-spa-projetoextensao",
  storageBucket: "seu-app.appspot.com",
  messagingSenderId: "seu-messaging-id",
  appId: "seu-app-id"
};

const app = initializeApp(firebaseConfig);

// Configure Auth com persistência para React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);