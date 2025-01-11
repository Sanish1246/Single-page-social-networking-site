//Module for the people section

export async function fetchPeople() {  //Function to display the users
    try {
      const response = await fetch('http://localhost:8000/M00980001/people');  //GET request
      const people = await response.json();
      const peopleContainer = document.getElementById('people-container');
  
      const res = await fetch('http://localhost:8000/M00980001/login');
      const data = await res.json();
      let following = data.following; 
  
      peopleContainer.innerHTML = '';
  
      const header = document.createElement('h1');
      header.textContent = 'People';
      peopleContainer.appendChild(header);
  
      people.forEach(person => {
        const peopleElement = document.createElement('div');
        peopleElement.classList.add('person');
        const isFollowing = following.includes(person.username);  //Checking if we already follow a user
  
        peopleElement.innerHTML = `
              <img src="${person.profileImg || './images/default-photo.jpg'}" class="profile-img">
              <a id=${person.username} class="visit-link">${person.username}</a>         
              <a id=${person.username} class="chat-link">💬</a>      
              <button class="follow-user ${isFollowing ? 'following' : ''}" id=${person.username}>
              ${isFollowing ? 'Unfollow' : '+ Follow'}
              </button>
        `;
  
        peopleContainer.appendChild(peopleElement);
      });
  
      document.querySelectorAll('.follow-user').forEach(function(element) {  //Event listener to follow a user
        element.addEventListener('click', async function(event) {
          event.preventDefault();
          const targetId = this.id;
  
          if (this.classList.contains('following')) {
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
  
      document.querySelectorAll('.visit-link').forEach(function(element) {  //Event listener to visit a user profile
        element.addEventListener('click', async function() {
          const targetUser = this.id;
          displayUserProfile(targetUser);
        });
      });
  
      document.querySelectorAll('.chat-link').forEach(function(element) {  //Event listener to chat with a user
        element.addEventListener('click', async function() {
          const targetUser = this.id;
          openChat(targetUser);
        });
      });
      
    } catch (error) {
      console.error('Error:', error);
    }
  }
window.fetchPeople=fetchPeople;

export async function displayUserProfile(targetUser) {  //Function to display the user profile
    document.getElementById('people-section').style.display = 'none';
    document.getElementById('user-profile').style.display = 'block';
  
    try {
      const response = await fetch(`http://localhost:8000/M00980001/profile/${targetUser}`);  //GET request
      const userData = await response.json();
  
      document.getElementById('profile-username').innerText = userData.username;
      document.getElementById('user-following').innerText = userData.following.length;
      document.getElementById('user-followers').innerText = userData.followers.length;
  
      const followersElement = document.getElementById('user-followers');
      let followerCount = userData.followers.length;
  
      const profileImageElement = document.getElementById("profile-image");
      profileImageElement.src = userData.profileImg ? userData.profileImg : './images/default-photo.jpg';
  
      const postsResponse = await fetch(`http://localhost:8000/M00980001/posts/${targetUser}`); //GET request for the posts
      const posts = await postsResponse.json();
  
      const res = await fetch('http://localhost:8000/M00980001/login');
      const data = await res.json();
      let following = data.following;
  
      const followButton = document.getElementById('user-follow-button');
  
      followButton.replaceWith(followButton.cloneNode(true));
      const newFollowButton = document.getElementById('user-follow-button');
  
      updateFollowButton(following.includes(targetUser), newFollowButton);
  
      newFollowButton.addEventListener('click', async function () {  //Event listener to follow a user
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
  
      loadUserPosts(posts, userData, data);  //Loading the user's posts
  
    } catch (error) {
      console.error('Error:', error);
    }
  }
window.displayUserProfile=displayUserProfile;
  
export function updateFollowButton(isFollowing, followButton) {  //Function to update the follow button display
    if (isFollowing) {
      followButton.classList.add('following');
      followButton.innerText = 'Unfollow';
    } else {
      followButton.classList.remove('following');
      followButton.innerText = '+ Follow';
    }
  }
window.updateFollowButton=updateFollowButton;
  
export async function loadUserPosts(posts,userData, data){  //Function to display the user's post
    const postsContainer = document.getElementById('user-posts-container');
    postsContainer.innerHTML = ''; 
  
    posts = posts.reverse();
  
    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');
      const isLiked = post.likedBy.includes(data.username);  //Checking for previous interaction
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
  
  
    document.querySelectorAll('.level-up').forEach(function(element) {  //Even listener to like a post
      element.addEventListener('click', async function(event) {
        event.preventDefault();
        const targetId = this.id;
        const levelCountElement = this.closest('.post').querySelector("#level-count");
        
        let currentLevel = parseInt(levelCountElement.innerText) || 0; 
        const levelDownButton = this.closest('.post').querySelector(".level-down");
        const tagsElement = this.closest('.post').querySelector(".tags");
        let tagsArray = [];
  
        
        if (tagsElement && tagsElement.id) {
          const tags = tagsElement.id;
          tagsArray = tags.split(',').map(tag => tag.trim());
        }
    
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
          likePost(targetId,tagsArray);  
        }
  
        levelCountElement.innerText = currentLevel;
      });
    });
    
    document.querySelectorAll('.level-down').forEach(function(element) {  //Even listener to dislike a post
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
  
    document.querySelectorAll('.save-post').forEach(function(element) {  //Even listener to save a post
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
  
    document.querySelectorAll('.view-comments').forEach(function(element) {  //Even listener to view comments
      element.addEventListener('click', function(event) {
        event.preventDefault();
        openComments(this.id);
      });
    });
  
    document.querySelectorAll('.publish-comment').forEach(function(element) {  //Even listener to post a comment
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
  window.loadUserPosts=loadUserPosts;

export async function openChat(targetUser){  //Function to open a chat
    document.getElementById('people-section').style.display="none";
    document.getElementById("chat-username").innerHTML=targetUser;
    try{
      const response = await fetch(`http://localhost:8000/M00980001/profile/${targetUser}`);
      const user = await response.json();
  
      const chatContainer = document.getElementById("chat-container");
      chatContainer.innerHTML = ''; 
      let messageDate='';
  
      const userElement = document.createElement('div');
      userElement.classList.add('chat-user');
  
      userElement.innerHTML = `
        <img src=${user.profileImg || "./images/default-photo.jpg"}>
        <p id="chat-username">${targetUser}</p>
      `;
  
      chatContainer.appendChild(userElement);
  
  
      const res = await fetch(`http://localhost:8000/M00980001/chat/${targetUser}`);
      const messages = await res.json();
  
      messages.forEach(message => {  //Loading the previous messages
        if (message.date!=messageDate){ //If the date changed between messages, it will add the date
          const chatDate = document.createElement('div');
          chatDate.classList.add('chat-date');
          chatDate.innerHTML=message.date;
          messageDate=message.date;
          chatContainer.appendChild(chatDate);
  
        }
        const messageElement = document.createElement('div');
        if (message.owner===targetUser){  //Displaying the messages to the left or right according to who sent them
          messageElement.classList.add('left-message'); 
        } else {
          messageElement.classList.add('right-message');
        }
  
        messageElement.innerHTML = `
            <div class="message-body">${message.content}</div>
            <div class="message-time">${message.time}</div>
        `;
  
        chatContainer.appendChild(messageElement);
      });
    } catch(error){
      console.error(error);
    }
    document.getElementById('chat').style.display="block";
  }
window.openChat=openChat;
  
export function closeChat(){ //Function to close the chat
    document.getElementById('chat').style.display="none";
  }
window.closeChat=closeChat;
  
export async function sendMessage(){  //Function to send a message
    const messageText=document.querySelector(".user-text").value;
    let user='';
    const otherUser=document.getElementById("chat-username").innerHTML;
  
    try{
      const response = await fetch(`http://localhost:8000/M00980001/login`);
      user = await response.json();
    } catch(error){
      console.error(error);
    }
  
    //Getting the current time and date
    const now = new Date();
    
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const year = String(now.getFullYear());
    const formattedDate = `${day}/${month}/${year}`;
  
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
  
    const message={
      date: formattedDate,
      content: messageText,
      time: formattedTime,
      owner: user.username,
    }
  
    fetch(`http://localhost:8000/M00980001/send/${otherUser}`, {  //POST request
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })
    .then(() => {
      const chatContainer = document.getElementById("chat-container");
    
      const dateElements = chatContainer.querySelectorAll(".chat-date");
      let lastDate = null;

      //Checking if the date changed from the previous message
      if (dateElements.length > 0) {
        lastDate = dateElements[dateElements.length - 1].innerHTML;
      }
    
      const now = new Date(); 
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 
    
      let lastMessageDate = null;
      if (lastDate) {
        const [day, month, year] = lastDate.split('/');
        lastMessageDate = new Date(year, month - 1, day); 
      }

      //Adding the current date if the date has changed
      if (!lastMessageDate || lastMessageDate < today) {
        const dateElement = document.createElement('div');
        dateElement.classList.add('chat-date');
        dateElement.innerHTML = message.date;
        chatContainer.appendChild(dateElement);
      }
    
      //Immediately displaying the new message
      if (message.content && message.time) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('right-message');
    
        messageElement.innerHTML = `
          <div class="message-body">${message.content}</div>
          <div class="message-time">${message.time}</div>
        `;
    
        chatContainer.appendChild(messageElement);
      }
    })    
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    });
    document.querySelector(".user-text").value='';
  }
window.sendMessage=sendMessage;  