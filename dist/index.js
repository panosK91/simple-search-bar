import { fromEvent } from 'rxjs';
import { map, debounceTime, switchMap } from 'rxjs/operators';
import './styles.css';
import jsonData from './articles.json';
var searchBox = document.getElementById('searchBox');
var articleList = document.getElementById('articleList');
fromEvent(searchBox, 'input')
    .pipe(map(function (event) { return event.target.value.trim(); }), // Trim whitespace
debounceTime(750), switchMap(function (searchText) {
    if (searchText.length === 0) {
        displayArticles([], false); // Clear the display if search is empty
        return [];
    }
    return fetchArticles(searchText);
}))
    .subscribe(function (filteredArticles) {
    displayArticles(filteredArticles, true);
});
function fetchArticles(searchText) {
    searchText = searchText.toLowerCase(); // Normalize the search text to lowercase once
    return Promise.resolve(jsonData.data.filter(function (article) {
        // Check if the title or body contains the searchText
        var titleMatch = article.attributes.title.toLowerCase().includes(searchText);
        var bodyMatch = article.attributes.body.toLowerCase().includes(searchText);
        // Check if any tag matches the searchText
        var tagsMatch = article.attributes.tags.some(function (tag) { return tag.toLowerCase().includes(searchText); });
        // Find the author's name and check it against searchText
        var author = jsonData.included.find(function (person) { return person.id === article.relationships.author.data.id; });
        var authorMatch = author && author.attributes.name.toLowerCase().includes(searchText);
        return titleMatch || bodyMatch || tagsMatch || authorMatch; // Return true if any condition is met
    }));
}
function displayArticles(articles, showNoResultsMessage) {
    if (showNoResultsMessage === void 0) { showNoResultsMessage = true; }
    if (!articleList) {
        console.error('articleList element not found');
        return;
    }
    articleList.innerHTML = ''; // Clear existing articles
    if (articles.length === 0 && showNoResultsMessage) {
        var noResultMsg = document.createElement('p');
        noResultMsg.textContent = 'No articles found matching your search.';
        articleList.appendChild(noResultMsg);
    }
    else {
        articles.forEach(function (article) {
            var _a, _b, _c, _d;
            var articleElem = document.createElement('article');
            var author = (_a = jsonData.included.find(function (person) { return person.id === article.relationships.author.data.id; })) === null || _a === void 0 ? void 0 : _a.attributes;
            var tags = article.attributes.tags.join(', ');
            articleElem.innerHTML = "\n                    <h2>Title: ".concat(article.attributes.title, "</h2>\n                    <p>").concat(article.attributes.body, "</p>\n                    <p><strong>Tags:</strong> ").concat(tags, "</p>\n                    <p><strong>Created:</strong> ").concat(new Date(article.attributes.created).toLocaleDateString(), "</p>\n                    <p><strong>Updated:</strong> ").concat(new Date(article.attributes.updated).toLocaleDateString(), "</p>\n                    <p><strong>Author:</strong> ").concat((_b = author === null || author === void 0 ? void 0 : author.name) !== null && _b !== void 0 ? _b : 'Unknown', ", ").concat((_c = author === null || author === void 0 ? void 0 : author.age) !== null && _c !== void 0 ? _c : 'Unknown', " years old, ").concat((_d = author === null || author === void 0 ? void 0 : author.gender) !== null && _d !== void 0 ? _d : 'Unknown', "</p>\n                ");
            articleList.appendChild(articleElem);
        });
    }
}
