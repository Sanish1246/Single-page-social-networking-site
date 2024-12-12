const systemMessage=document.getElementById('system-message');

export async function followUser(id){
    fetch(`http://localhost:8000/M00980001/follow/${id}`, {
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

export async function unfollowUser(id){
  fetch(`http://localhost:8000/M00980001/follow/${id}`, {
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


export async function likePost(id,tags){
    fetch(`http://localhost:8000/M00980001/like/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(message => {
      console.log(message.message);
      addTags(tags);
    })
    .catch(error => {
      systemMessage.innerText='❌ Error: ' + error;
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    });
}
window.likePost=likePost;
  
export async function removeLike(id){
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
window.removeLike=removeLike;
  
  export async function dislikePost(id){
    fetch(`http://localhost:8000/M00980001/dislike/${id}`, {
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
  
  export async function removeDislike(id){
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

export function openComments(id){
  closePopup();
  document.getElementById('comments-popup').style.display = 'block';
  loadComments(id);
}
window.openComments=openComments;

  export async function loadComments(id){
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

export async function postComment(id,newComment){
    const response = await fetch('http://localhost:8000/M00980001/login');
    const data = await response.json();
  
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
window.postComment=postComment;
  
  export async function savePost(id){
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
window.savePost=savePost;
  
  export async function removeSavedPost(id){
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
window.removeSavedPost=removeSavedPost;

export async function addTags(tags) {
  try{
    fetch(`http://localhost:8000/M00980001/tags`, {
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