//Main JS module

import {openLogin} from './loginRegister.js';
import {displayFeedPosts} from './feed.js';
import { displayFollowingPosts } from './following.js';
import { fetchPeople, closeChat} from './people.js';
import { displayGames} from './games.js';
import { openNews } from './news.js';
import { displayYourData, fetchSavedPosts, loadFavourites } from './navSections.js';
import {closeNav} from './navBar.js';

const modeButton=document.getElementById("mode-button");
const systemMessage=document.getElementById('system-message');

window.onload = async() => {  //Handling reloading and first loading of the page
  history.pushState(null, '', '/M00980001');
  checkCurrentUser();
  document.getElementById("feed-button").classList.add('active');
  document.getElementById('feed-recent').classList.add('active');
  document.getElementById('search-recent').classList.add('active');

  displayFeedPosts();
};

async function checkCurrentUser() {  //Function to check the current login status
  try {
    const response = await fetch('http://localhost:8000/M00980001/login');  //GET request
    const data = await response.json();
    if (data.username) {
      document.getElementById("login-link").innerText="Log out";
      document.getElementById('currentUser').innerText = data.username;
      return true;
    } else {
      document.getElementById("login-link").innerText="Login";
      document.getElementById('currentUser').innerText = "No user";
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
window.checkCurrentUser=checkCurrentUser;

function switchMode(){  //Function to switch themes
  document.body.classList.toggle('dark-mode');

  if (document.body.classList.contains('dark-mode')) {
      modeButton.innerHTML = "☀️ Light mode";
  } else {
      modeButton.innerHTML = "🌙 Dark mode";
  }
}
window.switchMode=switchMode;

document.querySelectorAll('.section-button').forEach(button => {  //Event listener to handle the main section buttons
    button.addEventListener('click', function() {
        document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));
        
        this.classList.add('active');

        if (this.id=='feed-button'){
            openFeed();
        } else if (this.id=='people-button'){
            openPeople();
        } else if(this.id=="following-button") {
            openFollowing();
        } else if(this.id=="games-button") {
          openGames();
        } else {
          openNews()
        }
    });
});

//Functions for the main sections
function openSections(){  //Function to open the main sections
  closeFavourite();
  closeSaved();
  closeProfile();
  closeNav();
  document.querySelectorAll('.section-button').forEach(btn => btn.style.display='block');
  document.getElementById("feed-posts").style.display="block";
  document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));
}
window.openSections=openSections;

function openFeed(){  //Function to open the feed section
  closeSection();
  document.getElementById('searched-posts').style.display = 'none';
  document.getElementById('feed-posts').style.display = 'block';
  document.getElementById('feed-recent').classList.add('active');
  displayFeedPosts();
}
window.openFeed=openFeed;

function openFollowing(){  //Function to open the following secton
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

function openPeople(){  //Function to open the people section
  closeChat();
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

function openGames(){  //Function to open the games section
  closeSection();
  document.getElementById('searched-posts').style.display = 'none';
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('games-section').style.display = 'block';
      displayGames();
    } else {
      systemMessage.innerText='❌ You must login to view this';
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    }
  });
}
window.openGames=openGames;

//functions to open the popups
function openRegister() {  //Function to open the register popup
    closePopup();
    document.getElementById('register-popup').style.display = 'block';
}
window.openRegister=openRegister;

function openLogOut(){  //Function to open the logout popup
  closeNav();
  document.getElementById('logout-popup').style.display = 'block';
}
window.openLogOut=openLogOut;

function openUpload(){  //Function to open the post upload popup
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      document.getElementById('upload-popup').style.display = 'block';
    } else {
      openLogin();
    }
  });
}
window.openUpload=openUpload;

//functions for the side bar sections
function openProfile(){  //Function to open Your Profile
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
window.openProfile=openProfile;

function openSaved(){  //Function to open the Saved posts section
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      closeNav();
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
window.openSaved=openSaved;

function openFavourite(){  //Function to open the Favourite posts section
  checkCurrentUser().then(isUserLoggedIn => {
    if (isUserLoggedIn) {
      loadFavourites();
      closeNav();
      document.getElementById('favourite-games').style.display='block';
    } else {
      systemMessage.innerText='❌ You must login to view this';
      systemMessage.style.opacity='1';
      setTimeout(closeMessage,2000);
      closePopup();
    }
  });
}
window.openFavourite=openFavourite;

function closePopup() { //Function to close the popups
    document.getElementById('login-popup').style.display = 'none';
    document.getElementById('register-popup').style.display = 'none';
    document.getElementById('logout-popup').style.display = 'none';
    document.getElementById('upload-popup').style.display = 'none';
    document.getElementById('comments-popup').style.display = 'none';

    history.replaceState(null, '', '/M00980001');
}
window.closePopup = closePopup;

window.addEventListener('popstate', function(event) {  //Function in case the user press the back arrow while a popup is opened
    if (document.getElementById('login-popup').style.display === 'block' || 
        document.getElementById('register-popup').style.display === 'block'||
        document.getElementById('logout-popup').style.display === 'block'||
        document.getElementById('upload-popup').style.display === 'block') {
        closePopup();
    }
});

function closeSection(){  //Function to close the sections
  document.querySelectorAll('.main-section').forEach(sct => sct.style.display='none');
}
window.closeSection=closeSection;

function closeSectionButton(){ //Function to close the section buttons
  document.querySelectorAll('.section-button').forEach(btn => btn.style.display='none');
}
window.closeSectionButton=closeSectionButton;

function closeProfile(){  //Function to close your profile
  document.getElementById('your-profile').style.display='none';
  closeNav();
}
window.closeProfile=closeProfile;

function closeSaved(){  //Function to close Saved Posts
  document.getElementById('saved-posts').style.display='none';
  closeNav();
}
window.closeSaved=closeSaved;


function closeFavourite(){  //Function to close Favourite games
  document.getElementById('favourite-games').style.display='none';
  closeNav();
}
window.closeFavourite=closeFavourite;

function closeMessage(){  //Function to close the system message
    systemMessage.style.opacity='0';
}
window.closeMessage=closeMessage;



