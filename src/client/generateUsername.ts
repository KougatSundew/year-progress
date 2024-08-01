// Import necessary modules
import { generateUsername } from "unique-username-generator";

// Utility functions for local storage
const USERNAME_KEY = 'username';

function populateUsernameInput() {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    if (usernameInput) {
        usernameInput.value = getUsername() || '';
    }
}

function setUsername(username: string): void {
    localStorage.setItem(USERNAME_KEY, username);
}

function getUsername(): string | null {
    return localStorage.getItem(USERNAME_KEY);
}

function removeUsername(): void {
    localStorage.removeItem(USERNAME_KEY);
}

// Check if a username already exists
let username = getUsername();

if (!username) {
    // Generate a username if it does not exist
    username = generateUsername("", 4, 30, 'renault');
    setUsername(username);
}

populateUsernameInput();

console.log('Stored Username:', username);

export { getUsername, setUsername, removeUsername };