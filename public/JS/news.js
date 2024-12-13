let newsPage=1;

export async function openNews() {
    document.getElementById('searched-posts').style.display = 'none';
    closeSection();
    document.getElementById('news').style.display = 'block';
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading');
    loadingSpinner.innerText = 'Loading the latest news...';
    newsContainer.appendChild(loadingSpinner);
  
    try {
        const response = await fetch(`http://localhost:8000/M00980001/news/${newsPage}`);
        const news = await response.json();
        newsContainer.innerHTML = '';
      
        news.forEach(article => {
            const newsElement = document.createElement('div');
            newsElement.classList.add('news-article');

            newsElement.innerHTML = ` 
                <div class="news-left">
                    <img src="${article.img || './images/default-photo.jpg'}">
                </div>
                <div class="news-right">
                    <a href="${article.link}"class="news-title" target="_blank">${article.title}</a>
                    <hr>
                    <p class="newsContent">${article.content}</p>
                </div>
            `;

            newsContainer.appendChild(newsElement);
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        
        newsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

window.openNews=openNews;

document.querySelector('.next-news').addEventListener('click', function() {
    newsPage++
    openNews();
    window.scrollTo(0, 0)
   });
   
  document.querySelector('.previous-news').addEventListener('click', function() {
     if (newsPage!=1){
       newsPage--
       openNews();
     }
     window.scrollTo(0, 0)
  });