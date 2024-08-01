import { io } from "socket.io-client";
import { backendUrl } from "./consts";
import { Message } from "../server/types";
import { getUsername } from "./generateUsername";

const username = getUsername();

let socket = io("http://localhost:5173");

socket.on('chat:message', (message) => {
    populateChat();
});

document.getElementById('message')?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
        (event.target as HTMLInputElement).value = '';
    }
});
document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);

async function sendMessage() {
    const message = getInputValue('message');
    if (!message) return;

    try {
        await postMessage({ message, sender: username });
        await populateChat();
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function postMessage(data: { message: string, sender: string }) {
    try {
        socket.emit('chat:message', data);
    } catch (error) {
        console.error('Error posting message:', error);
        throw new Error('Failed to send message');
    }
}

async function getMessages() {
    const response = await fetch(`${backendUrl}chat`);
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    return await response.json() as Message[];
}

async function populateChat() {
    try {
        const messages = await getMessages();
        updateChatUI(messages);
    } catch (error) {
        console.error('Error filling chat:', error);
    }
}

function getInputValue(elementId: string): string {
    const inputElement = document.getElementById(elementId) as HTMLInputElement;
    return inputElement ? inputElement.value : '';
}

// function updateChatUI(messages: Message[]) {
//     const chat = document.getElementById('chat');
//     if (!chat) return;

//     chat.innerHTML = '';
//     messages.forEach(message => {
//         const div = document.createElement('div');
//         div.textContent = `${message.sender}: ${message.message}`;
//         chat.appendChild(div);
//     });
// }

function updateChatUI(messages: Message[]) {
    const chat = document.getElementById('chat');
    if (!chat) return;

    chat.innerHTML = '';
    messages.forEach(message => {
        // Create the main container div
        const messageContainer = document.createElement('div');
        messageContainer.className = 'messageContainer';

        // Create the sender name div
        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = message.sender;

        // Create the message text div
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message.message;

        // Append the sender and message divs to the container
        messageContainer.appendChild(senderDiv);
        messageContainer.appendChild(messageDiv);

        // Append the container to the chat
        chat.appendChild(messageContainer);
    });
}

populateChat();