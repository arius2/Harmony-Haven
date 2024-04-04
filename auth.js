import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";

// Firebase Auth
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// Firebase Database
import {
    getDatabase,
    set,
    get,
    ref,
    child,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

export { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuvclqpceK_Ar7eL9Jsqe4s4fA3P662WU",
    authDomain: "harmony-haven-b5f02.firebaseapp.com",
    projectId: "harmony-haven-b5f02",
    storageBucket: "harmony-haven-b5f02.appspot.com",
    messagingSenderId: "532354321730",
    appId: "1:532354321730:web:ef84d9680a06f389978cdb",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Validation functions
export function validate_username(username) {
    if (username.length < 3) {
        return "Username must be at least 3 characters long";
    }
    if (!username.match(/^[a-zA-Z0-9\s]+$/)) {
        return "Username must only contain letters, numbers and spaces";
    }
    return "";
}

export function validate_email(email) {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email) ? "" : "Invalid email";
}

export function validate_password(password) {
    if (password.length < 6) {
        return "Password must be at least 6 characters long";
    }
    if (password.search(/[a-z]/) < 0) {
        return "Password must contain at least one letter";
    }
    if (password.search(/[0-9]/) < 0) {
        return "Password must contain at least one digit";
    }
    return "";
}

export function validate_passwords(password, password2) {
    var error = validate_password(password);
    if (error != "") {
        return error;
    }
    if (password != password2) {
        return "Passwords do not match";
    }
    return "";
}

// Firebase functions
export function register(name, email, password, password2) {
    return new Promise((resolve, reject) => {
        if (validate_username(name) != "") {
            reject(new Error("Invalid username"));
        } else if (validate_email(email) != "") {
            reject(new Error("Invalid email address"));
        } else if (validate_passwords(password, password2) != "") {
            reject(new Error("Passwords do not match"));
        } else {
            setPersistence(auth, browserLocalPersistence)
                .then(() => {
                    return createUserWithEmailAndPassword(auth, email, password)
                        .then((userCredential) => {
                            const user = userCredential.user;
                            return set(ref(database, "users/" + user.uid), {
                                name: name,
                                email: email,
                            })
                                .then(() => {
                                    resolve(userCredential);
                                })
                                .catch((error) => {
                                    console.error("Failed to set user data: ", error);
                                    reject(error);
                                });
                        })
                        .catch((error) => {
                            console.error("Failed to create user: ", error);
                            reject(error);
                        });
                })
                .catch((error) => {
                    console.error("Failed to set persistence: ", error);
                    reject(error);
                });
        }
    });
}

export function login(email, password) {
    return new Promise((resolve, reject) => {
        if (validate_email(email) != "") {
            reject(new Error("Invalid email address"));
        } else {
            setPersistence(auth, browserLocalPersistence)
                .then(() => {
                    return signInWithEmailAndPassword(auth, email, password)
                        .then((userCredential) => {
                            const user = userCredential.user;
                            return get(child(ref(database), "users/" + user.uid))
                                .then((snapshot) => {
                                    if (snapshot.exists()) {
                                        resolve(userCredential);
                                    } else {
                                        reject(new Error("User data does not exist"));
                                    }
                                })
                                .catch((error) => {
                                    console.error("Failed to get user data: ", error);
                                    reject(error);
                                });
                        })
                        .catch((error) => {
                            console.error("Failed to login: ", error);
                            reject(error);
                        });
                })
                .catch((error) => {
                    console.error("Failed to set persistence: ", error);
                    reject(error);
                });
        }
    });
}

export function logout() {
    return new Promise((resolve, reject) => {
        signOut(auth)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error("Failed to logout: ", error);
                reject(error);
            });
    });
}

export function getUserData() {
    return new Promise((resolve, reject) => {
        const user = auth.currentUser;
        get(child(ref(database), "users/" + user.uid))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    resolve(snapshot);
                } else {
                    reject(new Error("User data does not exist"));
                }
            })
            .catch((error) => {
                console.error("Failed to get user data: ", error);
                reject(error);
            });
    });
}
