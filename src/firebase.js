import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var config = {
  apiKey: "AIzaSyBDrDYQ9s_xODe06HoiikJ6PRCoNpOKjt8",
  authDomain: "grievsys2020.firebaseapp.com",
  databaseURL: "https://grievsys2020.firebaseio.com",
  projectId: "grievsys2020",
  storageBucket: "grievsys2020.appspot.com",
  messagingSenderId: "26312230959",
  appId: "1:26312230959:web:e1f7cbd0f3aaffaf0f1eda",
  measurementId: "G-YLG33NNJ3N",
};

// Initialize Firebase
firebase.initializeApp(config);

export default firebase;
