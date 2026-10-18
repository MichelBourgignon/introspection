/* Ajout : bouton clearFavorites dans le menu, avec confirmation, vidage du tableau favorites, sauvegarde, renderMenu et updateFavoriteButton. Le reste du code reste identique à la version publiée. */
const clearFavoritesButton=document.getElementById("clearFavorites");
clearFavoritesButton.addEventListener("click",()=>{if(!window.confirm("Vider tous les favoris ? Cette action est définitive."))return;saveFavorites([]);renderMenu();updateFavoriteButton();});
