import { io } from "socket.io-client";
import { backendUrl } from "./consts";
import { Message } from "../server/types";
import { getUsername } from "./generateUsername";

const username = getUsername();

let isChatPopout = false;

let socket = io(backendUrl);

socket.on('chat:message', (message) => {
    populateChat();
});

let isSecondCloseReceived = false;
window.addEventListener("message", (event) => {
    if (event.data === "chatPopoutClose") {
        if (isSecondCloseReceived) {
            const mainChat = document.querySelector(".chatContainer");
            mainChat.classList.toggle("hidden");
            isChatPopout = false;
            populateChat();
        } else {
            isSecondCloseReceived = true;
        }
    }
});

document.getElementById("message")?.addEventListener("keydown", (event) => {
     if (event.ctrlKey) {
       switch (event.key.toLowerCase()) {
         case "b":
           console.log("Bold");
           event.preventDefault();
           applyMarkdown("**");
           break;
         case "i":
           event.preventDefault();
           applyMarkdown("*");
           break;
         case "x":
           if (event.shiftKey) {
             event.preventDefault();
             applyMarkdown("~~");
           }
           break;
         case "c":
           if (event.altKey && event.shiftKey) {
             event.preventDefault();
             applyMarkdown("``");
           }
           break;
       }
     }
});

document.getElementById('message')?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && event.shiftKey) {
        return;
    } else if (event.key === 'Enter') {
        event.preventDefault();
        // Call the function to send the message
        sendMessage();
        const inputElement = event.target as HTMLInputElement;
        inputElement.value = '';
    }
});
document.getElementById('sendMessageBtn')?.addEventListener('click', sendMessage);
document.getElementById("chatPopoutBtn")?.addEventListener("click", () => {
     let url = "./chat.html"; // URL of the content to display in the new window
     let title = "Popout Window";
     let width = 600;
     let height = 800;

     // Calculate the position of the window so it's centered
     let left = screen.width / 2 - width / 2;
     let top = screen.height / 2 - height / 2;

     // Open the new window with the specified URL and features
    const chatPopoutWindow = window.open(
       url,
       title,
       `width=${width},height=${height},top=${top},left=${left}`
     );

     const mainChat = document.querySelector(".chatContainer");
     mainChat.classList.toggle("hidden");
     isChatPopout = true;

    chatPopoutWindow.addEventListener('unload', () => {
        parent.postMessage('chatPopoutClose', '*');
    });
});


function applyMarkdown(syntax: string) {
    const textarea = document.querySelector<HTMLTextAreaElement>("sl-textarea"); // Adjust the selector as needed
    if (!textarea) return;

    console.log("Applying markdown", syntax);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    textarea.value = `${syntax}${selectedText}${syntax}`;
    textarea.setSelectionRange(start + syntax.length, end + syntax.length);
    textarea.focus();
}

async function sendMessage() {
    const message = getInputValue('message');
    if (!message) return;

    try {
        await postMessage({ message, sender: username, timestamp: new Date().toISOString() });
        await populateChat();
        const inputElement = document.getElementById('message') as HTMLInputElement;
        inputElement.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

async function postMessage(data: { message: string, sender: string, timestamp: string }) {
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
    if (isChatPopout) {
        return;
    }
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

function updateChatUI(messages: Message[]) {
    const chat = document.getElementById('chat');
    if (!chat) return;

    chat.innerHTML = '';

    if (messages.length === 0) {
        const noMessages = document.createElement('div');
        noMessages.textContent = 'No messages to display';
        chat.appendChild(noMessages);
        return;
    }

    messages.forEach(message => {
        // Create the main container div
        const messageContainer = document.createElement('div');
        messageContainer.className = 'messageContainer';

        // Create the sender name div
        const senderDiv = document.createElement('div');
        senderDiv.className = 'sender';
        senderDiv.textContent = message.sender;

        // Make timestamp be shown beside sender
        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'timestamp';
        timestampDiv.textContent = new Date(message.timestamp).toLocaleTimeString();

        // Create the message text div
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message.message;

        // Append the sender and message divs to the container
        messageContainer.appendChild(senderDiv);
        messageContainer.appendChild(timestampDiv);
        messageContainer.appendChild(messageDiv);

        const temp = `
        <div class="messageContainer">
            <div class="senderGroup">
                <div class="sender">${message.sender}</div>
                <sl-relative-time class="timestamp" date="${new Date(
                  message.timestamp
                )}"></sl-relative-time>
            </div>
            <div class="message">
                <md-block>${message.message}</md-block>
            </div>
        </div>`;
        chat.innerHTML += temp;
    });
}

populateChat();