const systemMessage=document.getElementById('system-message');

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
  
  document.getElementById('logout-button').addEventListener('click', function(event){
    checkCurrentUser().then(isUserLoggedIn => {
      if (isUserLoggedIn) {
        closeNav();
        openLogOut();
      } else {
        systemMessage.innerText='❌ You must login to view this';
        systemMessage.style.opacity='1';
        setTimeout(closeMessage,2000);
        closePopup();
      }
    });
  });

export async function displayYourData() {
    try {
      const response = await fetch('http://localhost:8000/M00980001/login');
      const data = await response.json();
  
      document.getElementById('your-username').innerText = data.username;
      document.getElementById('your-following').innerText = data.following.length;
      document.getElementById('your-followers').innerText = data.followers.length;
  
      const profileImageElement = document.getElementById("yourImage");
      profileImageElement.src = data.profileImg ? data.profileImg : './images/default-photo.jpg';
  
      const postsResponse = await fetch('http://localhost:8000/M00980001/user/posts');
      const posts = await postsResponse.json();
  
      loadYourPosts(posts, data);
  
    } catch (error) {
      console.error('Error:', error);
    }
  }
window.displayYourData=displayYourData;
  
  
  document.getElementById('change-profile-pic').addEventListener('change', function(event) {
    const file = event.target.files[0]; 
    if (file) {
      const imgPreview = document.getElementById('profileImage'); 
      imgPreview.src = URL.createObjectURL(file); 
    }
  });
  
  document.getElementById('upload-button').addEventListener('click', async function() {
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
  
export async function loadYourPosts(posts, data) {
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
              <button class="view-comments" id=${post._id}>💬Comments</button>
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
window.loadYourPosts=loadYourPosts;

export async function fetchSavedPosts(){
    const response = await fetch('http://localhost:8000/M00980001/login');
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
              <button class="view-comments" id=${post._id}>💬Comments</button>
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
        if (this.classList.contains("following")) {
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
window.fetchSavedPosts=fetchSavedPosts;
  
  
export async function loadFavourites(){
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
window.loadFavourites=loadFavourites;
  