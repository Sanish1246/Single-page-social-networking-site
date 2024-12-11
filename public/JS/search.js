let pageNo=1;
let searchPageNo=1;
let searchFilter="recent";
let targetText='';

export async function searchPosts(searchTarget){
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
      const response = await fetch(`http://localhost:8000/M00980001/contents/search/${targetText}/${searchFilter}`);
      let posts = await response.json();
      const postsContainer = document.getElementById('post-search-container');
  
      const res = await fetch('http://localhost:8000/M00980001/login');
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
window.searchPosts=searchPosts;

export function clearPostsResults(){
    document.getElementById("post-search-container").style.display="none";
    openSections();
    document.getElementById("feed-button").classList.add('active');
    document.getElementById("search-text").value='';
}
window.clearPostsResults=clearPostsResults;

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

export async function searchPeople(){
    const targetText=document.getElementById("search-person").value;
  
    document.getElementById("people-container").style.display="none";
  
    try {
      const response = await fetch(`http://localhost:8000/M00980001/users/search/${targetText}`);
      const people = await response.json();
      const peopleContainer = document.getElementById('searched-people-container');
  
      const res = await fetch('http://localhost:8000/M00980001/login');
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
              <a id="chat-link" class="chat-link" id=${person.username}>💬</a>
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
            if (targetUser!=data.username){
              displayUserProfile(targetUser);
            } else {
              closeSection();
              closeSectionButton();
              openProfile();
            }
          });
        });
  
        document.querySelectorAll('.chat-link').forEach(function(element) {
         element.addEventListener('click', async function() {
          const targetUser = this.id;
          if (targetUser!=data.username){
            openChat(targetUser);
          }
        });
      });
  
      } 
      document.getElementById("searched-people-container").style.display="block"
    } catch (error) {
      console.error('Error:', error);
    }
  }
window.searchPeople=searchPeople;
  
export function clearPeopleResults(){
    document.getElementById("searched-people-container").style.display="none";
    document.getElementById("search-person").value='';
    document.getElementById("people-container").style.display="block";
  }
window.clearPeopleResults=clearPeopleResults;

export async function searchGame() {
    document.getElementById("normal-game").style.display = "none";
    document.getElementById("searched-games").style.display = "block";
    const targetGame = document.getElementById("search-game").value;
  
    const gameContainer = document.getElementById("searched-games-container");
    gameContainer.innerHTML = ''; 
  
    try {
      const userResponse = await fetch(`http://localhost:8000/M00980001/login`);
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
window.searchGame=searchGame;
  
export function clearGameResults(){
    document.getElementById("searched-games").style.display="none";
    document.getElementById("search-game").value='';
    document.getElementById("normal-game").style.display="block";
}
window.clearGameResults=clearGameResults;
  
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
