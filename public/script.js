const modeButton=document.getElementById("mode-button");
const top_bar=document.getElementById("top-bar");
const systemMessage=document.getElementById('system-message');
const loginLink=document.getElementById('login-link');
const currentUser=document.getElementById('currentUser');

window.onload = () => {
  history.pushState(null, '', '/M00980001');
  displayFeedPosts();
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

async function openNav() {
    document.getElementById("side-menu").style.width = "250px";
    document.getElementById("menu-opener").style.opacity = "0";
    try {
      const response = await fetch(`http://localhost:8000/M00980001/user`);
      const data = await response.json();
      
      const profileImageElement = document.getElementById("user-img");
      profileImageElement.src = data.profileImg ? data.profileImg : './images/default-photo.jpg';

    } catch(error){
      console.log("Error: " + error)
    }

  }
  
  function closeNav() {
    document.getElementById("side-menu").style.width = "0";
    document.getElementById("menu-opener").style.opacity = "1";
  }


function openLogin() {
    closePopup();
    if (loginLink.innerText=="Log out"){
      openLogOut();
    } else{
      document.getElementById('login-popup').style.display = 'block';

      
      history.pushState(null, '', '/M00980001/login');
    };
}

function openRegister() {
    closePopup();
    document.getElementById('register-popup').style.display = 'block';

    history.pushState(null, '', '/M00980001/register');
}

function closePopup() {
    document.getElementById('login-popup').style.display = 'none';
    document.getElementById('register-popup').style.display = 'none';
    document.getElementById('logout-popup').style.display = 'none';
    document.getElementById('upload-popup').style.display = 'none';

    history.replaceState(null, '', '/M00980001');
}

function openLogOut(){
  document.getElementById('logout-popup').style.display = 'block';

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
    event.preventDefault(); 
    openRegister();
});


function closeSection(){
  document.querySelectorAll('.main-section').forEach(sct => sct.style.display='none');
}

function closeSectionButton(){
  document.querySelectorAll('.section-button').forEach(btn => btn.style.display='none');
}

function openProfile(){
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('user-profile').style.display='block';
      displayUserData();
    } else {
      systemMessage.innerText='❌ You must login to view this';
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    }
  });
}

function closeProfile(){
  document.getElementById('user-profile').style.display='none';
}

function openSaved(){
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('saved-posts').style.display='block';
    } else {
      systemMessage.innerText='❌ You must login to view this';
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    }
  });
}

function closeSaved(){
  document.getElementById('saved-posts').style.display='none';
}

function openFavourite(){
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('favourite-games').style.display='block';
    } else {
      systemMessage.innerText='❌ You must login to view this';
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    }
  });
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
    displayFeedPosts();
    history.pushState(null, '', '/M00980001');
}

function openPeople(){
    closeSection();
    checkCurrentUser().then(isUserLoggedIn => {
      if (isUserLoggedIn) {
        document.getElementById('people-section').style.display = 'block';
        history.pushState(null, '', '/M00980001/people');
        fetchPeople();
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

async function displayUserData() {
  try {
    const response = await fetch('http://localhost:8000/M00980001/user');
    const data = await response.json();

    document.getElementById('profile-username').innerText = data.username;
    document.getElementById('user-following').innerText = data.following.length;
    document.getElementById('user-followers').innerText = data.followers.length;

    const profileImageElement = document.getElementById("profileImage");
    profileImageElement.src = data.profileImg ? data.profileImg : './images/default-photo.jpg';

    const postsResponse = await fetch('http://localhost:8000/M00980001/user/posts');
    const posts = await postsResponse.json();

    loadYourPosts(posts, data);

  } catch (error) {
    console.error('Error:', error);
  }
}


document.getElementById('change-profile-pic').addEventListener('change', function(event) {
  const file = event.target.files[0]; 
  if (file) {
    const imgPreview = document.getElementById('profileImage'); 
    imgPreview.src = URL.createObjectURL(file); 
  }
});

document.getElementById('uploadButton').addEventListener('click', async function() {
  const fileInput = document.getElementById('change-profile-pic');
  const file = fileInput.files[0]; 
  
  if (file) {
    const formData = new FormData();
    formData.append('media', file);

    try {
      const response = await fetch('/M00980001/uploadProfilePicture', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        console.log('File uploaded successfully:', result);
      } else {
        console.error('File upload failed:', result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  } else {
    console.error('No file selected');
  }
});

async function loadYourPosts(posts, data) {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = ''; 

  posts = posts.reverse();

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

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
    postsContainer.appendChild(postElement);
  });
}

async function fetchPeople() {
  try {
    const response = await fetch('http://localhost:8000/M00980001/people');
    const people = await response.json();
    const peopleContainer = document.getElementById('people-container');

    const res = await fetch('http://localhost:8000/M00980001/user');
    const data = await res.json();
    let following = data.following; 

    peopleContainer.innerHTML = '';

    const header = document.createElement('h1');
    header.textContent = 'People';
    peopleContainer.appendChild(header);

    people.forEach(person => {
      const peopleElement = document.createElement('div');
      peopleElement.classList.add('person');
      const isFollowing = following.includes(person.username);

      peopleElement.innerHTML = `
            <img src="${person.profileImg || './images/default-photo.jpg'}" class="profile-img">
            <p>${person.username}</p>               
            <button class="follow-user ${isFollowing ? 'following' : ''}" id=${person.username}>
            ${isFollowing ? 'Following' : '+ Follow'}
            </button>
      `;

      peopleContainer.appendChild(peopleElement);
    });

    document.querySelectorAll('.follow-user').forEach(function(element) {
      element.addEventListener('click', async function(event) {
        event.preventDefault();
        const targetId = this.id;

        if (following.includes(targetId)) {
          this.classList.remove('following');
          this.innerText = '+ Follow';
          unfollowUser(targetId);
        } else {
          this.classList.add('following');
          this.innerText = 'Following';
          followUser(targetId);
        }
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

  async function followUser(id){
      fetch(`http://localhost:8000/M00980001/follow/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
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
        console.log(error);
        closePopup();
      });
  }

  async function unfollowUser(id){
    fetch(`http://localhost:8000/M00980001/unfollow/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
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
      console.log(error);
      closePopup();
    });
  }

  async function displayFeedPosts(){
    try {
    const response = await fetch('http://localhost:8000/M00980001/user');
    const data = await response.json();

    if(Object.keys(data).length === 0){
      const postsResponse = await fetch('http://localhost:8000/M00980001/latest');
      const posts = await postsResponse.json();
      loadLatestPosts(posts);
    } else {
      const postsResponse = await fetch('http://localhost:8000/M00980001/feed');
      const posts = await postsResponse.json();
      loadFeedPosts(posts, data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function loadFeedPosts(posts, data) {
  const postsContainer = document.getElementById('feed-posts-container');
  postsContainer.innerHTML = '';
  let following = data.following;

  posts = posts.reverse();

  for (const post of posts) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    const isFollowing = following.includes(post.owner);

    try {
      const response = await fetch(`/M00980001/postOwner/${post.owner}`);
      const profileData = await response.json();

      postElement.innerHTML = `
        <div class="post-head">
            <img src="${profileData.profileImg || './images/default-photo.jpg'}" class="profile-img">
            <p>${profileData.username} <span class="post-date">on ${post.date}</span></p>
            <button class="follow-user ${isFollowing ? 'following' : ''}" id=${post.owner}>
              ${isFollowing ? 'Following' : '+ Follow'}
            </button>
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

      postsContainer.appendChild(postElement);

    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  }

  document.querySelectorAll('.follow-user').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      if (following.includes(targetId)) {
        this.classList.remove('following');
        this.innerText = '+ Follow';
        unfollowUser(targetId); 
      } else {
        this.classList.add('following');
        this.innerText = 'Unfollow';
        followUser(targetId); 
      }
    });
  });
}


async function loadLatestPosts(posts) {
  const postsContainer = document.getElementById('feed-posts-container');
  postsContainer.innerHTML = ''; 

  posts = posts.reverse();

  for (const post of posts) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    try {
      const response = await fetch(`/M00980001/postOwner/${post.owner}`);
      const profileData = await response.json();

      postElement.innerHTML = `
        <div class="post-head">
            <img src="${profileData.profileImg || './images/default-photo.jpg'}" class="profile-img">
            <p>${post.owner} <span class="post-date">on ${post.date}</span></p>
            </button>
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

      postsContainer.appendChild(postElement);

    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  }
}


