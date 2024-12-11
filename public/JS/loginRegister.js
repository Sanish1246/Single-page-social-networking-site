import {displayFeedPosts} from './feed.js';
const loginLink = document.getElementById('login-link');

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
    const systemMessage=document.getElementById('system-message');
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
