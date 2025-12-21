document.addEventListener("DOMContentLoaded", () => {
    fetch('galleryData.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('dynamicGalleryContainer');
            
            // Update sidebars (desktop and mobile)
            updateSidebars(data);
            
            data.forEach(category => {
                // 1. Anchor for navigation
                const anchor = document.createElement('p');
                anchor.id = category.id;
                anchor.style.cssText = "visibility: hidden; height: 0; margin: 0; overflow: hidden;";
                container.appendChild(anchor);

                // 2. Main category title (e.g. Events)
                const h2 = document.createElement('h2');
                h2.textContent = category.title;
                container.appendChild(h2);

                // 3. Subcategories
                category.subsections.forEach(sub => {
                    // Subcategory title (e.g. AMTS 25)
                    const h3 = document.createElement('h3');
                    h3.textContent = sub.title;
                    h3.onclick = () => openFullscreenMenu(); // Keep the function
                    container.appendChild(h3);

                    // Subcategory anchor
                    const subAnchor = document.createElement('p');
                    subAnchor.id = sub.id;
                    subAnchor.style.cssText = "visibility: hidden; height: 0; overflow: hidden;";
                    container.appendChild(subAnchor);

                    // Images container
                    const tilesDiv = document.createElement('div');
                    tilesDiv.className = 'galleryTiles';
                    
                    // Create 3 columns for Masonry layout
                    const columns = [];
                    for (let i = 0; i < 3; i++) {
                        const col = document.createElement('div');
                        col.className = 'galleryRow';
                        tilesDiv.appendChild(col);
                        columns.push(col);
                    }

                    sub.images.forEach((imgSrc, index) => {
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.loading = "lazy";
                        img.className = "skeleton";
                        
                        img.onload = function() { this.classList.remove('skeleton'); };
                        
                        // Distribute images among the 3 columns (0, 1, 2, 0, 1, 2...)
                        const columnIndex = index % 3;
                        columns[columnIndex].appendChild(img);
                    });

                    container.appendChild(tilesDiv);
                });
            });
        })
        .catch(error => console.error('Error loading gallery:', error));
});

function updateSidebars(data) {
    // Find all sidebar lists (desktop and mobile)
    const sidebars = document.querySelectorAll('.sidebarList');
    
    sidebars.forEach(sidebar => {
        sidebar.innerHTML = ''; // Clear static content

        data.forEach(category => {
            const li = document.createElement('li');
            
            // Main category link
            const a = document.createElement('a');
            a.href = `#${category.id}`;
            a.className = 'sidebarLink';
            a.textContent = category.title;
            // Close mobile menu on click
            a.onclick = function() { if(typeof navigateAndClose === 'function') navigateAndClose(this); };
            li.appendChild(a);

            // List of subcategories
            if (category.subsections && category.subsections.length > 0) {
                const ul = document.createElement('ul');
                
                category.subsections.forEach(sub => {
                    const subLi = document.createElement('li');
                    const subA = document.createElement('a');
                    subA.href = `#${sub.id}`;
                    subA.className = 'sidebarSubLink';
                    subA.textContent = sub.title;
                    subA.onclick = function() { if(typeof navigateAndClose === 'function') navigateAndClose(this); };
                    
                    subLi.appendChild(subA);
                    ul.appendChild(subLi);
                });
                
                li.appendChild(ul);
            }
            
            sidebar.appendChild(li);
        });
    });
}