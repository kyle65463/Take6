import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyCQ4GihktcKTZQYDRTIvDh5wN8QFyIPpqc",
	authDomain: "take6-349808.firebaseapp.com",
	projectId: "take6-349808",
	storageBucket: "take6-349808.appspot.com",
	messagingSenderId: "237481500316",
	appId: "1:237481500316:web:b7b10902fcbc3a95ae5759",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
