import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
    getDatabase,
    set,
    get,
    ref,
    child,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuvclqpceK_Ar7eL9Jsqe4s4fA3P662WU",
    authDomain: "harmony-haven-b5f02.firebaseapp.com",
    projectId: "harmony-haven-b5f02",
    storageBucket: "harmony-haven-b5f02.appspot.com",
    messagingSenderId: "532354321730",
    appId: "1:532354321730:web:ef84d9680a06f389978cdb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

function validate_email(email) {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
}

function on_error(error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);

    alert(errorMessage);
}

export function register(name, email, password, password2) {
    if (!validate_email(email)) {
        alert("Please enter a valid email address");
        return;
    }

    if (password != password2) {
        alert("Passwords do not match");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            set(ref(database, "users/" + user.uid), {
                name: name,
                email: email,
            });
            get(child(ref(database), "users/" + user.uid)).then((snapshot) => {
                if (snapshot.exists()) {
                    sessionStorage.setItem(
                        "user-info",
                        JSON.stringify(snapshot.val())
                    );
                    sessionStorage.setItem(
                        "credentials",
                        JSON.stringify(userCredential.user)
                    );
                    window.location = "/";
                } else {
                    alert("User does not exist");
                }
            });
        })
        .catch((error) => {
            on_error(error);
        });
}

export function login(email, password) {
    if (!validate_email(email)) {
        alert("Please enter a valid email address");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            get(child(ref(database), "users/" + user.uid)).then((snapshot) => {
                if (snapshot.exists()) {
                    sessionStorage.setItem(
                        "user-info",
                        JSON.stringify(snapshot.val())
                    );
                    sessionStorage.setItem(
                        "credentials",
                        JSON.stringify(userCredential.user)
                    );
                    window.location = "/";
                } else {
                    alert("User does not exist");
                }
            });
        })
        .catch((error) => {
            on_error(error);
        });
}

export function logout() {
    sessionStorage.removeItem("user-info");
    sessionStorage.removeItem("credentials");
    window.location = "/";
}
