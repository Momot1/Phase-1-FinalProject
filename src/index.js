document.addEventListener('DOMContentLoaded', () => {
    dealWithDom()
    grabGamesAndUpdateDom()
})

function dealWithDom(){
    const searchBar = document.getElementById('search-form')
    searchBar.addEventListener('submit', e => {
        e.preventDefault()
        const userSearch = getUserInput()
        grabGamesAndUpdateDom(userSearch)
        searchBar.reset()
    })
}

function getUserInput(){
    return document.getElementById('search-form').querySelector('input').value
}

function grabGamesAndUpdateDom(search = 'batman'){
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
            displayGameInfo(result)
        })
    });
}

function displayResult(result, resultsList){
    const title = document.createElement('li')
    title.textContent = result.external
    resultsList.appendChild(title)
    return title
}

function displayGameInfo(result){
    console.log(result)
    const container = document.getElementById('chosen-result')
    const title = document.createElement('h4')    
    const price = document.createElement('p')
    const link = document.createElement('p')
    const likeBtn = document.createElement('button')
    likeBtn.textContent = '\u2661'
    likeBtn.style.background = "white";

    container.innerHTML = ''
    title.textContent = result.external
    price.textContent = `Cheapest price: ${result.cheapest}`
    link.innerHTML = `<a href = 'https://www.cheapshark.com/redirect?dealID=${result.cheapestDealID}'>Purchase Link`
    container.appendChild(title)
    container.appendChild(price)
    container.appendChild(link)
    container.appendChild(likeBtn)

    likeBtn.addEventListener('click', () => {
        if(likeBtn.textContent === '\u2661'){
            likeBtn.textContent = '\u2665'
            dealWithFavorite(result)
        } else{
            likeBtn.textContent = '\u2661'
            dealWithFavorite(result, false)
        }
    })
}


function dealWithFavorite(result, isFavorite=true){
    let method
    if(isFavorite === true){
        method = 'POST'
    } else {
        method = 'DELETE'
    }


}