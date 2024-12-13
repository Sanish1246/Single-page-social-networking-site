//Module to hadle the side navigation bar
export async function openNav() {  //Function to open the side bar
    document.getElementById("side-menu").style.width = "250px";
    document.getElementById("menu-opener").style.opacity = "0";
    try {
      const response = await fetch(`http://localhost:8000/M00980001/login`);
      const data = await response.json();
      
      const profileImageElement = document.getElementById("user-img");
      profileImageElement.src = data.profileImg ? data.profileImg : './images/default-photo.jpg';  //Using a default picture for users not yet logged in

    } catch(error){
      console.log("Error: " + error)
    }

  }
window.openNav=openNav;
  
export function closeNav() {  //Function to close the side bar
    document.getElementById("side-menu").style.width = "0";
    document.getElementById("menu-opener").style.opacity = "1";
}
window.closeNav=closeNav;
