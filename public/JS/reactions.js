//Module to handle post reactions
const systemMessage=document.getElementById('system-message');

export async function followUser(id){ //Function to follow a user
    fetch(`http://localhost:8000/M00980001/follow/${id}`, {  //POST request
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(message => {
      console.log(message.message)
    })
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    });
}
window.followUser=followUser;

export async function unfollowUser(id){ //Function to unfollow a user
  fetch(`http://localhost:8000/M00980001/follow/${id}`, {  //DELETE request
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(message => {
    console.log(message.message)
  })
  .catch(error => {
    systemMessage.innerText='❌ Error: ' + error;
    systemMessage.style.opacity='1';
    setTimeout(closeMessage,2000);
    closePopup();
  });
}
window.unfollowUser=unfollowUser;


export async function likePost(id,tags){  //Function to like a post
    fetch(`http://localhost:8000/M00980001/like/${id}`, {  //POST request
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(message => {
      console.log(message.message);
      addTags(tags);  //Adding tags to the user data
    })
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    });
}
window.likePost=likePost;
  
export async function removeLike(id){  //Function to remove a like
    fetch(`http://localhost:8000/M00980001/removeLike/${id}`, {  //DELETE request
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
window.removeLike=removeLike;
  
  export async function dislikePost(id){  //Function to dislike a post
    fetch(`http://localhost:8000/M00980001/dislike/${id}`, {  //POST request
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(message => {
      console.log(message.message)
    })
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    });
  }
 window.dislikePost=dislikePost;
  
  export async function removeDislike(id){  //Function to remove a dislike
    fetch(`http://localhost:8000/M00980001/removeDislike/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(message => {
      console.log(message.message)
    })
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    });
  }
  window.removeDislike=removeDislike;

export function openComments(id){  //Function to open the comments section
  closePopup();
  document.getElementById('comments-popup').style.display = 'block';
  loadComments(id);
}
window.openComments=openComments;

  export async function loadComments(id){  //Function to display the commments
    const commentsResponse = await fetch(`http://localhost:8000/M00980001/comments/${id}`);  //GET request
    let comments = await commentsResponse.json();
    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';
  
    comments=comments.reverse();  //Dislaying the comments from the most recent
  
    for (const comment of comments) {
      const commentElement = document.createElement('div');
      commentElement.classList.add('comment');
  
      try {
        const response = await fetch(`/M00980001/postOwner/${comment.username}`);
        const profileData = await response.json();
  
        commentElement.innerHTML = `
          <img src="${profileData.profileImg || './images/default-photo.jpg'}">
          <div class="comment-content">
            <p class="comment-details">${comment.username} on ${comment.date} at ${comment.time}</p>
            <p>${comment.content}</p>
          </div>
        `;
  
        commentsContainer.appendChild(commentElement);
  
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    }
  }
 window.loadComments=loadComments;

export async function postComment(id,newComment){  //Function to post a comment
    const response = await fetch('http://localhost:8000/M00980001/login');
    const data = await response.json();
  
    //Getting the current date and time
    const now = new Date();
  
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const year = String(now.getFullYear());
    const formattedDate = `${day}/${month}/${year}`;

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
  
    const comment = {
      username:data.username,
      date:formattedDate,
      content: newComment,
      time:formattedTime
    }
  
    fetch(`http://localhost:8000/M00980001/comment/${id}`, {  //POST request
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
    })
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
    });
  }
window.postComment=postComment;
  
  export async function savePost(id){  //Function to save a post
    fetch(`http://localhost:8000/M00980001/save/${id}`, {  //POST request
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
    })
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
    });
  }
window.savePost=savePost;
  
  export async function removeSavedPost(id){  //Function to remove a post from saved
    fetch(`http://localhost:8000/M00980001/removeSaved/${id}`, {  //DELETE request
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
window.removeSavedPost=removeSavedPost;

export async function addTags(tags) {  //Function to add tags to the user preferences
  try{
    fetch(`http://localhost:8000/M00980001/tags`, {  //POST request
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tags)
    })
  } catch (error) {
    console.error(error);
  }
}
window.addTags=addTags;