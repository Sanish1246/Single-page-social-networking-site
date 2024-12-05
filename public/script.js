const modeButton=document.getElementById("mode-button");
const top_bar=document.getElementById("top-bar");
const systemMessage=document.getElementById('system-message');
const loginLink=document.getElementById('login-link');
const currentUser=document.getElementById('currentUser');
let pageNo=1;
let searchPageNo=1;
let sortBy="recent";
let searchFilter="recent";
let targetText='';
let newsPage='1';

window.onload = () => {
  history.pushState(null, '', '/M00980001');
  document.getElementById("feed-button").classList.add('active');
  document.getElementById('feed-recent').classList.add('active');
  document.getElementById('search-recent').classList.add('active');

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
        document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));
        
        this.classList.add('active');

        if (this.id=='feed-button'){
            openFeed();
        } else if (this.id=='people-button'){
            openPeople();
        } else if(this.id=="following-button") {
            openFollowing();
        } else if(this.id=="recommended-button") {
          openRecommended();
        } else {
          openNews()
        }
    });
});

document.querySelectorAll('.sort-feed-button').forEach(button => {
  button.addEventListener('click', function() {
      document.querySelectorAll('.sort-feed-button').forEach(btn => btn.classList.remove('active'));
      
      this.classList.add('active');

      if (this.id=='feed-recent'){
          sortBy="recent";
      } else if (this.id=='feed-level'){
          sortBy="level";
      } else if (this.id=='feed-comments'){
         sortBy="comments";
      } else {
         sortBy="old";
      }

      document.getElementById('feed-old').style.display = 'block';
      displayFeedPosts()
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
    };
}

function openRegister() {
    closePopup();
    document.getElementById('register-popup').style.display = 'block';
}

function openComments(id){
  closePopup();
  document.getElementById('comments-popup').style.display = 'block';
  loadComments(id);
}

function closePopup() {
    document.getElementById('login-popup').style.display = 'none';
    document.getElementById('register-popup').style.display = 'none';
    document.getElementById('logout-popup').style.display = 'none';
    document.getElementById('upload-popup').style.display = 'none';
    document.getElementById('comments-popup').style.display = 'none';

    history.replaceState(null, '', '/M00980001');
}

function openLogOut(){
  document.getElementById('logout-popup').style.display = 'block';
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
          document.getElementById("feed-button").classList.add('active');
          displayFeedPosts();
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
  document.getElementById("searched-posts").style.display="none";
});

document.getElementById('home-button').addEventListener('click', function(event){
  closeFavourite();
  closeProfile();
  closeSaved();
  openSections();
  document.getElementById("searched-posts").style.display="none";
  document.getElementById("feed-button").classList.add('active');
});

document.getElementById('saved-button').addEventListener('click', function(event){
  closeProfile();
  closeFavourite();
  closeSection();
  closeSectionButton();
  openSaved();
  document.getElementById("searched-posts").style.display="none";
});

document.getElementById('favourite-button').addEventListener('click', function(event){
  closeProfile();
  closeSaved();
  closeSection();
  closeSectionButton();
  openFavourite();
  document.getElementById("searched-posts").style.display="none";
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
      document.getElementById('your-profile').style.display='block';
      displayYourData();
    } else {
      systemMessage.innerText='❌ You must login to view this';
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    }
  });
}

function closeProfile(){
  document.getElementById('your-profile').style.display='none';
}

function openSaved(){
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      fetchSavedPosts();
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
      loadFavourites();
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
    document.getElementById('searched-posts').style.display = 'none';
    checkCurrentUser().then(isUserLoggedIn => {
      if (isUserLoggedIn) {
        document.getElementById('following-posts').style.display = 'block';
        displayFollowingPosts();
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
    document.getElementById('searched-posts').style.display = 'none';
    document.getElementById('feed-posts').style.display = 'block';
    document.getElementById('feed-recent').classList.add('active');
    displayFeedPosts();
}

function openPeople(){
    closeSection();
    document.getElementById('searched-posts').style.display = 'none';
    checkCurrentUser().then(isUserLoggedIn => {
      if (isUserLoggedIn) {
        document.getElementById('people-section').style.display = 'block';
        document.getElementById('user-profile').style.display='none';
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
  document.getElementById('searched-posts').style.display = 'none';
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('recommended-section').style.display = 'block';
      displayGames(1);
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

async function displayYourData() {
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
        systemMessage.innerText='✅ Picture updated successfully';
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
        displayYourData();
      } else {
        systemMessage.innerText='❌ Error: ' + error;
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  } else {
    systemMessage.innerText='❌ No file uploaded';
    systemMessage.style.opacity='1';
    setTimeout(closeMessage,2000);
  }
});

async function loadYourPosts(posts, data) {
  const postsContainer = document.getElementById('posts-container');
  postsContainer.innerHTML = ''; 

  posts = posts.reverse();

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    const isLiked = post.likedBy.includes(data.username); 
    const isDisliked = post.dislikedBy.includes(data.username); 
    const isSaved = data.savedPosts.includes(post._id);

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
          <p>Level: <span id="level-count">${post.level || 0}</span></p>
          <p>Comments: <span id="comment-count">${post.comments ? post.comments.length : 0}</span></p>
          <p>${post.time}</p>
      </div>
      <hr>
        <div class="post-bottom">
            <button class="level-up ${isLiked ? 'active' : ''}"  id=${post._id}>⬆️Level up</button>
            <button class="level-down ${isDisliked ? 'active' : ''}" id=${post._id}>⬇️Level down</button>
            <button>💬Comments</button>
            <button class="save-post ${isSaved ? 'active' : ''}" id=${post._id}>⚲Save</button>
        </div>
      <hr>
      <div class="post-comment">
          <input type="text" placeholder="💬Leave a comment." class="user-comment"><button class="publish-comment" id=${post._id}>Post</button>
      </div>
    `;
    postsContainer.appendChild(postElement);
  });

  document.querySelectorAll('.level-up').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel--;  
        removeLike(targetId);  
      } else {
        this.classList.add('active');
        currentLevel++;  
        likePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });
  
  document.querySelectorAll('.level-down').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel++;  
        removeDislike(targetId);  
      } else {
        this.classList.add('active');
        currentLevel--;  
        dislikePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });

  document.querySelectorAll('.save-post').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');  
        removeSavedPost(targetId);  
      } else {
        this.classList.add('active');
        savePost(targetId);  
      }

    });
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
            <a id=${person.username} class="visit-link">${person.username}</a>               
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

    document.querySelectorAll('.visit-link').forEach(function(element) {
      element.addEventListener('click', async function() {
        const targetUser = this.id;
        displayUserProfile(targetUser);
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
      closePopup();
    });
  }

  async function displayFeedPosts(){
    try {
    const response = await fetch('http://localhost:8000/M00980001/user');
    const data = await response.json();

    if(Object.keys(data).length === 0){
      const postsResponse = await fetch(`http://localhost:8000/M00980001/latest/${sortBy}`);
      const posts = await postsResponse.json();
      loadLatestPosts(posts);
    } else {
      const postsResponse = await fetch(`http://localhost:8000/M00980001/feed/${sortBy}`);
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

  for (const post of posts) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    const isFollowing = following.includes(post.owner);
    const isLiked = post.likedBy.includes(data.username); 
    const isDisliked = post.dislikedBy.includes(data.username); 
    const isSaved = data.savedPosts.includes(post._id);

    try {
      const response = await fetch(`/M00980001/postOwner/${post.owner}`);
      const profileData = await response.json();

      postElement.innerHTML = `
        <div class="post-head">
            <img src="${profileData.profileImg || './images/default-photo.jpg'}" class="profile-img">
            <p>${profileData.username} <span class="post-date">on ${post.date}</span></p>
            <button class="follow-user ${isFollowing ? 'following' : ''}" id=${post.owner}>
              ${isFollowing ? 'Unfollow' : '+ Follow'}
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
            <p>Level: <span id="level-count">${post.level || 0}</span></p>
            <p>Comments: <span id="comment-count">${post.comments ? post.comments.length : 0}</span></p>
            <p>${post.time}</p>
        </div>
        <hr>
        <div class="post-bottom">
            <button class="level-up ${isLiked ? 'active' : ''}"  id=${post._id}>⬆️Level up</button>
            <button class="level-down ${isDisliked ? 'active' : ''}" id=${post._id}>⬇️Level down</button>
            <button class="view-comments" id=${post._id}>💬Comments</button>
            <button class="save-post ${isSaved ? 'active' : ''}" id=${post._id}>⚲Save</button>
        </div>
        <hr>
        <div class="post-comment">
           <input type="text" placeholder="💬Leave a comment." class="user-comment"><button class="publish-comment" id=${post._id}>Post</button>
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

  document.querySelectorAll('.level-up').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
      const levelDownButton = this.closest('.post').querySelector(".level-down");
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel--;  
        removeLike(targetId);
      } else {
        this.classList.add('active');
        if(levelDownButton.classList.contains("active")) {
          levelDownButton.classList.remove("active"); 
          currentLevel++;
          removeDislike(targetId); 
        }
        currentLevel++;  
        likePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });
  
  document.querySelectorAll('.level-down').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
      const levelUpButton = this.closest('.post').querySelector(".level-up");
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel++;  
        removeDislike(targetId);  
      } else {
        this.classList.add('active');
        if(levelUpButton.classList.contains("active")) {
          levelUpButton.classList.remove("active"); 
          currentLevel--;
          removeLike(targetId); 
        } 
        currentLevel--;  
        dislikePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });

  document.querySelectorAll('.save-post').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');  
        removeSavedPost(targetId);  
      } else {
        this.classList.add('active');
        savePost(targetId);  
      }

    });
  });

  document.querySelectorAll('.view-comments').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      openComments(this.id);
    });
  });

  document.querySelectorAll('.publish-comment').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      const commentCountElement = this.closest('.post').querySelector("#comment-count");

      let currentComments= parseInt(commentCountElement.innerText) || 0;
      currentComments++;
      commentCountElement.innerText = currentComments;
      const commentInput = this.previousElementSibling;  
      const newComment = commentInput.value;
  
      commentInput.value = '';
      postComment(this.id,newComment);
    });
  });
}

async function likePost(id){
  fetch(`http://localhost:8000/M00980001/like/${id}`, {
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
    closePopup();
  });
}

async function removeLike(id){
  fetch(`http://localhost:8000/M00980001/removeLike/${id}`, {
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
    closePopup();
  });
}

async function dislikePost(id){
  fetch(`http://localhost:8000/M00980001/dislike/${id}`, {
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
    closePopup();
  });
}

async function removeDislike(id){
  fetch(`http://localhost:8000/M00980001/removeDislike/${id}`, {
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
    closePopup();
  });
}

async function savePost(id){
  fetch(`http://localhost:8000/M00980001/save/${id}`, {
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
    closePopup();
  });
}

async function removeSavedPost(id){
  fetch(`http://localhost:8000/M00980001/removeSaved/${id}`, {
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
    closePopup();
  });
}

async function fetchSavedPosts(){
  const response = await fetch('http://localhost:8000/M00980001/user');
  const data = await response.json();

  const postsResponse = await fetch('http://localhost:8000/M00980001/savedPosts');
  const posts = await postsResponse.json();
  const postsContainer = document.getElementById('saved-container');
  postsContainer.innerHTML = '';
  let following = data.following;

  for (const post of posts) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    const isFollowing = following.includes(post.owner);
    const isLiked = post.likedBy.includes(data.username); 
    const isDisliked = post.dislikedBy.includes(data.username); 

    try {
      const response = await fetch(`/M00980001/postOwner/${post.owner}`);
      const profileData = await response.json();

      postElement.innerHTML = `
        <div class="post-head">
            <img src="${profileData.profileImg || './images/default-photo.jpg'}" class="profile-img">
            <p>${profileData.username} <span class="post-date">on ${post.date}</span></p>
            ${(data.username==post.owner) ? '' : `<button class="follow-user ${isFollowing ? 'following' : ''}" id=${post.owner}>
              ${isFollowing ? 'Unfollow' : '+ Follow'}
            </button>`}
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
            <p>Level: <span id="level-count">${post.level || 0}</span></p>
            <p>Comments: <span id="comment-count">${post.comments ? post.comments.length : 0}</span></p>
            <p>${post.time}</p>
        </div>
        <hr>
        <div class="post-bottom">
            <button class="level-up ${isLiked ? 'active' : ''}"  id=${post._id}>⬆️Level up</button>
            <button class="level-down ${isDisliked ? 'active' : ''}" id=${post._id}>⬇️Level down</button>
            <button>💬Comments</button>
            <button class="save-post ${'active'}" id=${post._id}>⚲Save</button>
        </div>
        <hr>
        <div class="post-comment">
            <input type="text" placeholder="💬Leave a comment." class="user-comment"><button class="post-comment" id=${post._id}>Post</button>
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

  document.querySelectorAll('.level-up').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel--;  
        removeLike(targetId);  
      } else {
        this.classList.add('active');
        currentLevel++;  
        likePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });
  
  document.querySelectorAll('.level-down').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel++;  
        removeDislike(targetId);  
      } else {
        this.classList.add('active');
        currentLevel--;  
        dislikePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });

  document.querySelectorAll('.save-post').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');  
        removeSavedPost(targetId);  
      } else {
        this.classList.add('active');
        savePost(targetId);  
      }
    });
  });

  document.querySelectorAll('.view-comments').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      openComments(this.id);
    });
  });

  document.querySelectorAll('.publish-comment').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      const commentCountElement = this.closest('.post').querySelector("#comment-count");

      let currentComments= parseInt(commentCountElement.innerText) || 0;
      currentComments++;
      commentCountElement.innerText = currentComments;
      const commentInput = this.previousElementSibling;  
      const newComment = commentInput.value;
  
      commentInput.value = '';
      postComment(this.id,newComment);
    });
  });
}


async function loadLatestPosts(posts) {
  const postsContainer = document.getElementById('feed-posts-container');
  postsContainer.innerHTML = ''; 

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
            <button class="follow-user" onclick="openLogin()">+ Follow</button>
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
            <p>Comments: <span id="comment-count">${post.comments ? post.comments.length : 0}</span></p>
            <p>${post.time}</p>
        </div>
        <hr>
        <div class="post-bottom">
            <button onclick="openLogin()">⬆️Level up</button>
            <button onclick="openLogin()">⬇️Level down</button>
            <button class="view-comments" id=${post._id}>💬Comments</button>
            <button onclick="openLogin()">⚲Save</button>
        </div>
        <hr>
        <div class="post-comment">
            <input type="text" placeholder="💬Leave a comment." class="user-comment"><button class="post-comment" id=${post._id} onclick="openLogin()">Post</button>
        </div>
      `;

      postsContainer.appendChild(postElement);

    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  }

  document.querySelectorAll('.view-comments').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      openComments(this.id);
    });
  });
}

async function displayFollowingPosts(){
  const response = await fetch('http://localhost:8000/M00980001/user');
  const data = await response.json();

  const postsResponse = await fetch('http://localhost:8000/M00980001/following');
  let posts = await postsResponse.json();
  const postsContainer = document.getElementById('following-container');
  postsContainer.innerHTML = '';
  let following = data.following;

  posts=posts.reverse();

  for (const post of posts) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    const isFollowing = following.includes(post.owner);
    const isLiked = post.likedBy.includes(data.username); 
    const isDisliked = post.dislikedBy.includes(data.username); 
    const isSaved = data.savedPosts.includes(post._id);

    try {
      const response = await fetch(`/M00980001/postOwner/${post.owner}`);
      const profileData = await response.json();

      postElement.innerHTML = `
        <div class="post-head">
            <img src="${profileData.profileImg || './images/default-photo.jpg'}" class="profile-img">
            <p>${profileData.username} <span class="post-date">on ${post.date}</span></p>
            <button class="follow-user ${isFollowing ? 'following' : ''}" id=${post.owner}>
              ${isFollowing ? 'Unfollow' : '+ Follow'}
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
            <p>Level: <span id="level-count">${post.level || 0}</span></p>
            <p>Comments: <span id="comment-count">${post.comments ? post.comments.length : 0}</span></p>
            <p>${post.time}</p>
        </div>
        <hr>
        <div class="post-bottom">
            <button class="level-up ${isLiked ? 'active' : ''}"  id=${post._id}>⬆️Level up</button>
            <button class="level-down ${isDisliked ? 'active' : ''}" id=${post._id}>⬇️Level down</button>
            <button class="view-comments" id=${post._id}>💬Comments</button>
            <button class="save-post ${isSaved ? 'active' : ''}" id=${post._id}>⚲Save</button>
        </div>
        <hr>
        <div class="post-comment">
            <input type="text" placeholder="💬Leave a comment." class="user-comment"><button class="post-comment" id=${post._id}>Post</button>
        </div>
      `;

      postsContainer.appendChild(postElement);

    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  }

  document.querySelectorAll('.view-comments').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      openComments(this.id);
    });
  });

  document.querySelectorAll('.publish-comment').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      const commentCountElement = this.closest('.post').querySelector("#comment-count");

      let currentComments= parseInt(commentCountElement.innerText) || 0;
      currentComments++;
      commentCountElement.innerText = currentComments;
      const newComment = this.previousElementSibling.value;
      postComment(this.id,newComment);
    });
  });
}

async function loadComments(id){
  const commentsResponse = await fetch(`http://localhost:8000/M00980001/comments/${id}`);
  let comments = await commentsResponse.json();
  const commentsContainer = document.getElementById('comments-container');
  commentsContainer.innerHTML = '';

  comments=comments.reverse();

  for (const comment of comments) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');

    try {
      const response = await fetch(`/M00980001/postOwner/${comment.username}`);
      const profileData = await response.json();

      console.log(profileData);

      commentElement.innerHTML = `
        <img src="${profileData.profileImg || './images/default-photo.jpg'}">
        <div class="comment-content">
          <p class="comment-details">${comment.username} on ${comment.date}</p>
          <p>${comment.content}</p>
        </div>
      `;

      commentsContainer.appendChild(commentElement);

    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  }
}

async function postComment(id,newComment){
  const response = await fetch('http://localhost:8000/M00980001/user');
  const data = await response.json();

  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); 
  const year = String(now.getFullYear());
  const formattedDate = `${day}/${month}/${year}`;

  comment = {
    username:data.username,
    date:formattedDate,
    content: newComment
  }

  fetch(`http://localhost:8000/M00980001/comment/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(comment)
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
}

async function searchPeople(){
  const targetText=document.getElementById("search-person").value;

  document.getElementById("people-container").style.display="none";

  try {
    const response = await fetch(`http://localhost:8000/M00980001/searchPerson/${targetText}`);
    const people = await response.json();
    const peopleContainer = document.getElementById('searched-people-container');

    const res = await fetch('http://localhost:8000/M00980001/user');
    const data = await res.json();
    let following = data.following; 

    peopleContainer.innerHTML = '';


    const header = document.createElement('h1');
    
    if(people.length===0){
      header.textContent = 'No results';
      peopleContainer.appendChild(header);
    } else {
      header.textContent = 'Search results';
      peopleContainer.appendChild(header);
  
      people.forEach(person => {
        const peopleElement = document.createElement('div');
        peopleElement.classList.add('person');
        const isFollowing = following.includes(person.username);
  
        const isCurrentUser = person.username === data.username;

        peopleElement.innerHTML = `
          <img src="${person.profileImg || './images/default-photo.jpg'}" class="profile-img">
          <a id=${person.username} class="visit-link">${person.username}</a>
        `;
        
        if (!isCurrentUser) {
          peopleElement.innerHTML += `
            <button class="follow-user ${isFollowing ? 'following' : ''}" id=${person.username}>
              ${isFollowing ? 'Following' : '+ Follow'}
            </button>
          `;
        }

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

      document.querySelectorAll('.visit-link').forEach(function(element) {
        element.addEventListener('click', async function() {
          const targetUser = this.id;
          displayUserProfile(targetUser);
        });
      });

    } 
    document.getElementById("searched-people-container").style.display="block"
  } catch (error) {
    console.error('Error:', error);
  }
}

function clearPeopleResults(){
  document.getElementById("searched-people-container").style.display="none";
  document.getElementById("search-person").value='';
  document.getElementById("people-container").style.display="block";
}

document.querySelectorAll('.search-sort-button').forEach(button => {
  button.addEventListener('click', function() {
      document.querySelectorAll('.search-sort-button').forEach(btn => btn.classList.remove('active'));
      
      this.classList.add('active');

      document.getElementById('post-search-container').innerHTML = '';

      if (this.id == 'search-recent') {
          searchFilter = "recent";
      } else if (this.id == 'search-level') {
          searchFilter = "level";
      } else if (this.id == 'search-comments') {
          searchFilter = "comments";
      } else {
          searchFilter = "old";
      }
      
      document.getElementById('searched-posts').style.display = 'block';
      searchPosts(targetText);
  }); 
});

async function searchPosts(searchTarget){
  closeSection();
  closeSectionButton();
  closeProfile();
  closeSaved();

  if (searchTarget=='') {
    targetText=document.getElementById("search-text").value;
  } else {
    targetText=searchTarget;
  }

  console.log(targetText);

  try {
    const response = await fetch(`http://localhost:8000/M00980001/searchPost/${targetText}/${searchFilter}`);
    let posts = await response.json();
    const postsContainer = document.getElementById('post-search-container');

    const res = await fetch('http://localhost:8000/M00980001/user');
    const data = await res.json();
    let following = data.following || []; 

    let isFollowing;
    let isLiked;
    let isSaved;
    let isDisliked;


    if (!data.username){
      isFollowing = false;
      isLiked = false; 
      isDisliked = false; 
      isSaved = false;
    }

    postsContainer.innerHTML = '';

    const header = document.createElement('h1');
    
    if(posts.length===0){
      header.textContent = 'No results';
      postsContainer.appendChild(header);
    } else {
      header.textContent = 'Search results';
      postsContainer.appendChild(header);

  for (const post of posts) {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    if (data.username){
      isFollowing = following.includes(post.owner);
      isLiked = post.likedBy.includes(data.username); 
      isDisliked = post.dislikedBy.includes(data.username); 
      isSaved = data.savedPosts.includes(post._id);
    }

    try {
      const response = await fetch(`/M00980001/postOwner/${post.owner}`);
      const profileData = await response.json();

      postElement.innerHTML = `
        <div class="post-head">
            <img src="${profileData.profileImg || './images/default-photo.jpg'}" class="profile-img">
            <p>${profileData.username} <span class="post-date">on ${post.date}</span></p>
            ${(data.username==post.owner) ? '' : `<button class="follow-user ${isFollowing ? 'following' : ''}" id=${post.owner}>
              ${isFollowing ? 'Unfollow' : '+ Follow'}
            </button>`}
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
            <p>Level: <span id="level-count">${post.level || 0}</span></p>
            <p>Comments: <span id="comment-count">${post.comments ? post.comments.length : 0}</span></p>
            <p>${post.time}</p>
        </div>
        <hr>
        <div class="post-bottom">
            <button class="level-up ${isLiked ? 'active' : ''}"  id=${post._id}>⬆️Level up</button>
            <button class="level-down ${isDisliked ? 'active' : ''}" id=${post._id}>⬇️Level down</button>
            <button class="view-comments" id=${post._id}>💬Comments</button>
            <button class="save-post ${isSaved ? 'active' : ''}" id=${post._id}>⚲Save</button>
        </div>
        <hr>
        <div class="post-comment">
           <input type="text" placeholder="💬Leave a comment." class="user-comment"><button class="publish-comment" id=${post._id}>Post</button>
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
      if (data.username){
        if (following.includes(targetId)) {
          this.classList.remove('following');
          this.innerText = '+ Follow';
          unfollowUser(targetId); 
        } else {
          this.classList.add('following');
          this.innerText = 'Unfollow';
          followUser(targetId); 
        }
      } else {
        openLogin();
      }
    });
  });

  document.querySelectorAll('.level-up').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 

      if (data.username){
        if (this.classList.contains("active")) {
          this.classList.remove('active');
          currentLevel--;  
          removeLike(targetId);
        } else {
          this.classList.add('active');
          currentLevel++;  
          likePost(targetId);  
        }
      } else {
        openLogin();
      }

      levelCountElement.innerText = currentLevel;
    });
  });
  
  document.querySelectorAll('.level-down').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
  
      if (data.username){
        if (this.classList.contains("active")) {
          this.classList.remove('active');
          currentLevel++;  
          removeDislike(targetId);  
        } else {
          this.classList.add('active');
          currentLevel--;  
          dislikePost(targetId);  
        }
      } else {
        openLogin();
      }

      levelCountElement.innerText = currentLevel;
    });
  });

  document.querySelectorAll('.save-post').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
  
      if (data.username){
        if (this.classList.contains("active")) {
          this.classList.remove('active');  
          removeSavedPost(targetId);  
        } else {
          this.classList.add('active');
          savePost(targetId);  
        }
      } else {
        openLogin();
      }
    });
  });

  document.querySelectorAll('.view-comments').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      openComments(this.id);
    });
  });

  document.querySelectorAll('.publish-comment').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      const commentCountElement = this.closest('.post').querySelector("#comment-count");

      if (data.username) {
        let currentComments= parseInt(commentCountElement.innerText) || 0;
        currentComments++;
        commentCountElement.innerText = currentComments;
        const commentInput = this.previousElementSibling;  
        const newComment = commentInput.value;
    
        commentInput.value = '';
        postComment(this.id,newComment);
      } else {
        openLogin();
      }
    });
  });

 } 
    document.getElementById("searched-posts").style.display="block";
  } catch (error) {
    console.error('Error:', error);
  }
}

function clearPostsResults(){
  document.getElementById("post-search-container").style.display="none";
  openSections();
  document.getElementById("feed-button").classList.add('active');
  document.getElementById("search-text").value='';
}

async function displayUserProfile(targetUser) {
  document.getElementById('people-section').style.display = 'none';
  document.getElementById('user-profile').style.display = 'block';

  try {
    const response = await fetch(`http://localhost:8000/M00980001/profile/${targetUser}`);
    const userData = await response.json();

    document.getElementById('profile-username').innerText = userData.username;
    document.getElementById('user-following').innerText = userData.following.length;
    document.getElementById('user-followers').innerText = userData.followers.length;

    const followersElement = document.getElementById('user-followers');
    let followerCount = userData.followers.length;

    const profileImageElement = document.getElementById("profileImage");
    profileImageElement.src = userData.profileImg ? userData.profileImg : './images/default-photo.jpg';

    const postsResponse = await fetch(`http://localhost:8000/M00980001/posts/${targetUser}`);
    const posts = await postsResponse.json();

    const res = await fetch('http://localhost:8000/M00980001/user');
    const data = await res.json();
    let following = data.following;

    const followButton = document.getElementById('user-follow-button');

    followButton.replaceWith(followButton.cloneNode(true));
    const newFollowButton = document.getElementById('user-follow-button');

    updateFollowButton(following.includes(targetUser), newFollowButton);

    newFollowButton.addEventListener('click', async function () {
      if (following.includes(targetUser)) {
        await unfollowUser(targetUser);
        followerCount--;
        following = following.filter(user => user !== targetUser);  
      } else {
        await followUser(targetUser);
        followerCount++;
        following.push(targetUser);  
      }

      updateFollowButton(following.includes(targetUser), newFollowButton);
      followersElement.innerText = followerCount;
    });

    loadUserPosts(posts, userData, data);

  } catch (error) {
    console.error('Error:', error);
  }
}

function updateFollowButton(isFollowing, followButton) {
  if (isFollowing) {
    followButton.classList.add('following');
    followButton.innerText = 'Unfollow';
  } else {
    followButton.classList.remove('following');
    followButton.innerText = '+ Follow';
  }
}

async function loadUserPosts(posts,userData, data){
  const postsContainer = document.getElementById('user-posts-container');
  postsContainer.innerHTML = ''; 
  let following=data.following;

  posts = posts.reverse();

  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    const isLiked = post.likedBy.includes(data.username); 
    const isDisliked = post.dislikedBy.includes(data.username); 
    const isSaved = data.savedPosts.includes(post._id);

    postElement.innerHTML = `
      <div class="post-head">
          <img src="${userData.profileImg || '/images/default-photo.jpg'}" class="profile-img">
          <p>${userData.username} <span class="post-date">on ${post.date}</span></p>
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
          <p>Level: <span id="level-count">${post.level || 0}</span></p>
          <p>Comments: <span id="comment-count">${post.comments ? post.comments.length : 0}</span></p>
          <p>${post.time}</p>
      </div>
      <hr>
        <div class="post-bottom">
            <button class="level-up ${isLiked ? 'active' : ''}"  id=${post._id}>⬆️Level up</button>
            <button class="level-down ${isDisliked ? 'active' : ''}" id=${post._id}>⬇️Level down</button>
            <button>💬Comments</button>
            <button class="save-post ${isSaved ? 'active' : ''}" id=${post._id}>⚲Save</button>
        </div>
      <hr>
      <div class="post-comment">
          <input type="text" placeholder="💬Leave a comment." class="user-comment"><button class="publish-comment" id=${post._id}>Post</button>
      </div>
    `;
    postsContainer.appendChild(postElement);
  });


  document.querySelectorAll('.level-up').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel--;  
        removeLike(targetId);  
      } else {
        this.classList.add('active');
        currentLevel++;  
        likePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });
  
  document.querySelectorAll('.level-down').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
      const levelCountElement = this.closest('.post').querySelector("#level-count");
      
      let currentLevel = parseInt(levelCountElement.innerText) || 0; 
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');
        currentLevel++;  
        removeDislike(targetId);  
      } else {
        this.classList.add('active');
        currentLevel--;  
        dislikePost(targetId);  
      }

      levelCountElement.innerText = currentLevel;
    });
  });

  document.querySelectorAll('.save-post').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;
  
      if (this.classList.contains("active")) {
        this.classList.remove('active');  
        removeSavedPost(targetId);  
      } else {
        this.classList.add('active');
        savePost(targetId);  
      }
    });
  });

  document.querySelectorAll('.view-comments').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      openComments(this.id);
    });
  });

  document.querySelectorAll('.publish-comment').forEach(function(element) {
    element.addEventListener('click', function(event) {
      event.preventDefault();
      const commentCountElement = this.closest('.post').querySelector("#comment-count");

      let currentComments= parseInt(commentCountElement.innerText) || 0;
      currentComments++;
      commentCountElement.innerText = currentComments;
      const commentInput = this.previousElementSibling;  
      const newComment = commentInput.value;
  
      commentInput.value = '';
      postComment(this.id,newComment);
    });
  });
}

document.querySelector('.next-button').addEventListener('click', function(event) {
 pageNo++
 displayGames();
 window.scrollTo(0, 0)
});

document.querySelector('.previous-button').addEventListener('click', function(event) {
  if (pageNo!=1){
    pageNo--
    displayGames();
  }
  window.scrollTo(0, 0)
 });


async function displayGames() {
  const gameContainer = document.getElementById("game-container");
  gameContainer.innerHTML = ''; 

  try {
    const userResponse = await fetch(`http://localhost:8000/M00980001/user`);
    const userData = await userResponse.json();

    const response = await fetch(`http://localhost:8000/M00980001/recommended/${pageNo}`);
    const data = await response.json();

    data.forEach(game => {
      const gameElement = document.createElement('div');
      gameElement.classList.add('game');

      let isFav = userData.favGames.some(favGame => favGame.name === game.name);

      gameElement.innerHTML = `
        <div class="game-details">
          <div class="game-title">
            <p>${game.name}</p>  
            <button class="add-game ${isFav ? "active" : ''}" id="${game.name}">${isFav ? "Remove" : '+ Add to favourites'}</button>
          </div>  
          <hr>           
          <div class="genres">
            <div class="left-section">
               <p>Genres: <span id="genre-list">${game.genre}</span></p>
            </div>
            <div class="right-section">
              <p>Rating: <span id="rating">${game.rating}</span>/5</p>
            </div>
          </div>
        </div>
        <img id="game-img" src="${game.image || "./images/default-photo.jpg"}" alt="${game.name} image">
      `;

      gameContainer.appendChild(gameElement);
    });
  } catch (error) {
    console.log(error);
  }

  document.querySelectorAll('.add-game').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;

      if (this.classList.contains("active")) {
        this.classList.remove('active'); 
        this.innerText = 'Add to Favourites'; 
        removeFavourite(targetId);
      } else {
        this.classList.add('active');
        this.innerText = 'Remove';  
        const newGenre = this.closest('.game-details').querySelector("#genre-list").innerHTML
        const newRating = this.closest('.game-details').querySelector("#rating").innerHTML;
        const newImg = this.closest('.game').querySelector("#game-img").src;

        const newGame = {
          name: targetId,
          genre: newGenre,
          image: newImg,
          rating: newRating
        }
        addFavourite(newGame)
      }
    });
  });
}

async function addFavourite(newGame){
  fetch(`http://localhost:8000/M00980001/addFavourite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newGame)
  })
  .then(response => response.json())
  .then(message => {
    systemMessage.innerText=message.message;
    systemMessage.style.opacity='1';
    setTimeout(closeMessage,2000);
  })
  .catch(error => {
    systemMessage.innerText='❌ Error: ' + error;
    systemMessage.style.opacity='1';
    setTimeout(closeMessage,2000);
  });
}

async function removeFavourite(game){
  fetch(`http://localhost:8000/M00980001/removeFavourite/${game}`, {
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
  })
  .catch(error => {
    systemMessage.innerText='❌ Error: ' + error;
    systemMessage.style.opacity='1';
    setTimeout(closeMessage,2000);
  });
}

async function loadFavourites(){
  const gameContainer = document.getElementById("fav-game-container");
  gameContainer.innerHTML = ''; 

  try {
    const response = await fetch(`http://localhost:8000/M00980001/showFavourite`);
    const data = await response.json();

    data.forEach(game => {
      const gameElement = document.createElement('div');
      gameElement.classList.add('game');

      gameElement.innerHTML = `
        <div class="game-details">
          <div class="game-title">
            <p>${game.name}</p>  
            <button class="add-game ${"active"}" id="${game.name}">Remove</button>
          </div>  
          <hr>           
          <div class="genres">
            <div class="left-section">
               <p>Genres: <span id="genre-list">${game.genre}</span></p>
            </div>
            <div class="right-section">
              <p>Rating: <span id="rating">${game.rating}</span>/5</p>
            </div>
          </div>
        </div>
        <img id="game-img" src="${game.image || "./images/default-photo.jpg"}" alt="${game.name} image">
      `;

      gameContainer.appendChild(gameElement);
    });
  } catch (error) {
    console.log(error);
  }

  document.querySelectorAll('.add-game').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;

      if (this.classList.contains("active")) {
        this.classList.remove('active'); 
        this.innerText = 'Add to Favourites'; 
        removeFavourite(targetId);
      } else {
        this.classList.add('active');
        this.innerText = 'Remove';  
        const newGenre = this.closest('.game-details').querySelector("#genre-list").innerHTML
        const newRating = this.closest('.game-details').querySelector("#rating").innerHTML;
        const newImg = this.closest('.game').querySelector("#game-img").src;

        const newGame = {
          name: targetId,
          genre: newGenre,
          image: newImg,
          rating: newRating
        }
        addFavourite(newGame)
      }
    });
  });
}

async function searchGame() {
  document.getElementById("normal-game").style.display = "none";
  document.getElementById("searched-games").style.display = "block";
  const targetGame = document.getElementById("search-game").value;

  const gameContainer = document.getElementById("searched-games-container");
  gameContainer.innerHTML = ''; 

  try {
    const userResponse = await fetch(`http://localhost:8000/M00980001/user`);
    const userData = await userResponse.json();

    const response = await fetch(`http://localhost:8000/M00980001/searchGame/${targetGame}/${searchPageNo}`);
    const data = await response.json();

    const header = document.createElement('h1');
    
    if (data.length === 0) {  
      header.textContent = 'No results';
      gameContainer.appendChild(header);
    } else {
      header.textContent = 'Search results';
      gameContainer.appendChild(header);

      data.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.classList.add('game');

        let isFav = userData.favGames.some(favGame => favGame.name === game.name);

        gameElement.innerHTML = `
          <div class="game-details">
            <div class="game-title">
              <p>${game.name}</p>  
              <button class="add-game ${isFav ? "active" : ''}" id="${game.name}">${isFav ? "Remove" : '+ Add to favourites'}</button>
            </div>  
            <hr>           
            <div class="genres">
              <div class="left-section">
                <p>Genres: <span id="genre-list">${game.genre}</span></p>
              </div>
              <div class="right-section">
                <p>Rating: <span id="rating">${game.rating}</span>/5</p>
              </div>
            </div>
          </div>
          <img id="game-img" src="${game.image || "./images/default-photo.jpg"}" alt="${game.name} image">
        `;

        gameContainer.appendChild(gameElement);
      });
    }
  } catch (error) {
    console.log(error);
  }

  document.querySelectorAll('.add-game').forEach(function(element) {
    element.addEventListener('click', async function(event) {
      event.preventDefault();
      const targetId = this.id;

      if (this.classList.contains("active")) {
        this.classList.remove('active'); 
        this.innerText = 'Add to Favourites'; 
        removeFavourite(targetId);
      } else {
        this.classList.add('active');
        this.innerText = 'Remove';  
        const newGenre = this.closest('.game-details').querySelector("#genre-list").innerHTML;
        const newRating = this.closest('.game-details').querySelector("#rating").innerHTML;
        const newImg = this.closest('.game').querySelector("#game-img").src;

        const newGame = {
          name: targetId,
          genre: newGenre,
          image: newImg,
          rating: newRating
        };
        addFavourite(newGame);
      }
    });
  });
}

function clearGameResults(){
  document.getElementById("searched-games").style.display="none";
  document.getElementById("search-game").value='';
  document.getElementById("normal-game").style.display="block";
}

document.querySelector('.next-search-button').addEventListener('click', function(event) {
  searchPageNo++
  searchGame();
  window.scrollTo(0, 0)
 });
 
 document.querySelector('.previous-search-button').addEventListener('click', function(event) {
   if (searchPageNo!=1){
     searchPageNo--
     searchGame();
   }
   window.scrollTo(0, 0)
  });

  async function openNews() {
    document.getElementById('searched-posts').style.display = 'none';
    closeSection();
    document.getElementById('news').style.display = 'block';
    const newsContainer = document.getElementById('news-container');
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading');
    loadingSpinner.innerText = 'Loading...';
    newsContainer.appendChild(loadingSpinner);
  
    try {
        const response = await fetch('http://localhost:8000/M00980001/news');
        const news = await response.json();
      
        // Rimuovi lo spinner dopo aver caricato i dati
        newsContainer.innerHTML = '';
      
        news.forEach(article => {
            const newsElement = document.createElement('div');
            newsElement.classList.add('newsArticle');

            newsElement.innerHTML = ` 
                <div class="newsLeft">
                    <img src="${article.img || './images/default-photo.jpg'}">
                </div>
                <div class="newsRight">
                    <a class="newsTitle">${article.title}</a>
                    <hr>
                    <p class="newsContent">${article.content}</p>
                </div>
            `;

            newsContainer.appendChild(newsElement);
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        
        newsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}
