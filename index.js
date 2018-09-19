const inputValue = document.querySelector("#search");
const searchButton = document.querySelector(".searchBtn");

const results_container = document.querySelector(".results_container");
const favorites_container = document.querySelector(".favorites_container");

// api tokens
const client_id = "Iv1.062f0c06d797e453";
const client_secret = "424bd47fc39785ad474a72c8623581b4b27367bc";

const MAX_RESULTS = 10;

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
              
        for (let i = 0; i < MAX_RESULTS; i++) {
            let displayItem = {};
            
            displayItem.Name = res.data.items[i].full_name;
            displayItem.Language = res.data.items[i].language;
          
            fetchTags(displayItem.Name).then((tags) => {
                if (typeof(tags.data[0]) !== "undefined")
                    displayItem.LatestTag = tags.data[0].name;
                else
                    displayItem.LatestTag = "Not available";
                
                // now we've got an item, we can display it already, no need to wait for all of them
                result_displayItems.push(displayItem);
                window.dispatchEvent(new CustomEvent("newItemGot"));
            })
        }
    });
}

// type: 'results' or 'favorites'
const appendHTML = (index, type, container, itemArray) => {
    let newDiv = document.createElement('div');
    newDiv.className = `${type} row created`;    
    newDiv.innerHTML += divWrapper(itemArray[index].Name, 5);
    newDiv.innerHTML += divWrapper(itemArray[index].Language, 3);
    newDiv.innerHTML += divWrapper(itemArray[index].LatestTag, 3);
    if (type === 'results')
        newDiv.innerHTML += divWrapper(`<i id="addIcon${index}" class="fas fa-plus-circle"></i>`, 1);
    else
        newDiv.innerHTML += divWrapper(`<i id="removeIcon${index}" class="fas fa-minus-circle"></i>`, 1);
    container.appendChild(newDiv);
}

// el stands for element, and w for width
const divWrapper = (el, w) => {
    return `<div class="col-sm-${w} col-md-${w} col-lg-${w} col-xl-${w}"><p>${el}</p></div>`;
}

const showSearchResult = (index) => {
    
    appendHTML(index, 'results', results_container, result_displayItems);
    
    result_addIcons.push(getIcon("addIcon", index));
    registerIcon(result_addIcons[index], addFavorite);
}

const clearResultView = () => {
    $('.results.row.created').remove();
    
    result_displayItems = [];
    result_addIcons = [];
}

const clearFavoriteView = () => {
    $('.favorites.row.created').remove();
    favorite_removeIcons = [];
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

const getIcon = (iconType, index) => {
    let iconID = iconType + index.toString();
    return document.getElementById(iconID);
}

const registerIcon = (iconObj, callbackFunc) => {
    iconObj.addEventListener("click", callbackFunc);
}

const showFavorites = () => {
    clearFavoriteView();
    
    for (let i = 0; i < favorite_displayItems.length; i++) {
        appendHTML(i, 'favorites', favorites_container, favorite_displayItems);
        favorite_removeIcons.push(getIcon("removeIcon", i));
        console.log(favorite_removeIcons[i].id);
        registerIcon(favorite_removeIcons[i], removeFavorite);
    }
    
    console.log(favorite_displayItems.length);
}

const removeFavorite = (evt) => {
    for (let i = 0; i < favorite_removeIcons.length; i++) {
        if (favorite_removeIcons[i] === evt.target) {
            console.log('1');
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
    } else {
        alert("Please type a key word!");
    }
});

window.addEventListener("newItemGot", (evt) => {
    let itemCount = result_displayItems.length;
    showSearchResult(itemCount - 1);
})


