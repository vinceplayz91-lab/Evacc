```javascript
let users = {
admin:{password:"admin123",department:"Administration"},
student:{password:"1234",department:"Computer Science"}
};

let currentUser=null;

let organizations={};


function login(){

let u=document.getElementById("username").value;
let p=document.getElementById("password").value;

if(users[u] && users[u].password===p){

currentUser=u;

document.querySelector(".login-box").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("welcome").innerText="Welcome "+u;

alert("Login Successful");

}else{

alert("Invalid login");

}

}


function register(){

let u=prompt("Enter username");
let p=prompt("Enter password");
let d=prompt("Enter department");

if(users[u]){

alert("User exists");

}else{

users[u]={password:p,department:d};
alert("User registered");

}

}


function createOrg(){

let name=prompt("Organization name");

if(!organizations[name]){

organizations[name]={creator:currentUser,events:[]};

alert("Organization created");

}else{

alert("Already exists");

}

}


function createEvent(){

let org=prompt("Organization name");
let event=prompt("Event name");
let desc=prompt("Description");
let req=prompt("Requirements (comma separated)");

if(!organizations[org]){

alert("Organization does not exist");
return;

}

organizations[org].events.push({

name:event,
description:desc,
requirements:req.split(","),
creator:currentUser,
participants:[],
requests:[],
chat:[]

});

alert("Event created");

}


function viewOrgs(){

let display=document.getElementById("display");

display.innerHTML="";

for(let org in organizations){

display.innerHTML+=`<h3>${org}</h3>`;

organizations[org].events.forEach(e=>{

display.innerHTML+=`

<div>
<b>${e.name}</b><br>
${e.description}<br>
Requirements: ${e.requirements.join(", ")}<br>
Participants: ${e.participants.length}
</div><hr>

`;

});

}

}


function joinEvent(){

let org=prompt("Organization");
let event=prompt("Event name");

let found=false;

organizations[org].events.forEach(e=>{

if(e.name===event){

e.requests.push(currentUser);
found=true;

alert("Join request sent");

}

});

if(!found) alert("Event not found");

}
```
