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