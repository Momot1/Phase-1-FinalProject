const UNLIKED = '\u2661'
const LIKED = '\u2665'


document.addEventListener('DOMContentLoaded', () => {
    dealWithDom()
    grabGamesAndUpdateDom()
    grabFavorites()
})

function dealWithDom(){
    const searchBar = document.getElementById('search-form')
    searchBar.addEventListener('submit', e => {
        document.getElementById('all-results').className = ''
        document.getElementById('chosen-result').className = ''
        document.getElementById('favorite-result').className = 'hidden'
        document.getElementById('chosen-result').innerHTML = ''

        e.preventDefault()
        const userSearch = getUserInput()
        grabGamesAndUpdateDom(userSearch)
        searchBar.reset()
    })
}

function getUserInput(){
    return document.getElementById('search-form').querySelector('input').value
}

function grabGamesAndUpdateDom(search = 'Grand Theft Auto'){
    document.getElementById('results').querySelector('h2').textContent = `Results for ${search}`
    fetch(`https://www.cheapshark.com/api/1.0/games?title=${search}`)
    .then(resp => resp.json())
    .then(results => {
        displayResults(results)
    })
}

function displayResults(results){
    const resultsList = document.getElementById('results').querySelector('ul')
    resultsList.innerHTML = ''
    results.forEach(result => {
        const game = displayResult(result, resultsList)
        game.addEventListener('click', () => {
            document.getElementById('chosen-result').innerHTML = ''
            let like = checkLikedStatus(result)
            displayGameInfo(result, like)
        })
    });
}


function displayResult(result, resultsList){
    const title = document.createElement('li')
    title.textContent = result.external
    resultsList.appendChild(title)
    return title
}

function displayGameInfo(result, like = UNLIKED, container = document.getElementById('chosen-result')){
    const title = document.createElement('h4')    
    const price = document.createElement('p')
    const link = document.createElement('p')
    const likeBtn = document.createElement('button')
    likeBtn.textContent = like
    likeBtn.style.background = "white";

    title.textContent = result.external
    price.textContent = `Cheapest price: ${result.cheapest}`
    link.innerHTML = `<a href = 'https://www.cheapshark.com/redirect?dealID=${result.cheapestDealID}'>Purchase Link`
    container.appendChild(title)
    container.appendChild(price)
    container.appendChild(link)
    container.appendChild(likeBtn)

    likeBtn.addEventListener('click', () => {
        if(likeBtn.textContent === UNLIKED){
            likeBtn.textContent = LIKED
            //displayFavorites(result)
            addLikeToDB(result)
        } else{
            likeBtn.textContent = UNLIKED
            deleteLikedGame(result)
            displayFavorites(result, false)
        }
    })
}

function displayFavorites(result, add=true){
    const container = document.getElementById('favorites').querySelector('ul')
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

function dealWithFavoriteClick(result){
    document.getElementById('all-results').className = 'hidden'
    document.getElementById('chosen-result').className = 'hidden'
    const container = document.getElementById('favorite-result')
    
    document.getElementById('favorite-result-info').innerHTML = ''
    document.getElementById('results').querySelector('h2').textContent = `Result for ${result.external}`

    container.className = ''
    displayGameInfo(result, LIKED, document.getElementById('favorite-result-info'))

    dealWithNotifyForm(result)
}

function checkLikedStatus(result){
    const results = document.getElementById('favorites').querySelector('ul').querySelectorAll('li')
    let testResult 
    results.forEach(item => {
        if(item.textContent === result.external) testResult = true
    })
    if(testResult === true) return LIKED
    return UNLIKED
}

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
    .then(resp => resp.json())
    .then(result => {
        console.log(result)
        displayFavorites(result.result)
    })
}

function deleteLikedGame(result){
    fetch(`http://localhost:3000/favorites/${result.gameID}`, {
        method: 'DELETE'
    })
}

function grabFavorites(){
    fetch('http://localhost:3000/favorites')
    .then(resp => resp.json())
    .then(results => {
        results.forEach(result => displayFavorites(result.result))
    })
}