const modeButton=document.getElementById("mode-button");
const top_bar=document.getElementById("top-bar");

window.onload=()=>{
    history.pushState(null, '', '/M00980001');
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
        // Remove the active class from all buttons
        document.querySelectorAll('.section-button').forEach(btn => btn.classList.remove('active'));
        
        // Add the active class to the clicked button
        this.classList.add('active');

        if (this.id=='feed-button'){
            openFeed();
        } else if (this.id=='people-button'){
            openPeople();
        } else {
            openFollowing();
        }
    });
});

function openNav() {
    document.getElementById("side-menu").style.width = "250px";
    document.getElementById("menu-opener").style.opacity = "0";
  }
  
  function closeNav() {
    document.getElementById("side-menu").style.width = "0";
    document.getElementById("menu-opener").style.opacity = "1";
  }

// Open the login popup and update the URL to "/login"
function openLogin() {
    closePopup();
    document.getElementById('login-popup').style.display = 'block';

    // Add "/login" to the URL without reloading the page
    history.pushState(null, '', '/M0098001/login');
}

// Open the register popup and update the URL to "/register"
function openRegister() {
    closePopup();
    document.getElementById('register-popup').style.display = 'block';

    // Add "/register" to the URL without reloading the page
    history.pushState(null, '', '/M0098001/register');
}

// Close both the login and register popups and restore the original URL
function closePopup() {
    document.getElementById('login-popup').style.display = 'none';
    document.getElementById('register-popup').style.display = 'none';

    history.replaceState(null, '', '/M0098001');
}

// Handle popstate event for when the user navigates using the browser back button
window.addEventListener('popstate', function(event) {
    if (document.getElementById('login-popup').style.display === 'block' || 
        document.getElementById('register-popup').style.display === 'block') {
        closePopup();
    }
});

// Attaching the popup to the login and register links
document.querySelectorAll('.login-link').forEach(function(element) {
    element.addEventListener('click', function(event) {
        event.preventDefault(); 
        openLogin();
    });
});

document.querySelector('.register-link').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    openRegister();
});


function closeSection(){
    document.getElementById('feed-posts').style.display = 'none';
    document.getElementById('following-posts').style.display = 'none';
    document.getElementById('people-section').style.display = 'none';
}

function openFollowing(){
    closeSection();
    document.getElementById('following-posts').style.display = 'block';
    history.pushState(null, '', '/M00980001/following');
}

function openFeed(){
    closeSection();
    document.getElementById('feed-posts').style.display = 'block';
    history.pushState(null, '', '/M00980001');
}

function openPeople(){
    closeSection();
    document.getElementById('people-section').style.display = 'block';
    history.pushState(null, '', '/M00980001/people');
}
