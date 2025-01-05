function loadPage(page) {
    fetch(`${page}.html`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            // Update the content and title
            document.getElementById('content').innerHTML = data;
            document.getElementById('title').innerHTML = page;

            // Reprocess MathJax
            MathJax.typeset();

            // // Call fetchNumber after loading the new page
            // fetchNumber().then(number => {
            //     if (number) {
            //         console.log("Fundraiser amount raised:", number);
            //
            //         document.getElementsByClassName('fundraiserAmount').forEach(item => {item.innerHTML = "$" + number})
            //     }
            // });

            // Enable bootstrap tooltips
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

            console.log("Finished loading page:", page)
        })
        .catch(error => {
            console.error('Error loading page:', error);
            document.getElementById('content').innerHTML = "An error occured:<br>" + error;
            document.getElementById('title').innerHTML = "error";
        });
}

async function fetchNumber() {
    console.log("Finding fundraiser amount raised...");
    const response = await fetch('https://sites.google.com/winchesterps.org/whsbiologycancerfundraiser/about-our-campaign');

    if (!response.ok) {
        console.error('Network response was not ok:', response.statusText);
        return;
    }

    const text = await response.text();
    console.log(text);
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    // Select the span element with the specific class
    const numberElement = doc.querySelector('.afVDVd.C9DxTc');

    if (numberElement) {
        return numberElement.textContent;
    } else {
        console.log('Number not found');
    }
}

// Load the home page by default when the document is ready
document.addEventListener('DOMContentLoaded', () => loadPage('home'));

// Example of how to trigger loading a new page (e.g., from a link)
document.querySelectorAll('a.page-link').forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        const page = this.getAttribute('href'); // Get the href attribute value
        loadPage(page); // Load the new page
    });
});

window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
};
