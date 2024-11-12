const modeButton=document.getElementById("mode-button");
const top_bar=document.getElementById("top-bar");

function switchMode(){
    if (document.body.style.backgroundColor=="white"){
        document.body.style.backgroundColor="black";
        modeButton.innerHTML="☀️ Light mode"
        top_bar.style.borderColor="white";
    } else {
        document.body.style.backgroundColor="white";
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

// Open the login popup
function openLogin() {
    closePopup();
    document.getElementById('login-popup').style.display = 'block';
}

// Close the login popup
function closePopup() {
    document.getElementById('login-popup').style.display = 'none';
    document.getElementById('register-popup').style.display = 'none';
}

function openRegister(){
    closePopup();
    document.getElementById('register-popup').style.display = 'block';
}

// Attach the popup function to the login button
document.querySelectorAll('.login-link').forEach(function(element) {
    element.addEventListener('click', openLogin);
});
document.querySelector('.register-link').addEventListener('click', openRegister);

function closeSection(){
    document.getElementById('feed-posts').style.display = 'none';
    document.getElementById('following-posts').style.display = 'none';
    document.getElementById('people-section').style.display = 'none';
}

function openFollowing(){
    closeSection();
    document.getElementById('following-posts').style.display = 'block';
}

function openFeed(){
    closeSection();
    document.getElementById('feed-posts').style.display = 'block';
}

function openPeople(){
    closeSection();
    document.getElementById('people-section').style.display = 'block';
}
