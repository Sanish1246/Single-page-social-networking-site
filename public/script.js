const modeButton=document.getElementById("mode-button");
const top_bar=document.getElementById("top-bar");
const systemMessage=document.getElementById('system-message');
const loginLink=document.getElementById('login-link')

window.onload=()=>{
    history.pushState(null, '', '/M00980001');
}

function switchMode(){
    if (document.body.style.backgroundColor=="whitesmoke"){
        document.body.style.backgroundColor="black";
        modeButton.innerHTML="☀️ Light mode"
        top_bar.style.borderColor="white";
    } else {
        document.body.style.backgroundColor="whitesmoke";
        modeButton.innerHTML="🌙 Dark mode";
        top_bar.style.borderColor="black";
    }
}

document.querySelectorAll('.section-button').forEach(button => {
    button.addEventListener('click', function() {
        // Remove the active class from all buttons
        document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));
        
        // Add the active class to the clicked button
        this.classList.add('active');

        if (this.id=='feed-button'){
            openFeed();
        } else if (this.id=='people-button'){
            openPeople();
        } else {
            openFollowing();
        }
    });
});

function openNav() {
    document.getElementById("side-menu").style.width = "250px";
    document.getElementById("menu-opener").style.opacity = "0";
  }
  
  function closeNav() {
    document.getElementById("side-menu").style.width = "0";
    document.getElementById("menu-opener").style.opacity = "1";
  }

// Open the login popup and update the URL to "/login"
function openLogin() {
    closePopup();
    document.getElementById('login-popup').style.display = 'block';

    // Add "/login" to the URL without reloading the page
    history.pushState(null, '', '/M00980001/login');
}

// Open the register popup and update the URL to "/register"
function openRegister() {
    closePopup();
    document.getElementById('register-popup').style.display = 'block';

    // Add "/register" to the URL without reloading the page
    history.pushState(null, '', '/M00980001/register');
}

// Close both the login and register popups and restore the original URL
function closePopup() {
    document.getElementById('login-popup').style.display = 'none';
    document.getElementById('register-popup').style.display = 'none';

    history.replaceState(null, '', '/M00980001');
}

// Handle popstate event for when the user navigates using the browser back button
window.addEventListener('popstate', function(event) {
    if (document.getElementById('login-popup').style.display === 'block' || 
        document.getElementById('register-popup').style.display === 'block') {
        closePopup();
    }
});

// Attaching the popup to the login and register links
document.querySelectorAll('.login-link').forEach(function(element) {
    element.addEventListener('click', function(event) {
        event.preventDefault(); 
        openLogin();
    });
});

document.querySelector('.register-link').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    openRegister();
});


function closeSection(){
    document.getElementById('feed-posts').style.display = 'none';
    document.getElementById('following-posts').style.display = 'none';
    document.getElementById('people-section').style.display = 'none';
}

function openFollowing(){
    closeSection();
    document.getElementById('following-posts').style.display = 'block';
    history.pushState(null, '', '/M00980001/following');
}

function openFeed(){
    closeSection();
    document.getElementById('feed-posts').style.display = 'block';
    history.pushState(null, '', '/M00980001');
}

function openPeople(){
    closeSection();
    document.getElementById('people-section').style.display = 'block';
    history.pushState(null, '', '/M00980001/people');
}

function closeMessage(){
    systemMessage.style.opacity='0';
}

function registerUser(event){
    event.preventDefault();
    const newUsername= document.getElementById('newUsername').value;
    const newEmail=document.getElementById('newEmail').value;
    const newPassword=document.getElementById('newPassword').value;

    if (!newUsername || !newEmail || !newPassword) {
        systemMessage.innerText='❌ All fields must be filled';
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
    } else {
        const user = {
            username: newUsername,
            email: newEmail,
            password: newPassword
          };
        
          // using Fetch to make the AJAX post request
          fetch('http://localhost:8000/M00980001/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
          })
          .then(response => response.json())
          .then(data => {
            if (data.userId) {
              closePopup();
              systemMessage.innerText='✅ Account created successfully';
              systemMessage.style.opacity='1';
              setTimeout(closeMessage,2000);
    
            } else {
              systemMessage.innerText='❌ Falied to register' + data.error;
              systemMessage.style.opacity='1';
              setTimeout(closeMessage,2000);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            systemMessage.innerText='❌ Error' + error;
            systemMessage.style.opacity='1';
            setTimeout(closeMessage,2000);
          });
    }

      document.getElementById('newUsername').value="";
      document.getElementById('newEmail').value="";
      document.getElementById('newPassword').value="";
}

function loginUser(event){
    event.preventDefault();
    const newEmail=document.getElementById('email').value;
    const newPassword=document.getElementById('password').value;

    const user={
        email:newEmail,
        password:newPassword
    }

    fetch('http://localhost:8000/M00980001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })
      .then(response => response.json())
      .then(data => {
        if (data.userId) {
          closePopup();
          systemMessage.innerText='✅ User logged in successfully';
          systemMessage.style.opacity='1';
          setTimeout(closeMessage,2000);

        } else {
          systemMessage.innerText='❌ ' + data.error;
          systemMessage.style.opacity='1';
          setTimeout(closeMessage,2000);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        systemMessage.innerText='❌ Error: ' + error;
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
      });

      document.getElementById('email').value="";
      document.getElementById('password').value="";
}
