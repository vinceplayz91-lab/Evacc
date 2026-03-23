// ===== STORAGE =====
const get = k => JSON.parse(localStorage.getItem(k)) || [];
const set = (k,v)=>localStorage.setItem(k,JSON.stringify(v));

// ===== CLASSES =====
class User {
  constructor(email, pass){
    this.email=email;
    this.pass=pass;
    this.name="User";
    this.bio="";
    this.birth="";
    this.schedule=Array.from({length:5},()=>Array(6).fill(false));
    this.notifications=[];
  }
  get age(){
    if(!this.birth) return "";
    return Math.floor((Date.now()-new Date(this.birth))/(365*24*60*60*1000));
  }
}

class Event {
  constructor(title,desc,date,time,reqs,creator){
    this.id=Date.now();
    this.title=title;
    this.desc=desc;
    this.date=date;
    this.time=time;
    this.reqs=reqs;
    this.creator=creator;
    this.participants=[];
    this.requests=[];
    this.chat=[];
  }
}

// ===== AUTH =====
let currentUser=null;

function login(){
  let users=get("users");
  let u=users.find(x=>x.email==auth-email.value && x.pass==auth-pass.value);
  if(!u) return alert("Invalid");
  currentUser=u;
  startApp();
}

function register(){
  let users=get("users");
  let u=new User(auth-email.value,auth-pass.value);
  users.push(u); set("users",users);
  alert("Account created");
}

function startApp(){
  auth-page.classList.add("hidden");
  app.classList.remove("hidden");
  renderAll();
}

// ===== NAV =====
function showPage(p){
  document.querySelectorAll(".page").forEach(x=>x.classList.add("hidden"));
  document.getElementById(p).classList.remove("hidden");
}

// ===== EVENTS =====
function createEvent(){
  let events=get("events");
  let e=new Event(title.value,desc.value,date.value,time.value,reqs.value,currentUser.email);
  events.push(e); set("events",events);
  renderAll();
}

function renderAll(){
  renderDashboard();
  renderMy();
  renderNotif();
}

function renderDashboard(){
  let box=dashboard; box.innerHTML="";
  get("events").forEach(e=>{
    let d=document.createElement("div");
    d.className="card";
    d.innerHTML=`${e.title}<br><button onclick="openEvent(${e.id})">Open</button>`;
    box.appendChild(d);
  });
}

function renderMy(){
  let box=myEvents; box.innerHTML="";
  get("events").filter(e=>e.creator==currentUser.email)
  .forEach(e=>{
    let d=document.createElement("div");
    d.className="card";
    d.innerHTML=`${e.title}<br><button onclick="openEvent(${e.id})">Manage</button>`;
    box.appendChild(d);
  });
}

// ===== EVENT VIEW =====
let activeEvent=null;

function openEvent(id){
  let events=get("events");
  activeEvent=events.find(e=>e.id==id);

  eventTitle.innerText=activeEvent.title;
  eventDesc.innerText=activeEvent.desc;

  joinBtn.innerText = activeEvent.participants.includes(currentUser.email)
    ? "Joined"
    : "Join";

  joinBtn.onclick=()=>{
    activeEvent.requests.push(currentUser.email);
    saveEvent();
    notify(activeEvent.creator,"New join request");
    renderEvent();
  };

  renderEvent();
  eventModal.classList.remove("hidden");
}

function renderEvent(){
  participants.innerHTML="";
  activeEvent.participants.forEach(p=>{
    participants.innerHTML+=`<div>${p}</div>`;
  });

  requests.innerHTML="";
  if(activeEvent.creator==currentUser.email){
    activeEvent.requests.forEach(r=>{
      requests.innerHTML+=`
        <div>${r}
          <button onclick="accept('${r}')">✔</button>
          <button onclick="reject('${r}')">✖</button>
        </div>`;
    });
  }

  renderChat();
}

function accept(u){
  activeEvent.participants.push(u);
  activeEvent.requests=activeEvent.requests.filter(x=>x!=u);
  notify(u,"Accepted to event");
  saveEvent(); renderEvent();
}

function reject(u){
  activeEvent.requests=activeEvent.requests.filter(x=>x!=u);
  saveEvent(); renderEvent();
}

function saveEvent(){
  let events=get("events");
  let i=events.findIndex(e=>e.id==activeEvent.id);
  events[i]=activeEvent;
  set("events",events);
}

// ===== CHAT =====
function renderChat(){
  chatBox.innerHTML="";
  activeEvent.chat.forEach(m=>{
    chatBox.innerHTML+=`<div>${m.user}: ${m.text}</div>`;
  });
}

function sendMsg(){
  activeEvent.chat.push({user:currentUser.email,text:chatInput.value});
  chatInput.value="";
  saveEvent();
  renderChat();
}

// ===== PROFILE =====
function openProfile(){
  pName.value=currentUser.name;
  pBirth.value=currentUser.birth;
  pAge.value=currentUser.age;
  pBio.value=currentUser.bio;
  renderSchedule();
  profileModal.classList.remove("hidden");
}

function saveProfile(){
  currentUser.name=pName.value;
  currentUser.birth=pBirth.value;
  currentUser.bio=pBio.value;
  saveUser();
  closeModal("profileModal");
}

function renderSchedule(){
  schedule.innerHTML="";
  for(let i=0;i<5;i++){
    for(let j=0;j<6;j++){
      let c=document.createElement("div");
      c.className="cell";
      if(currentUser.schedule[i][j]) c.classList.add("active");
      c.onclick=()=>{
        currentUser.schedule[i][j]=!currentUser.schedule[i][j];
        c.classList.toggle("active");
        saveUser();
      };
      schedule.appendChild(c);
    }
  }
}

function saveUser(){
  let users=get("users");
  let i=users.findIndex(u=>u.email==currentUser.email);
  users[i]=currentUser;
  set("users",users);
}

// ===== NOTIFICATIONS =====
function notify(email,msg){
  let users=get("users");
  let u=users.find(x=>x.email==email);
  u.notifications.push(msg);
  set("users",users);
}

function renderNotif(){
  notifications.innerHTML="";
  currentUser.notifications.forEach(n=>{
    notifications.innerHTML+=`<div>${n}</div>`;
  });
}

// ===== UTILS =====
function closeModal(id){
  document.getElementById(id).classList.add("hidden");
}