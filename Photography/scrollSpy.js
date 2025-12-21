function initScrollSpy() {
  const sections = document.querySelectorAll('p[id]');
  // Only target sidebar links for gallery navigation
  const sidebarLinks = document.querySelectorAll('.sidebarList a');

  function onScroll() {
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 150) {
        currentSection = section.getAttribute('id');
      }
    });

    // Remove active class from all links first
    sidebarLinks.forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to current section link and its parent if applicable
    if (currentSection) {
        const activeLinks = document.querySelectorAll(`.sidebarList a[href="#${currentSection}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
            
            // If it's a sublink, also highlight the parent main link
            if (link.classList.contains('sidebarSubLink')) {
                const parentUl = link.closest('ul');
                if (parentUl) {
                    const parentLi = parentUl.parentElement;
                    if (parentLi) {
                        const parentLink = parentLi.querySelector('.sidebarLink');
                        if (parentLink) {
                            parentLink.classList.add('active');
                        }
                    }
                }
            }
        });
    }
  }

  window.addEventListener('scroll', onScroll);
  onScroll(); // initial check
}

document.addEventListener('DOMContentLoaded', () => {
    // Optional: call it if there are static elements, 
    // but for dynamic content, call initScrollSpy() after loading.
});
