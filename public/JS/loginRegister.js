import {displayFeedPosts} from './feed.js';
const loginLink = document.getElementById('login-link');
const systemMessage=document.getElementById('system-message');

document.querySelectorAll('.login-link').forEach(function(element) {
  element.addEventListener('click', function(event) {
      event.preventDefault(); 
      openLogin();
  });
});

export function openLogin() {
    closePopup();
    if (loginLink.innerText=="Log out"){
      openLogOut();
    } else{
      document.getElementById('login-popup').style.display = 'block';
    };
}
window.openLogin = openLogin;

export function loginUser(event){
    closeNav();
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
          document.getElementById("feed-button").classList.add('active');
          displayFeedPosts();
          checkCurrentUser().then(isUserLoggedIn => {
            if (isUserLoggedIn) {
              loginLink.innerText = "Log out";
            } else {
              loginLink.innerText = "Login";
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

window.loginUser=loginUser;

document.querySelector('.register-link').addEventListener('click', function(event) {
  event.preventDefault(); 
  openRegister();
});

export function registerUser(event){
    event.preventDefault();
    closeNav();
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
            password: newPassword,
            followers:[],
            following:[]
          };
        
          // using Fetch to make the AJAX post request
          fetch('http://localhost:8000/M00980001/users', {
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
              document.getElementById("feed-button").classList.add('active');
              displayFeedPosts();
              checkCurrentUser().then(isUserLoggedIn => {
                if (isUserLoggedIn) {
                  loginLink.innerText = "Log out";
                } else {
                  loginLink.innerText = "Login";
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
window.registerUser=registerUser;

export function logOutUser(){
    fetch('http://localhost:8000/M00980001/login', {
      method: 'DELETE',
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
            document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById("feed-button").classList.add('active');
            document.getElementById("searched-posts").style.display="none";
            openSections()
            openFeed();
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
  window.logOutUser=logOutUser;

