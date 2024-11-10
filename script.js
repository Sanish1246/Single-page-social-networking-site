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
function openPopup() {
    document.getElementById('login-popup').style.display = 'block';
}

// Close the login popup
function closePopup() {
    document.getElementById('login-popup').style.display = 'none';
}

// Attach the popup opening function to the login button
document.querySelector('nav a[href="#"]').addEventListener('click', openPopup);