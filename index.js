const inputValue = document.querySelector("#search");
const searchButton = document.querySelector(".searchBtn");

const result_nameContainer = document.querySelector(".results_name");
const result_languageContainer = document.querySelector(".results_language");
const result_tagContainer = document.querySelector(".results_tag");
const result_addIconContainer = document.querySelector(".addIcons");


//favorite repos
const favorite_nameContainer = document.querySelector(".favorites_name");
const favorite_languageContainer = document.querySelector(".favorites_language");
const favorite_tagContainer = document.querySelector(".favorites_tag");
const favorite_removeIconContainer = document.querySelector(".removeIcons");


//api tokens
const client_id = "Iv1.062f0c06d797e453";
const client_secret = "424bd47fc39785ad474a72c8623581b4b27367bc";


let result_displayItems = [];
let result_addIcons = [];

let favorite_displayItems = [];
let favorite_removeIcons = [];

const fetchResults = async (input) => {
    const api_call = await fetch(`https://api.github.com/search/repositories?q=${input}+in:name&sort=stars&order=desc?client_id=${client_id}&client_secret=${client_secret}`);
    
    const data = await api_call.json();
    
    return { data } 
}


const fetchTags = async (appName) => {
    const api_call = await fetch(`https://api.github.com/repos/${appName}/tags?client_id=${client_id}&client_secret=${client_secret}`);
    
    const data = await api_call.json();
    
    return { data }
}

const fetchData = () => {
    fetchResults(inputValue.value).then((res) => {
        
        var asyncTasksLeft = 0;
        
        for (let i = 0; i <10; i++) {
            asyncTasksLeft++;
            let displayItem = {};
            
            displayItem.Name = res.data.items[i].full_name;
            displayItem.Language = res.data.items[i].language;
          
            fetchTags(displayItem.Name).then((tags) => {
                if (typeof(tags.data[0]) !== "undefined")
                    displayItem.LatestTag = tags.data[0].name;
                else
                    displayItem.LatestTag = "Not available";
                
                result_displayItems.push(displayItem);
                
                // Decrement async count everytime we are in this callback func,
                // and when no callback's left, we continue our program
                if (--asyncTasksLeft == 0) {
                    window.dispatchEvent(new CustomEvent("asyncTasksDone"));
                }
            })
        }
    });
}

const showSearchResults = () => {
    for (let i = 0; i < 10; i++) {      
        result_nameContainer.innerHTML += `<p>${result_displayItems[i].Name}</p>`;
        result_languageContainer.innerHTML += `<p>${result_displayItems[i].Language}</p>`;
        result_tagContainer.innerHTML += `<p>${result_displayItems[i].LatestTag}</p>`;
        result_addIconContainer.innerHTML += `<p><i class="fas fa-plus-circle"></i></p>`;
    }
    result_addIcons = getIconArray('fas fa-plus-circle');
    registerIcons(result_addIcons, addFavorite);
}

const clearResultView = () => {
    result_nameContainer.innerHTML = "";
    result_languageContainer.innerHTML = "";
    result_tagContainer.innerHTML = "";
    result_addIconContainer.innerHTML = "";
    result_displayItems = [];
    result_addIcons = [];
}

const clearFavoriteView = () => {
    favorite_nameContainer.innerHTML = "";
    favorite_languageContainer.innerHTML = "";
    favorite_tagContainer.innerHTML = "";
    favorite_removeIconContainer.innerHTML = "";
}

const addFavorite = (evt) => { 
    let iconIndex;
    let found = false;
    for (let i = 0; i < result_addIcons.length; i++) {
        if (result_addIcons[i] === evt.target)
        {
            iconIndex = i;
        }
    }
    
    for (let i = 0; i < favorite_displayItems.length; i++) {
        if (favorite_displayItems[i].Name == result_displayItems[iconIndex].Name)
            found = true;
    }
    
    if (!found)
        favorite_displayItems.push(result_displayItems[iconIndex]);
    
    showFavorites();
}

const getIconArray = (iconClassName) => {
    return document.getElementsByClassName(iconClassName);
}

const registerIcons = (iconsArray, callbackFunc) => {
    for (let i = 0; i < iconsArray.length; i++) {
        iconsArray[i].addEventListener("click", callbackFunc);
    }
}

const showFavorites = () => {
    clearFavoriteView();
    for (let i = 0; i < favorite_displayItems.length; i++) {
        favorite_nameContainer.innerHTML += `<p>${favorite_displayItems[i].Name}</p>`;
        favorite_languageContainer.innerHTML += `<p>${favorite_displayItems[i].Language}</p>`;
        favorite_tagContainer.innerHTML += `<p>${favorite_displayItems[i].LatestTag}</p>`;
        favorite_removeIconContainer.innerHTML += `<p><i class="fas fa-minus-circle"></i></p>`;
    }
    
    favorite_removeIcons = getIconArray('fas fa-minus-circle');
    registerIcons(favorite_removeIcons, removeFavorite);
}

const removeFavorite = (evt) => {
    for (let i = 0; i < favorite_removeIcons.length; i++) {
        if (favorite_removeIcons[i] === evt.target) {
            favorite_displayItems.splice(i, 1);
        }
    }
    
    showFavorites();
}

window.addEventListener("keyup", (evt) => {
    evt.preventDefault();
    if (evt.keyCode === 13)
        searchButton.click();
});

searchButton.addEventListener("click", () => {
    if (inputValue.value.length != 0) {
        clearResultView();
        fetchData();
        showFavorites();
    } else {
        alert("Please type a key word!");
    }
});

window.addEventListener("asyncTasksDone", () => {
    showSearchResults();
});


