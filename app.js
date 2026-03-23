// ======= CLASSES =======
class User {
  constructor(name, email, password, bio="", dept="", contact="", birthdate="", sex="") {
    this.name = name;
    this.email = email;
    this.password = password;
    this.bio = bio;
    this.dept = dept;
    this.contact = contact;
    this.birthdate = birthdate;
    this.sex = sex;
    this.schedule = Array(5).fill(Array(8).fill(false)); // Mon-Fri, 8 blocks
    this.notifications = [];
  }

  get age() {
    if (!this.birthdate) return "";
    let diff = new Date() - new Date(this.birthdate);
    return Math.floor(diff / (1000*60*60*24*365));
  }

  save() { localStorage.setItem("currentUser", JSON.stringify(this)); }
  static load() {
    let data = JSON.parse(localStorage.getItem("currentUser"));
    if (!data) return null;
    let u = new User(data.name, data.email, data.password, data.bio, data.dept, data.contact, data.birthdate, data.sex);
    u.schedule = data.schedule || Array(5).fill(Array(8).fill(false));
    u.notifications = data.notifications || [];
    return u;
  }
}

class Event {
  constructor(title, desc, reqs, date, time, org, creator) {
    this.id = "ev-" + Date.now();
    this.title = title;
    this.desc = desc;
    this.reqs = reqs;
    this.date = date;
    this.time = time;
    this.org = org;
    this.creator = creator; // email of creator
    this.participants = [];
    this.joinRequests = [];
    this.chat = [];
  }
  save() { 
    let events = JSON.parse(localStorage.getItem("events")) || [];
    let idx = events.findIndex(e=>e.id===this.id);
    if(idx>=0) events[idx]=this;
    else events.push(this);
    localStorage.setItem("events", JSON.stringify(events));
  }
  static all() {
    return JSON.parse(localStorage.getItem("events")) || [];
  }
}

class JoinRequest {
  constructor(userEmail) { this.userEmail = userEmail; this.status="pending"; }
}

class ChatMessage {
  constructor(sender, text) {
    this.sender = sender;
    this.text = text;
    this.time = new Date().toLocaleTimeString();
  }
}

// ======= UI HANDLERS =======
let currentUser = User.load();
let scheduleGridEl = document.getElementById("schedule-grid");

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

// Sidebar navigation
document.getElementById("nav-dashboard").onclick = ()=>renderDashboard();
document.getElementById("nav-my-events").onclick = ()=>renderMyEvents();
document.getElementById("nav-create-event").onclick = ()=>showPage("page-create-event");
document.getElementById("nav-notifications").onclick = ()=>showPage("page-notifications");

// Profile modal
document.getElementById("user-icon").onclick = ()=>openProfile();
document.getElementById("close-profile").onclick = ()=>closeProfile();
document.getElementById("profile-birthdate").onchange = ()=>document.getElementById("profile-age").value = currentUser.age;

// Create Event
document.getElementById("create-event-form").onsubmit = function(e){
  e.preventDefault();
  let ev = new Event(
    document.getElementById("event-title").value,
    document.getElementById("event-desc").value,
    document.getElementById("event-req").value,
    document.getElementById("event-date").value,
    document.getElementById("event-time").value,
    document.getElementById("event-org").value,
    currentUser.email
  );
  ev.save();
  alert("Event created!");
  renderDashboard();
  showPage("page-dashboard");
}

// ======= RENDER FUNCTIONS =======
function renderDashboard() {
  showPage("page-dashboard");
  let container = document.getElementById("dashboard-events");
  container.innerHTML = "";
  Event.all().forEach(ev=>{
    let card = document.createElement("div");
    card.className="card";
    card.innerHTML = `<h3>${ev.title}</h3><p>${ev.desc}</p><small>${ev.date} ${ev.time}</small>`;
    container.appendChild(card);
  });
}

function renderMyEvents() {
  showPage("page-my-events");
  let container = document.getElementById("my-events-container");
  container.innerHTML = "";
  Event.all().filter(ev=>ev.creator===currentUser.email)
    .forEach(ev=>{
      let card = document.createElement("div");
      card.className="card";
      card.innerHTML = `<h3>${ev.title}</h3><p>${ev.desc}</p>`;
      container.appendChild(card);
  });
}

// Profile modal
function openProfile() {
  document.getElementById("profile-modal").classList.remove("hidden");
  // Populate fields
  document.getElementById("profile-name").value = currentUser.name;
  document.getElementById("profile-email").value = currentUser.email;
  document.getElementById("profile-pass").value = currentUser.password;
  document.getElementById("profile-bio").value = currentUser.bio;
  document.getElementById("profile-dept").value = currentUser.dept;
  document.getElementById("profile-contact").value = currentUser.contact;
  document.getElementById("profile-birthdate").value = currentUser.birthdate;
  document.getElementById("profile-age").value = currentUser.age;
  document.getElementById("profile-sex").value = currentUser.sex;

  // Render schedule
  scheduleGridEl.innerHTML = "";
  for(let i=0;i<5;i++){
    for(let j=0;j<8;j++){
      let cell = document.createElement("div");
      cell.className="schedule-cell";
      if(currentUser.schedule[i][j]) cell.classList.add("selected");
      cell.onclick=()=>{cell.classList.toggle("selected"); currentUser.schedule[i][j]=!currentUser.schedule[i][j];};
      scheduleGridEl.appendChild(cell);
    }
  }
}

function closeProfile(){ document.getElementById("profile-modal").classList.add("hidden"); }

// Save profile
document.getElementById("profile-form").onsubmit=function(e){
  e.preventDefault();
  currentUser.name=document.getElementById("profile-name").value;
  currentUser.email=document.getElementById("profile-email").value;
  currentUser.password=document.getElementById("profile-pass").value;
  currentUser.bio=document.getElementById("profile-bio").value;
  currentUser.dept=document.getElementById("profile-dept").value;
  currentUser.contact=document.getElementById("profile-contact").value;
  currentUser.birthdate=document.getElementById("profile-birthdate").value;
  currentUser.sex=document.getElementById("profile-sex").value;
  currentUser.save();
  alert("Profile saved!");
  closeProfile();
}

// Initial render
if(!currentUser){
  let name = prompt("Enter your name to create account:");
  let email = prompt("Enter Gmail:");
  let pass = prompt("Enter password:");
  currentUser = new User(name,email,pass);
  currentUser.save();
}
renderDashboard();