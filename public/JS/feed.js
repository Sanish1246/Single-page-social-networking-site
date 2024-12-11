let sortBy="recent";

export async function displayFeedPosts(){
    try {
    const response = await fetch('http://localhost:8000/M00980001/login');
    const data = await response.json();

    if(Object.keys(data).length === 0){
      const postsResponse = await fetch(`http://localhost:8000/M00980001/latest/${sortBy}`);
      const posts = await postsResponse.json();
      console.log("Not login")
      loadLatestPosts(posts);
    } else {
      const postsResponse = await fetch(`http://localhost:8000/M00980001/contents/${sortBy}`);
      const posts = await postsResponse.json();
      console.log("loggedin")
      loadFeedPosts(posts, data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

window.displayFeedPosts-displayFeedPosts;

export async function loadLatestPosts(posts) {
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
window.loadLatestPosts=loadLatestPosts;

  export async function loadFeedPosts(posts, data) {
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
          <div class="tags" id=${post.tags}><div>
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
  window.loadFeedPosts=loadFeedPosts;

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

  export function publishPost(event) {
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
  
   
    fetch('http://localhost:8000/M00980001/contents', {
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
  window.publishPost=publishPost;

