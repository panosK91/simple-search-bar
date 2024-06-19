import { fromEvent } from 'rxjs';
import { map, debounceTime, filter, switchMap } from 'rxjs/operators';

import './styles.css';
import jsonData from './articles.json'

const searchBox = document.getElementById('searchBox') as HTMLInputElement;
const articleList = document.getElementById('articleList');

fromEvent(searchBox, 'input')
    .pipe(
        map(event => (event.target as HTMLInputElement).value.trim()),  // Trim whitespace
        debounceTime(750),
        switchMap(searchText => {
            if (searchText.length === 0) {
                displayArticles([], false);  // Clear the display if search is empty
                return [];
            }
            return fetchArticles(searchText);
        }),
    )
    .subscribe(filteredArticles => {
        displayArticles(filteredArticles, true);
    });

    function fetchArticles(searchText: string) {
        searchText = searchText.toLowerCase(); // Normalize the search text to lowercase once

        return Promise.resolve(jsonData.data.filter(article => {
            // Check if the title or body contains the searchText
            const titleMatch = article.attributes.title.toLowerCase().includes(searchText);
            const bodyMatch = article.attributes.body.toLowerCase().includes(searchText);
    
            // Check if any tag matches the searchText
            const tagsMatch = article.attributes.tags.some(tag => tag.toLowerCase().includes(searchText));
    
            // Find the author's name and check it against searchText
            const author = jsonData.included.find(person => person.id === article.relationships.author.data.id);
            const authorMatch = author && author.attributes.name.toLowerCase().includes(searchText);
    
            return titleMatch || bodyMatch || tagsMatch || authorMatch; // Return true if any condition is met
        }));
    }
    
    function displayArticles(articles: any[], showNoResultsMessage: boolean = true) {

        if (!articleList) {
            console.error('articleList element not found');
            return;
        }
    
        articleList.innerHTML = ''; // Clear existing articles
    
        if (articles.length === 0 && showNoResultsMessage) {
            const noResultMsg = document.createElement('p');
            noResultMsg.textContent = 'No articles found matching your search.';
            articleList.appendChild(noResultMsg);
        } else {
            articles.forEach(article => {
                const articleElem = document.createElement('article');
                const author = jsonData.included.find(person => person.id === article.relationships.author.data.id)?.attributes;
                const tags = article.attributes.tags.join(', ');
                articleElem.innerHTML = `
                    <h2>Title: ${article.attributes.title}</h2>
                    <p>${article.attributes.body}</p>
                    <p><strong>Tags:</strong> ${tags}</p>
                    <p><strong>Created:</strong> ${new Date(article.attributes.created).toLocaleDateString()}</p>
                    <p><strong>Updated:</strong> ${new Date(article.attributes.updated).toLocaleDateString()}</p>
                    <p><strong>Author:</strong> ${author?.name ?? 'Unknown'}, ${author?.age ?? 'Unknown'} years old, ${author?.gender ?? 'Unknown'}</p>
                `;
                articleList.appendChild(articleElem);
            });
        }
    }
    
