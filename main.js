const input = document.querySelector('#input-field');
const addBtn = document.querySelector('.addbtn');
const main = document.querySelector('#main');
const message = document.querySelector('.message');

// Get saved subreddits from localStorage
let savedSubreddits = JSON.parse(localStorage.getItem('subreddits') || '[]');


//create a function which creates cards
function createCard(post, container) {
    const card = document.createElement('div');
    card.className = 'card';
    container.appendChild(card);

    // optional image
    if (post.data.preview && post.data.preview.images.length > 0) {
        const imgUrl = post.data.preview.images[0].source.url.replace(/&amp;/g, '&');
        const img = document.createElement('img');
        img.src = imgUrl;
        img.className = 'postThumbnail';
        card.appendChild(img);
    }

    const postMeta = document.createElement('div');
    postMeta.className = 'postMeta';
    postMeta.textContent = `by ${post.data.author} · ${post.data.ups} points`;
    card.appendChild(postMeta);

    const postTitle = document.createElement('h3');
    postTitle.className = 'postTitle';


    // link to the post
    const postLink = document.createElement('a');
    postLink.href = `https://reddit.com${post.data.permalink}`;
    postLink.target = "_blank";
    postLink.rel = "noopener noreferrer";
    postLink.textContent = post.data.title;
    postTitle.appendChild(postLink);

    card.appendChild(postTitle);


};

function createLane(subreddit) {
    const lane = document.createElement('section');
    lane.className = "lane";
    main.appendChild(lane);

    const subredditTitle = document.createElement('h2');
    subredditTitle.className = "subredditTitle";
    subredditTitle.textContent = `r/${subreddit}`;
    lane.appendChild(subredditTitle);

    const subredditContainer = document.createElement('div');
    subredditContainer.className = "subredditContainer";
    lane.appendChild(subredditContainer);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✖';
    removeBtn.className = 'removeLane';
    removeBtn.style.float = 'right';
    removeBtn.style.cursor = 'pointer';
    removeBtn.addEventListener('click', () => {
        lane.remove();
        savedSubreddits = savedSubreddits.filter(s => s !== subreddit);
        localStorage.setItem('subreddits', JSON.stringify(savedSubreddits));
    });
    lane.appendChild(removeBtn);

    return subredditContainer; // return the container so we can add posts
}


async function fetchFunction() {
    try {
        message.textContent = "Loading...";
        const inputValue = input.value.trim();

        if (!inputValue) {
            message.textContent = "Please type a subreddit name";
            return;
        }

        const url = `https://corsproxy.io/?${encodeURIComponent(`https://www.reddit.com/r/${inputValue}.json`)}`;
        const response = await fetch(url);

        if (!response.ok) {
            message.textContent = "Subreddit not found";
            return;
        }

        const data = await response.json();
        const posts = data?.data?.children;
        if (!posts || posts.length === 0) {
            message.textContent = "Nothing found";
            return;
        }

        // Create lane and get container for posts
        const subredditContainer = createLane(inputValue);

        input.value = "";
        message.textContent = "";

        // Add first 10 posts
        const firstTen = posts.slice(0, 10);
        firstTen.forEach(post => createCard(post, subredditContainer));

        // Load more button if needed
        if (posts.length > 10) {
            const lane = subredditContainer.parentElement; // get the lane to append button
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.textContent = "Load more";
            lane.appendChild(loadMoreBtn);

            loadMoreBtn.addEventListener('click', () => {
                const remaining = posts.slice(10);
                remaining.forEach(post => createCard(post, subredditContainer));
                loadMoreBtn.remove();
            });
        }

        // Save subreddit
        if (!savedSubreddits.includes(inputValue)) { // prevent duplicates
            savedSubreddits.push(inputValue);
            localStorage.setItem('subreddits', JSON.stringify(savedSubreddits));
        }

    } catch (err) {
        console.error('Fetch error:', err);
        message.textContent = "Error fetching subreddit";
    }
}




addBtn.addEventListener('click', () => {
    //call the fetch function
    fetchFunction();

});
window.addEventListener('DOMContentLoaded', () => {
    savedSubreddits.forEach(subreddit => fetchSubredditOnLoad(subreddit));
});

async function fetchSubredditOnLoad(subreddit) {
    try {
        const url = `https://corsproxy.io/?${encodeURIComponent(`https://www.reddit.com/r/${subreddit}.json`)}`;
        const response = await fetch(url);
        if (!response.ok) return;

        const data = await response.json();
        const posts = data?.data?.children;
        if (!posts || posts.length === 0) return;

        const subredditContainer = createLane(subreddit);

        const firstTen = posts.slice(0, 10);
        firstTen.forEach(post => createCard(post, subredditContainer));

        // Load more if needed
        if (posts.length > 10) {
            const lane = subredditContainer.parentElement;
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.textContent = "Load more";
            lane.appendChild(loadMoreBtn);

            loadMoreBtn.addEventListener('click', () => {
                const remaining = posts.slice(10);
                remaining.forEach(post => createCard(post, subredditContainer));
                loadMoreBtn.remove();
            });
        }

    } catch (err) {
        console.error(err);
    }
}



