// Like/Unliked emoji for button
const UNLIKED = '\u2661'
const LIKED = '\u2665'


document.addEventListener('DOMContentLoaded', () => {
    dealWithSearch()
    grabGamesAndUpdateDom()
    grabFavoritesAndDisplay()
})

// Grabs the user search from the search bar and searches for specified search. Also sets class names to hidden or from hidden to make sure when the user is displaying a favorite result, the search will show up
function dealWithSearch(){
    const searchBar = document.getElementById('search-form')
    searchBar.addEventListener('submit', e => {
        document.getElementById('all-results').className = ''
        document.getElementById('chosen-result').className = ''
        document.getElementById('favorite-result').className = 'hidden'
        document.getElementById('chosen-result').innerHTML = ''

        e.preventDefault()
        const userSearch = document.getElementById('search-form').querySelector('input').value
        grabGamesAndUpdateDom(userSearch)
        searchBar.reset()
    })
}

// Grabs the results from the search. Default search is search = to make it so when the website loads, there is some data already displayed
function grabGamesAndUpdateDom(search = 'Red Dead Redemption'){
    document.getElementById('results').querySelector('h2').textContent = `Results for ${search}`
    fetch(`https://www.cheapshark.com/api/1.0/games?title=${search}`)
    .then(resp => resp.json())
    .then(results => {
        displayResults(results)
    })
}

// Displays the search results to the user
function displayResults(results){
    const resultsList = document.getElementById('results').querySelector('ul')
    resultsList.innerHTML = ''
    results.forEach(result => {
        const game = displayResult(result, resultsList)
        // Adds an event listener to each title, checks if that game has been favorited, and displays the game info
        game.addEventListener('click', () => {
            document.getElementById('chosen-result').innerHTML = ''
            let like = checkLikedStatus(result)
            displayGameInfo(result, like)
        })
    });
}

// Displays each result to the user, returns the title of the result
function displayResult(result, resultsList){
    const title = document.createElement('li')
    title.textContent = result.external
    resultsList.appendChild(title)
    return title
}

// Displays the game information for the clicked title. Takes in the result, if the game has been liked, and a default container equal to the single result container
function displayGameInfo(result, like = UNLIKED, container = document.getElementById('chosen-result')){
    const price = document.createElement('p')
    const link = document.createElement('p')
    const likeBtn = document.createElement('button')
    likeBtn.textContent = like
    likeBtn.style.background = "white";

    price.textContent = `Cheapest price: ${result.cheapest}`
    link.innerHTML = `<a href = 'https://www.cheapshark.com/redirect?dealID=${result.cheapestDealID}'>Purchase Link`

    // If the container is the default container, then you create a title for that result. This is so there is only a title displayed when there is a single result displayed.
    if(container === document.getElementById('chosen-result')){
        const title = document.createElement('h4')
        container.appendChild(title)
        title.textContent = result.external
    }
    container.appendChild(price)
    container.appendChild(link)
    container.appendChild(likeBtn)

    // If the like button is clicked, it will add the result to the database and change the like button content. If the user removes their like, it will remove the like from the database and display updated info on screen
    likeBtn.addEventListener('click', () => {
        if(likeBtn.textContent === UNLIKED){
            likeBtn.textContent = LIKED

            displayFavorites(result)
            addLikeToDB(result)
        } else{
            likeBtn.textContent = UNLIKED

            displayFavorites(result, false)
            deleteLikedGame(result)
        }
    })
}

// Displays the favorites to the DOM
function displayFavorites(result, add=true){
    const container = document.getElementById('favorites').querySelector('ul')
    // If the user liked the game, it adds it to the DOM, otherwise it searches the list of games to find the correct game element and removes it from the DOM
    if(add === true){    
        const title = document.createElement('li')
        title.textContent = result.external
        container.appendChild(title)
        title.addEventListener('click', () => {
            dealWithFavoriteClick(result)
        })
    } else{
        const results = container.querySelectorAll('li')
        results.forEach(item => {
            if(item.textContent === result.external){
                item.remove()
            }
        })
    }
}

// When the user clicks on one of their favorite games, it will hide the results, and the chosen result and display info about that favorite game, as well as a form to fill out
function dealWithFavoriteClick(result){
    document.getElementById('all-results').className = 'hidden'
    document.getElementById('chosen-result').className = 'hidden'
    const container = document.getElementById('favorite-result')
    
    document.getElementById('favorite-result-info').innerHTML = ''
    document.getElementById('results').querySelector('h2').textContent = `${result.external}`

    container.className = ''
    displayGameInfo(result, LIKED, document.getElementById('favorite-result-info'))

    dealWithNotifyForm(result)
}

// Checks if the chosen result is liked or not 
function checkLikedStatus(result){
    const results = document.getElementById('favorites').querySelector('ul').querySelectorAll('li')
    let testResult 
    results.forEach(item => {
        if(item.textContent === result.external) testResult = true
    })
    if(testResult === true) return LIKED
    return UNLIKED
}

// When the user submits a notify at price form, it will send the information to the API for the user to get notified when the price drops below a certain point
function dealWithNotifyForm(result){
    const form = document.getElementById('notify-form')
    form.addEventListener('submit', e => {
        e.preventDefault()
        const name = e.target.querySelectorAll('input')[0].value
        const email = e.target.querySelectorAll('input')[1].value
        const notifyPrice = e.target.querySelectorAll('input')[2].value

        fetch(`https://www.cheapshark.com/api/1.0/alerts?action=set&email=${email}&gameID=${result.gameID}&price=${notifyPrice}`)
        .then(resp => resp.json())
        .then(resp => {
            resp === true?alert(`Thanks ${name}, you will be notified when the game reaches $${notifyPrice}`)
            :alert('There was an error with the information you provided, please try again')
        })

        form.reset()
    })
}

// Adds a game result to the database
function addLikeToDB(result){
    fetch('http://localhost:3000/favorites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: result.gameID,
            result
        })
    })
}

// Removes a game result from the database
function deleteLikedGame(result){
    fetch(`http://localhost:3000/favorites/${result.gameID}`, {
        method: 'DELETE'
    })
}

// Grabs all the favorites in the database to display to the user when the page reloads
function grabFavoritesAndDisplay(){
    fetch('http://localhost:3000/favorites')
    .then(resp => resp.json())
    .then(results => {
        results.forEach(result => displayFavorites(result.result))
    })
}