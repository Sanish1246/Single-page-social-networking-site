const systemMessage=document.getElementById('system-message');
let pageNo=1;

export async function displayGames() {
    const gameContainer = document.getElementById("game-container");
    gameContainer.innerHTML = ''; 
  
    try {
      const userResponse = await fetch(`http://localhost:8000/M00980001/login`);
      const userData = await userResponse.json();
  
      const response = await fetch(`http://localhost:8000/M00980001/games/${pageNo}`);
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
window.displayGames=displayGames;

export async function addFavourite(newGame){
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
window.addFavourite=addFavourite;
  
export async function removeFavourite(game){
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
window.removeFavourite=removeFavourite;

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
  