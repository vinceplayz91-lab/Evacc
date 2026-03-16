// ======= Classes =======
class User {
    constructor(name, department, role, password) {
        this.name = name;
        this.department = department;
        this.role = role;
        this.password = password;
    }
}

class Event {
    constructor(title, description, requirements, datetime, organization, organizer) {
        this.title = title;
        this.description = description;
        this.requirements = requirements;
        this.datetime = datetime;
        this.organization = organization || "N/A";
        this.organizer = organizer;
        this.participants = [];
        this.joinRequests = [];
        this.chatMessages = [];
    }
}

class JoinRequest {
    constructor(user) {
        this.user = user;
        this.status = "Pending"; // Pending, Accepted, Rejected
    }
}

class ChatMessage {
    constructor(user, message) {
        this.user = user;
        this.message = message;
        this.timestamp = new Date().toLocaleTimeString();
    }
}

class EventManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem("users") || "[]");
        this.events = JSON.parse(localStorage.getItem("events") || "[]");
    }

    save() {
        localStorage.setItem("users", JSON.stringify(this.users));
        localStorage.setItem("events", JSON.stringify(this.events));
    }

    addUser(user) {
        this.users.push(user);
        this.save();
    }

    addEvent(event) {
        this.events.push(event);
        this.save();
    }

    getEvent(title) {
        return this.events.find(e => e.title === title);
    }
}

// ======= UI Handler =======
const UI = {
    currentUser: null,
    currentEvent: null,
    manager: new EventManager(),

    showDashboard() {
        document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("dashboard").classList.remove("hidden");
        UI.renderEvents();
    },

    showEventCreation() {
        document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("event-creation").classList.remove("hidden");
    },

    showProfile() {
        document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("profile").classList.remove("hidden");
        document.getElementById("profile-name").textContent = UI.currentUser.name;
        document.getElementById("profile-dept").textContent = UI.currentUser.department;
        document.getElementById("profile-role").textContent = UI.currentUser.role;
    },

    backToDashboard() {
        UI.showDashboard();
    },

    renderEvents() {
        const container = document.getElementById("event-list");
        container.innerHTML = "";
        UI.manager.events.forEach(ev => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <h3>${ev.title}</h3>
                <p>${ev.description}</p>
                <button onclick="UI.viewEvent('${ev.title}')">View Details</button>
            `;
            container.appendChild(card);
        });
    },

    viewEvent(title) {
        UI.currentEvent = UI.manager.getEvent(title);
        document.querySelectorAll("main section").forEach(sec => sec.classList.add("hidden"));
        document.getElementById("event-details").classList.remove("hidden");

        document.getElementById("detail-title").textContent = UI.currentEvent.title;
        document.getElementById("detail-desc").textContent = UI.currentEvent.description;
        document.getElementById("detail-req").textContent = `Requirements: ${UI.currentEvent.requirements}`;
        document.getElementById("detail-organizer").textContent = UI.currentEvent.organizer.name;
        document.getElementById("detail-participants").textContent = UI.currentEvent.participants.map(p => p.name).join(", ") || "None";

        UI.renderChat();
        if(UI.currentUser.role === "Organizer" && UI.currentUser.name === UI.currentEvent.organizer.name) {
            document.getElementById("join-requests").classList.remove("hidden");
            UI.renderRequests();
        } else {
            document.getElementById("join-requests").classList.add("hidden");
        }
    },

    requestJoinEvent() {
        if(!UI.currentEvent.joinRequests.some(r => r.user.name === UI.currentUser.name)){
            UI.currentEvent.joinRequests.push(new JoinRequest(UI.currentUser));
            UI.manager.save();
            alert("Join request sent!");
            UI.viewEvent(UI.currentEvent.title);
        }
    },

    renderRequests() {
        const container = document.getElementById("request-list");
        container.innerHTML = "";
        UI.currentEvent.joinRequests.forEach((req, idx) => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <p>${req.user.name} (${req.user.department}) - Status: ${req.status}</p>
                <button onclick="UI.acceptRequest(${idx})">Accept</button>
                <button onclick="UI.rejectRequest(${idx})">Reject</button>
            `;
            container.appendChild(div);
        });
    },

    acceptRequest(idx) {
        const req = UI.currentEvent.joinRequests[idx];
        req.status = "Accepted";
        UI.currentEvent.participants.push(req.user);
        UI.manager.save();
        UI.viewEvent(UI.currentEvent.title);
    },

    rejectRequest(idx) {
        const req = UI.currentEvent.joinRequests[idx];
        req.status = "Rejected";
        UI.manager.save();
        UI.viewEvent(UI.currentEvent.title);
    },

    sendMessage() {
        const input = document.getElementById("chat-input");
        if(input.value.trim() === "") return;
        UI.currentEvent.chatMessages.push(new ChatMessage(UI.currentUser.name, input.value));
        input.value = "";
        UI.manager.save();
        UI.renderChat();
    },

    renderChat() {
        const container = document.getElementById("chat-messages");
        container.innerHTML = "";
        UI.currentEvent.chatMessages.forEach(msg => {
            const p = document.createElement("p");
            p.textContent = `[${msg.timestamp}] ${msg.user}: ${msg.message}`;
            container.appendChild(p);
        });
        container.scrollTop = container.scrollHeight;
    }
};

// ======= Form Handlers =======
document.getElementById("auth-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const dept = document.getElementById("department").value;
    const role = document.getElementById("role").value;
    const pass = document.getElementById("password").value;

    let user = UI.manager.users.find(u => u.name === name);
    if(!user) {
        user = new User(name, dept, role, pass);
        UI.manager.addUser(user);
    } else if(user.password !== pass) {
        alert("Incorrect password!");
        return;
    }

    UI.currentUser = user;
    UI.showDashboard();
});

document.getElementById("create-event-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("event-title").value;
    const desc = document.getElementById("event-desc").value;
    const reqs = document.getElementById("event-req").value;
    const datetime = document.getElementById("event-datetime").value;
    const org = document.getElementById("event-org").value;

    const event = new Event(title, desc, reqs, datetime, org, UI.currentUser);
    UI.manager.addEvent(event);
    alert("Event created successfully!");
    UI.showDashboard();
});