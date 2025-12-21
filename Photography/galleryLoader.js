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

                    // Column heights tracker (normalized by width)
                    // Initialize all columns to 0 for even distribution
                    const colHeights = [0, 0, 0]; 

                    sub.images.forEach((imgData) => {
                        const img = document.createElement('img');
                        // Handle both old (string) and new (object) JSON format for backward compatibility
                        const src = typeof imgData === 'string' ? imgData : imgData.src;
                        const aspectRatio = (typeof imgData === 'object' && imgData.aspect_ratio) ? imgData.aspect_ratio : 1.5; // Default to 3:2 if missing

                        img.src = src;
                        img.loading = "lazy";
                        img.className = "skeleton";
                        
                        img.onload = function() { this.classList.remove('skeleton'); };
                        
                        // Find the shortest column
                        let minColIndex = 0;
                        for (let i = 1; i < 3; i++) {
                            if (colHeights[i] < colHeights[minColIndex]) {
                                minColIndex = i;
                            }
                        }

                        // Add image to the shortest column
                        columns[minColIndex].appendChild(img);

                        // Update column height
                        // Height added is proportional to 1/aspect_ratio (since width is constant)
                        colHeights[minColIndex] += (1 / aspectRatio);
                    });

                    container.appendChild(tilesDiv);
                });
            });

            // Initialize ScrollSpy after content is loaded
            if (typeof initScrollSpy === 'function') {
                initScrollSpy();
            }
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