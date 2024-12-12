export async function displayFollowingPosts(){
    const response = await fetch('http://localhost:8000/M00980001/login');
    const data = await response.json();
  
    const postsResponse = await fetch('http://localhost:8000/M00980001/contents');
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

    document.querySelectorAll('.follow-user').forEach(function(element) {
      element.addEventListener('click', async function(event) {
        event.preventDefault();
        const targetId = this.id;
        if (this.classList.contains('following')) {
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
          let tags = tagsElement.id;
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
        const newComment = this.previousElementSibling.value;
        postComment(this.id,newComment);
      });
    });
  }

  window.displayFollowingPosts=displayFollowingPosts;