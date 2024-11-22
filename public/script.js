const modeButton=document.getElementById("mode-button");
const top_bar=document.getElementById("top-bar");
const systemMessage=document.getElementById('system-message');
const loginLink=document.getElementById('login-link');
const currentUser=document.getElementById('currentUser');

window.onload = () => {
  history.pushState(null, '', '/M00980001');
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
        } else if(this.id=="following-button") {
            openFollowing();
        } else {
          openRecommended();
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

document.getElementById('profile-button').addEventListener('click', function(event){
  event.preventDefault();
  closeSection();
  closeSectionButton();
  closeSaved();
  openProfile();
});

document.getElementById('home-button').addEventListener('click', function(event){
  closeFavourite();
  closeProfile();
  closeSaved();
  openSections();
});

document.getElementById('saved-button').addEventListener('click', function(event){
  closeProfile();
  closeFavourite();
  closeSection();
  closeSectionButton();
  openSaved();
});

document.getElementById('favourite-button').addEventListener('click', function(event){
  closeProfile();
  closeSaved();
  closeSection();
  closeSectionButton();
  openFavourite();
});

document.querySelector('.register-link').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    openRegister();
});


function closeSection(){
  document.querySelectorAll('.main-section').forEach(sct => sct.style.display='none');
}

function closeSectionButton(){
  document.querySelectorAll('.section-button').forEach(btn => btn.style.display='none');
}

function openProfile(){
  document.getElementById('user-profile').style.display='block';
  displayUserData();
}

function closeProfile(){
  document.getElementById('user-profile').style.display='none';
}

function openSaved(){
  document.getElementById('saved-posts').style.display='block';
}

function closeSaved(){
  document.getElementById('saved-posts').style.display='none';
}

function openFavourite(){
  document.getElementById('favourite-games').style.display='block';
}

function closeFavourite(){
  document.getElementById('favourite-games').style.display='none';
}

function openSections(){
  closeFavourite();
  closeSaved();
  closeProfile();
  document.querySelectorAll('.section-button').forEach(btn => btn.style.display='block');
  document.getElementById("feed-posts").style.display="block";
  document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));
}

function openFollowing(){
    closeSection();
    checkCurrentUser().then(isUserLoggedIn => {
      if (isUserLoggedIn) {
        document.getElementById('following-posts').style.display = 'block';
        history.pushState(null, '', '/M00980001/following');
      } else {
        systemMessage.innerText='❌ You must login to view this';
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
        closePopup();
      }
    });
}

function openFeed(){
    closeSection();
    document.getElementById('feed-posts').style.display = 'block';
    history.pushState(null, '', '/M00980001');
}

function openPeople(){
    closeSection();
    checkCurrentUser().then(isUserLoggedIn => {
      if (isUserLoggedIn) {
        document.getElementById('people-section').style.display = 'block';
        history.pushState(null, '', '/M00980001/people');
      } else {
        systemMessage.innerText='❌ You must login to view this';
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
        closePopup();
      }
    });
}

function openRecommended(){
  closeSection();
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('recommended-section').style.display = 'block';
      history.pushState(null, '', '/M00980001/recommended');
    } else {
      systemMessage.innerText='❌ You must login to view this';
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    }
  });
}

function openUpload(){
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('upload-popup').style.display = 'block';
    } else {
      openLogin();
    }
  });
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
            password: newPassword,
            followers:[],
            following:[]
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

function publishPost(event) {
  event.preventDefault();
  
  const newOwner = document.getElementById('currentUser').innerText;
  const newTitle = document.getElementById("upload-title").value;
  const newContent = document.getElementById("upload-content").value;
  const newTags = document.getElementById("tags").value;
  const mediaFiles = document.getElementById("media").files; 

 
  const now = new Date();
  
 
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); 
  const year = String(now.getFullYear());
  const formattedDate = `${day}/${month}/${year}`;

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}`;

  const formData = new FormData();
  

  formData.append('owner', newOwner);
  formData.append('title', newTitle);
  formData.append('content', newContent);
  formData.append('tags', newTags);
  formData.append('level',0);
  formData.append('date', formattedDate); 
  formData.append('time', formattedTime);


  for (let i = 0; i < mediaFiles.length; i++) {
    formData.append('media', mediaFiles[i]); 
  }

 
  fetch('http://localhost:8000/M00980001/publish', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(message => {
    systemMessage.innerText=message.message;
    systemMessage.style.opacity='1';
    setTimeout(closeMessage,2000);
    closePopup();
  })
  .catch(error => {
    systemMessage.innerText='❌ Error: ' + error;
    systemMessage.style.opacity='1';
    setTimeout(closeMessage,2000);
    closePopup();
  });


document.getElementById("upload-title").value=null;
document.getElementById("upload-content").value=null;
document.getElementById("tags").value=null;
document.getElementById("media").value=''; 
}

async function displayUserData(){
  try {
    const response = await fetch('http://localhost:8000/M00980001/user');
    const data = await response.json();
    document.getElementById('profile-username').innerText = data.username;
    document.getElementById('user-following').innerText = data.following.length;
    document.getElementById('user-followers').innerText = data.followers.length;
    console.log(data.profileImg);

    const postsResponse = await fetch('http://localhost:8000/M00980001/user/posts');
    const posts = await postsResponse.json();

    loadYourPosts(posts, data);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function loadYourPosts(posts, data) {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = ''; // Clear previous posts if necessary

  // Inverti l'array dei post per mostrarli dal più recente al più vecchio
  posts = posts.reverse();

  posts.forEach(post => {
    // Crea la struttura HTML del post
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    // Costruisci l'HTML per il post
    postElement.innerHTML = `
      <div class="post-head">
          <img src="${data.profileImg || './images/default-photo.jpg'}" class="profile-img">
          <p>${data.username} <span class="post-date">on ${post.date}</span></p>
      </div>
      <hr>
      <div class="title-section">
          <p class="post-title">${post.title}</p>
      </div>
      <hr>
      <div class="post-content">
          <p>${post.content || ''}</p>
          ${post.media && post.media.length ? post.media.map(file => 
            file.path.endsWith('.mp4') 
              ? `<video controls><source src="${file.path}" type="video/mp4"></video>` 
              : `<img src="${file.path}" alt="Post Image" class="post-image">`
          ).join('') : ''}
      </div>
      <hr>
      <div class="post-info">
          <p>Level: ${post.level || 0}</p>
          <p>Comments: ${post.comments ? post.comments.length : 0}</p>
          <p>${post.time}</p>
      </div>
      <hr>
      <div class="post-bottom">
          <button>⬆️Level up</button>
          <button>⬇️Level down</button>
          <button>💬Comments</button>
          <button>⚲Save</button>
      </div>
      <hr>
      <div class="post-comment">
          <input type="text" placeholder="💬Leave a comment."><button>Post</button>
      </div>
    `;

    // Aggiungi il post al contenitore dei post
    postsContainer.appendChild(postElement);
  });
}

