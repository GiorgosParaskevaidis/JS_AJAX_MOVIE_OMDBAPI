$(function () {
    var deboundsTimeout = null;
    $('#searchInput').on('input', function() {
        clearTimeout(deboundsTimeout)
        deboundsTimeout = setTimeout(() => getMovie(this.value.trim()), 1500)
    })

    $('#showMore').on('click', function() {
        onShowMoreClicked()
    })
})

function getMovie(title) {
    if (!title) {
        return
    }

    onBeforeSend()
    fetchMovieFromApi(title)
}

function fetchMovieFromApi(title) {
    let ajaxRequest = new XMLHttpRequest()

    ajaxRequest.open("GET", `http://www.omdbapi.com/?t=${title}&apikey=3f563eef`, true)
    ajaxRequest.timeout = 5000  //timeout aster 5sec
    ajaxRequest.ontimeout = (e) => onApiError()
    ajaxRequest.onreadystatechange = function() {
        if (ajaxRequest.readyState == 4) {
            if (ajaxRequest.status === 200) {
                handleResults(JSON.parse(ajaxRequest.responseText))
            }
            else {
                onApiError()
            }
        }
    }
    ajaxRequest.send()
}

function handleResults(result) {
    if (result.Response === 'True') {
        let transformed = transformResponse(result)
        buildMovie(transformed)
    } else if (result.Response === 'False') {
        hideComponent('#waiting')
        showNotFound()
    }
}

function buildMovie(apiResponse) {
    if (apiResponse.poster) {
        $('#image').attr('src', apiResponse.poster).on('load', function() {
            buildMovieMetadata(apiResponse, $(this))
        })
    } else {
        buildMovieMetadata(apiResponse)
    }
}

function onBeforeSend() {
    showComponent('#waiting')
    hideComponent('.movie')
    hideNotFound()
    hideError()
}

function onApiError() {
    hideComponent('#waiting')
    showError()
}

function buildMovieMetadata(apiResponse, image) {
    hideComponent('#waiting')
    handleImage(image)
    handleLiterals(apiResponse)
    showComponent('.movie')
}

function handleImage(image) {
    image ? $('#image').replaceWith(image) : $('#image').removeAttr('src')
}

/**
 * Fill the values of the corresponding HTML elements
 * using the API Response.
 * @param {*} apiResponse 
 */
function handleLiterals(apiResponse) {
    $('.movie').find('[id]').each((index, item) => {
        if ($(item).is('a')) {
            $(item).attr('href', apiResponse[item.id])
        } else {
            let valueElement = $(item).children('span')
            let metadataValue = apiResponse[item.id] ? apiResponse[item.id] : '-'
            valueElement.length ? valueElement.text(metadataValue) :$(item).text(metadataValue)
        }
    })
}

function transformResponse(apiResponse) {
    let camelCaseKeysResponse = camelCaseKeys(apiResponse)
    clearNotAvailable(camelCaseKeysResponse)
    buildImdbLink(camelCaseKeysResponse)
    return camelCaseKeysResponse
}

function camelCaseKeys(apiResponse) {
    return _.mapKeys(apiResponse, (v, k) => _.camelCase(k))
}

function clearNotAvailable(apiResponse) {
    for (const key in apiResponse) {
        if (apiResponse.hasOwnProperty(key) && apiResponse[key] === "N/A") {
            apiResponse[key] = ''
        }
    }
}

function buildImdbLink(apiResponse) {
    if (apiResponse.imdbId) {
        apiResponse.imdbId = `https://www.imdb.com/title/${apiResponse.imdbId}`
    }
}

function onShowMoreClicked() {
    $('#plot').toggleClass('expanded')
    if ($('.extended').is(':visible')) {
        $('.extended').hide(1000)
    } else {
        $('.extended').show(1000)
    }
}

function showComponent(jQueryComponent) {
    return $(jQueryComponent).removeClass('hidden')
}

function hideComponent(jQueryComponent) {
    return $(jQueryComponent).addClass('hidden')
}

function showError() {
    $('.error').clone().removeClass('hidden').appendTo($('.center'))
}

function hideError() {
    $('.center').find('.error').remove()
}

function hideNotFound() {
    $('.center').find('.not-found').remove()
}

function showNotFound() {
    $('.not-found').clone().removeClass('hidden').appendTo($('.center'))
}