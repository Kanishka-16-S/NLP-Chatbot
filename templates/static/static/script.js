var chatBox = document.getElementById("chat-box");
var statusText = document.getElementById("status");
var inputField = document.getElementById("user-input");
var typingIndicator = document.getElementById("typing");
var toast = document.getElementById("toast");
var historyPanel = document.getElementById("history-panel");
var historyContent = document.getElementById("history-content");
var voiceEnabled = true;

var quickReplies = ["Hello", "What can you do?", "Tell me a joke", "Movie recommendation", "Book recommendation", "How are you?"];

window.onload = function() {
    loadChat();
    showQuickReplies();
    loadHistory();
};

function showQuickReplies() {
    var container = document.getElementById("quick-replies");
    container.innerHTML = "";
    
    quickReplies.forEach(function(reply) {
        var btn = document.createElement("button");
        btn.className = "quick-reply-btn";
        btn.innerText = reply;
        btn.onclick = function() {
            inputField.value = reply;
            sendMessage();
        };
        container.appendChild(btn);
    });
}

function showToast(message) {
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(function() {
        toast.classList.remove("show");
    }, 2000);
}

function clearChat() {
    chatBox.innerHTML = "";
    localStorage.removeItem("chatHistory");
    addMessage("Bot", "Chat cleared! How can I help you?");
}

function copyMessage(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast("Copied!");
    }).catch(function() {
        showToast("Failed to copy");
    });
}

function saveChat() {
    var messages = [];
    document.querySelectorAll(".message").forEach(function(msg) {
        messages.push(msg.innerText);
    });
    localStorage.setItem("chatHistory", JSON.stringify(messages));
}

function loadChat() {
    var history = localStorage.getItem("chatHistory");
    if (history) {
        var messages = JSON.parse(history);
        messages.forEach(function(msg) {
            var isUser = msg.includes("You:");
            var text = msg.replace(/^(You:|Bot:)\s*/, "");
            addMessage(isUser ? "You" : "Bot", text);
        });
    }
}

function addMessage(sender, text) {
    var now = new Date();
    var time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    var div = document.createElement("div");
    div.className = "message " + sender.toLowerCase();
    div.innerHTML = "<span class='time'>" + time + "</span>" + text;
    
    div.onclick = function() {
        copyMessage(text);
    };
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    var message = inputField.value.trim();
    if (message === "") return;

    addMessage("You", message);
    inputField.value = "";
    statusText.innerText = "Typing...";
    saveChat();
    typingIndicator.style.display = "block";
    chatBox.scrollTop = chatBox.scrollHeight;

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/get", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        typingIndicator.style.display = "none";
        if (xhr.status === 200) {
            try {
                var data = JSON.parse(xhr.responseText);
                if (data.response) {
                    addMessage("Bot", data.response);
                    statusText.innerText = "Online";
                    saveChat();
                    saveToHistory(message, data.response);
                    
                    if (voiceEnabled) {
                        speak(data.response);
                    }
                }
            } catch (e) {
                statusText.innerText = "Error!";
            }
        } else {
            statusText.innerText = "Error!";
        }
    };
    
    xhr.onerror = function() {
        typingIndicator.style.display = "none";
        statusText.innerText = "Error!";
    };
    
    xhr.send(JSON.stringify({ msg: message }));
}

function speak(text) {
    if (!voiceEnabled) return;
    
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
}

function toggleVoiceOutput() {
    voiceEnabled = !voiceEnabled;
    statusText.innerText = voiceEnabled ? "Sound On" : "Sound Off";
    setTimeout(function() {
        statusText.innerText = "Online";
    }, 1500);
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}

function toggleVoice() {
    if (!("webkitSpeechRecognition" in window)) {
        statusText.innerText = "Not supported";
        setTimeout(function() {
            statusText.innerText = "Online";
        }, 1500);
        return;
    }
    
    var recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    
    statusText.innerText = "Listening...";
    
    recognition.onresult = function(event) {
        var transcript = event.results[0][0].transcript;
        inputField.value = transcript;
        sendMessage();
    };
    
    recognition.onerror = function() {
        statusText.innerText = "Voice error";
        setTimeout(function() {
            statusText.innerText = "Online";
        }, 1500);
    };
    
    recognition.start();
}

function toggleHistory() {
    historyPanel.classList.toggle("show");
    loadHistory();
}

function saveToHistory(question, answer) {
    var history = JSON.parse(localStorage.getItem("chatHistoryData") || "[]");
    var now = new Date();
    var time = now.toLocaleString();
    
    history.unshift({
        question: question,
        answer: answer,
        time: time
    });
    
    if (history.length > 50) {
        history.pop();
    }
    
    localStorage.setItem("chatHistoryData", JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    var history = JSON.parse(localStorage.getItem("chatHistoryData") || "[]");
    historyContent.innerHTML = "";
    
    if (history.length === 0) {
        historyContent.innerHTML = "<p style='text-align: center; color: #999; padding: 20px;'>No history yet</p>";
        return;
    }
    
    history.forEach(function(item) {
        var div = document.createElement("div");
        div.className = "history-item";
        div.innerHTML = "<div class='question'>" + item.question + "</div>" +
                        "<div class='answer'>" + item.answer + "</div>" +
                        "<div class='time'>" + item.time + "</div>";
        div.onclick = function() {
            inputField.value = item.question;
            toggleHistory();
            sendMessage();
        };
        historyContent.appendChild(div);
    });
}

function clearAllHistory() {
    if (confirm("Clear all chat history?")) {
        localStorage.removeItem("chatHistoryData");
        localStorage.removeItem("chatHistory");
        loadHistory();
        showToast("History cleared!");
    }
}

inputField.onkeypress = function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
};
