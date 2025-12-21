const carousel = document.querySelector('.carousel');
const arrowIcons = document.querySelectorAll('.gallery-wrapper i'); 

const scrollCarousel = (direction) => {
    const images = carousel.querySelectorAll('img');
    const scrollLeft = carousel.scrollLeft;
    let targetScroll = scrollLeft;

    if (direction === "left") {
        // Find the first image whose left edge is >= scrollLeft (approx)
        for (let i = 0; i < images.length; i++) {
            const img = images[i];
            if (img.offsetLeft >= scrollLeft - 5) { 
                if (i > 0) {
                    targetScroll = images[i - 1].offsetLeft;
                } else {
                    // Loop to end
                    targetScroll = carousel.scrollWidth - carousel.clientWidth;
                }
                break;
            }
        }
    } else { // right
        const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
        // Check if we are at the end (or very close)
        if (scrollLeft >= maxScrollLeft - 5) {
            targetScroll = 0;
        } else {
            // Find the first image that starts *after* the current scroll position
            let found = false;
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (img.offsetLeft > scrollLeft + 5) {
                    targetScroll = img.offsetLeft;
                    found = true;
                    break;
                }
            }
            if (!found) {
                targetScroll = 0;
            }
        }
    }
    
    carousel.scrollTo({
        left: targetScroll,
        behavior: "smooth"
    });
};

arrowIcons.forEach(icon => { 
    icon.addEventListener("click", () => {
        scrollCarousel(icon.id === "left" ? "left" : "right");
        resetAutoScroll();
    });
});

let autoScrollInterval = setInterval(() => {
    scrollCarousel("right");
}, 3000);

const resetAutoScroll = () => {
    clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
        scrollCarousel("right");
    }, 3000);
};

// Pause on hover
carousel.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
carousel.addEventListener('mouseleave', () => resetAutoScroll());
