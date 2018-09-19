// DOM elements
const inputValue = document.querySelector("#search");
const searchButton = document.querySelector(".searchBtn");
// the sections to display results/favorites
const results_container = document.querySelector(".results_container");
const favorites_container = document.querySelector(".favorites_container");

// api tokens
const client_id = "Iv1.062f0c06d797e453";
const client_secret = "424bd47fc39785ad474a72c8623581b4b27367bc";

const MAX_RESULTS = 10;

// empty array declarations for displayItems and icons for both sections
let result_displayItems = [];
let result_addIcons = [];

let favorite_displayItems = [];
let favorite_removeIcons = [];

// asynchronous functions to perform api call to fetch search results and tags from github
const fetchResults = async (input) => {
    const api_call = await fetch(`https://api.github.com/search/repositories?q=${input}+in:name&sort=stars&order=desc?client_id=${client_id}&client_secret=${client_secret}`);
    // save it as json format
    const data = await api_call.json();
    return { data } 
}

const fetchTags = async (appName) => {
    const api_call = await fetch(`https://api.github.com/repos/${appName}/tags?client_id=${client_id}&client_secret=${client_secret}`);
    
    const data = await api_call.json();   
    return { data }
}

// function to call both asynchronous functions and assign callbacks for them
const fetchData = () => {
    // get the data as res
    fetchResults(inputValue.value).then((res) => {
        // get 10 results from the data
        for (let i = 0; i < MAX_RESULTS; i++) {
            // create an empty object for an item to be displayed
            let displayItem = {};
            // set its name and language from the data fetched
            displayItem.Name = res.data.items[i].full_name;
            displayItem.Language = res.data.items[i].language;
            // fetch the tag data from the url for tags, and save it in variable tags
            fetchTags(displayItem.Name).then((tags) => {
                // if the latest tag exists, we'll use it
                if (typeof(tags.data[0]) !== "undefined")
                    displayItem.LatestTag = tags.data[0].name;
                else
                    displayItem.LatestTag = "Not available";
                
                // now we've got an item, we can display it right-on, no need to wait for all of them
                // we'll fire an event notifying window that a new item is available
                result_displayItems.push(displayItem);
                window.dispatchEvent(new CustomEvent("newItemGot"));
            })
        }
    });
}

// function to create divs and append them to the right container
// type: 'results' or 'favorites'
const appendHTML = (index, type, container, itemArray) => {
    let newDiv = document.createElement('div');
    // give it a class name so that we can remove them more easily
    newDiv.className = `${type} row created`;
    // populate the content with the item got
    newDiv.innerHTML += divWrapper(itemArray[index].Name, 5);
    newDiv.innerHTML += divWrapper(itemArray[index].Language, 3);
    newDiv.innerHTML += divWrapper(itemArray[index].LatestTag, 3);
    // the plus or minus icon, give them an id
    if (type === 'results')
        newDiv.innerHTML += divWrapper(`<i id="addIcon${index}" class="fas fa-plus-circle"></i>`, 1);
    else
        newDiv.innerHTML += divWrapper(`<i id="removeIcon${index}" class="fas fa-minus-circle"></i>`, 1);
    // append the div we just created
    container.appendChild(newDiv);
}

// wrap the element with a bootstrap grid class div
// el stands for element, and w for width
const divWrapper = (el, w) => {
    return `<div class="col-sm-${w} col-md-${w} col-lg-${w} col-xl-${w}"><p>${el}</p></div>`;
}

// display the item at a certain index for results section
const showSearchResult = (index) => {
    // create and append the div first
    appendHTML(index, 'results', results_container, result_displayItems);
    // get the icon we just created, push them into the "+" icon array, 
    // so they have the exact same order as the display item objects.
    // the reason for this is because the icon isn't part of the object, 
    // but we need to relate them with each other so when register the icons
    // to listeners, we know which item is to be added or removed, and the "key" is the index
    result_addIcons.push(getIcon("addIcon", index));
    // register the icon to a listener and setup the callback
    registerIcon(result_addIcons[index], addFavorite);
}

const clearResultView = () => {
    // clear the html we created for the results section
    // use JQuery here for simplicity
    $('.results.row.created').remove();
    // clear the item array and icon array
    result_displayItems = [];
    result_addIcons = [];
}

const clearFavoriteView = () => {
    // clear the html we created for the favorites section
    $('.favorites.row.created').remove();
    // clear the favorite icon array, but we shouldn't clear the favorite items array
    // since we are only clearing the view for updating the view.
    favorite_removeIcons = [];
}

// callback for adding an item to favorites section
const addFavorite = (evt) => { 
    // declare a variable to store the index of the item we want to add
    let iconIndex;
    // pre-declare a flag to indicate if we have found a same item in favorites already
    let found = false;
    // loop through all icons
    for (let i = 0; i < result_addIcons.length; i++) {
        // if there is one that matches the one that has been clicked on
        // we record that index, through which we can find the related item
        if (result_addIcons[i] === evt.target)
        {
            iconIndex = i;
        }
    }
    
    // loop through favorites to check if the item exists in favorites
    for (let i = 0; i < favorite_displayItems.length; i++) {
        if (favorite_displayItems[i].Name == result_displayItems[iconIndex].Name) {
            // if it exists, set found to true, and nothing will happen
            found = true;
            // TODO: UX-wise, alert the user what's happening 
        }
    }
    
    // if the flag stays false, that means it's a new one, 
    // and we can safely push the item into favorites
    if (!found)
        favorite_displayItems.push(result_displayItems[iconIndex]);
    
    // refresh the favorites section
    showFavorites();
}

// get the icon object by id
const getIcon = (iconType, index) => {
    let iconID = iconType + index.toString();
    return document.getElementById(iconID);
}

// add a click event listener to the icon object
const registerIcon = (iconObj, callbackFunc) => {
    // TODO: UX-wise, can add a little bit animation here to indicate which icon has been clicked on
    iconObj.addEventListener("click", callbackFunc);
}

// it's more of refresh and display method
const showFavorites = () => {
    // clear everything first
    clearFavoriteView();
    
    // recreate all the items and "-" icons one by one, and re-register for all "-" icons
    for (let i = 0; i < favorite_displayItems.length; i++) {
        appendHTML(i, 'favorites', favorites_container, favorite_displayItems);
        favorite_removeIcons.push(getIcon("removeIcon", i));
        registerIcon(favorite_removeIcons[i], removeFavorite);
    }
    
    /* this is a little bit redundant and unnecessary, but it's the simplest way */
}

const removeFavorite = (evt) => {
    // loop through all "-" icons to check which one has been clicked on
    for (let i = 0; i < favorite_removeIcons.length; i++) {
        if (favorite_removeIcons[i] === evt.target) {
            // get rid of it
            favorite_displayItems.splice(i, 1);
        }
    }
    // refresh and display again
    showFavorites();
}

// this is more of the UX side, so user don't have to actually click on the button
window.addEventListener("keyup", (evt) => {
    evt.preventDefault();
    // "Enter" key
    if (evt.keyCode === 13)
        searchButton.click();
});

searchButton.addEventListener("click", () => {
    if (inputValue.value.length != 0) {
        // every new search will clear the old results
        clearResultView();
        // fetch again
        fetchData();
    } else {
        alert("Please type a key word!");
    }
});

window.addEventListener("newItemGot", (evt) => {
    // this will get called every time there is a new item available,
    // so the newest item would be at the last index, which is the array's length - 1
    let itemCount = result_displayItems.length;
    showSearchResult(itemCount - 1);
})


