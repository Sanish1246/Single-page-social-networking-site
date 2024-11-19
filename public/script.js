const modeButton=document.getElementById("mode-button");
const top_bar=document.getElementById("top-bar");
const systemMessage=document.getElementById('system-message');
const loginLink=document.getElementById('login-link');
const currentUser=document.getElementById('currentUser');

window.onload = () => {
  history.pushState(null, '', '/M00980001');
  checkCurrentUser();
};

async function checkCurrentUser() {
  try {
    const response = await fetch('http://localhost:8000/M00980001/user');
    const data = await response.json();
    if (data.username) {
      document.getElementById('currentUser').innerText = data.username;
      return true;
    } else {
      document.getElementById('currentUser').innerText = "No user";
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
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
    if (loginLink.innerText=="Log out"){
      openLogOut();
    } else{
      document.getElementById('login-popup').style.display = 'block';

      // Add "/login" to the URL without reloading the page
      history.pushState(null, '', '/M00980001/login');
    };
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
    document.getElementById('logout-popup').style.display = 'none';
    document.getElementById('upload-popup').style.display = 'none';

    history.replaceState(null, '', '/M00980001');
}

function openLogOut(){
  document.getElementById('logout-popup').style.display = 'block';

  // Add "/logout" to the URL without reloading the page
  history.pushState(null, '', '/M00980001/logout');
}

function logOutUser(){
  fetch('http://localhost:8000/M00980001/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
      .then(message => {
        if (message.message) {
          closePopup();
          systemMessage.innerText=message.message;
          systemMessage.style.opacity='1';
          setTimeout(closeMessage,2000);
          loginLink.innerText="Login";

        }
      })
      .catch(error => {
        console.error('Error:', error);
        systemMessage.innerText='❌ Error: ' + error;
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
      });

  checkCurrentUser();
}

// Handle popstate event for when the user navigates using the browser back button
window.addEventListener('popstate', function(event) {
    if (document.getElementById('login-popup').style.display === 'block' || 
        document.getElementById('register-popup').style.display === 'block'||
        document.getElementById('logout-popup').style.display === 'block'||
        document.getElementById('upload-popup').style.display === 'block') {
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

function openUpload(){
  document.getElementById('upload-popup').style.display = 'block';
}

function closeMessage(){
    systemMessage.style.opacity='0';
}

function registerUser(event){
    event.preventDefault();
    const newUsername= document.getElementById('newUsername').value;
    const newEmail=document.getElementById('newEmail').value;
    const newPassword=document.getElementById('newPassword').value;
    const newUsernameError=document.getElementById('newUsernameError');
    const newEmailError=document.getElementById('newEmailError');
    
    newUsernameError.innerText="";
    newEmailError.innerText="";

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
              checkCurrentUser().then(isUserLoggedIn => {
                if (isUserLoggedIn) {
                  loginLink.innerText = "Log out";
                } else {
                  loginLink.innerText = "Log in";
                }
              });
    
            };
            if(data.error=="Username already in use!"){
              newUsernameError.innerText=' ❌ ' + data.error;
            } else {
              if(data.error=="Email already in use!"){
                newEmailError.innerText=' ❌ ' + data.error;
              }
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
    const emailError=document.getElementById('emailError');
    const passwordError=document.getElementById('passwordError');

    emailError.innerText="";
    passwordError.innerText="";

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
          checkCurrentUser().then(isUserLoggedIn => {
            if (isUserLoggedIn) {
              loginLink.innerText = "Log out";
            } else {
              loginLink.innerText = "Log in";
            }
          });

        } else {
          if(data.error=="Invalid email"){
            emailError.innerText=' ❌ ' + data.error;
          } else {
            passwordError.innerText=' ❌ ' + data.error;
          }
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

function publishPost(event){
  event.preventDefault();
  const owner=document.getElementById('currentUser').innerText;
  const newTitle=document.getElementById("upload-title");
  const newContent=document.getElementById("upload-content");
  const newTags=document.getElementById("tags");

  console.log(newTitle.value);
  console.log(owner);
  console.log(newContent.value);
  console.log(newTags.value);

}
