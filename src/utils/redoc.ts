export function getRedocHTML(openApiUrl: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>Keli API Documentation</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
      .api-audience-filter {
        position: fixed;
        top: 0;
        right: 20px;
        z-index: 100;
        background: #fff;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 10px 15px;
        display: flex;
        gap: 10px;
        align-items: center;
        font-family: 'Montserrat', sans-serif;
      }
      .api-audience-filter label {
        font-weight: bold;
        margin-right: 10px;
      }
      .filter-button {
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 5px 10px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      .filter-button.active {
        background: #2d8bef;
        color: white;
        border-color: #2d8bef;
      }
      .api-info {
        margin-bottom: 15px;
      }
    </style>
  </head>
  <body>
    <div class="api-audience-filter">
      <label>View:</label>
      <button class="filter-button active" onclick="filterApiByTag('all')">All</button>
      <button class="filter-button" onclick="filterApiByTag('admin')">Admin</button>
      <button class="filter-button" onclick="filterApiByTag('customer')">Customer</button>
      <button class="filter-button" onclick="filterApiByTag('pos')">POS</button>
    </div>
    <redoc spec-url="${openApiUrl}"></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
      function filterApiByTag(tag) {
        // Update active button
        document.querySelectorAll('.filter-button').forEach(btn => {
          btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Apply filtering logic
        if (tag === 'all') {
          // Show all tags
          document.querySelectorAll('[data-section-id]').forEach(section => {
            section.style.display = '';
          });
        } else if (tag === 'admin') {
          // Show admin endpoints
          document.querySelectorAll('[data-section-id]').forEach(section => {
            if (section.textContent.includes('Admin')) {
              section.style.display = '';
            } else if (!section.textContent.includes('Customer') && !section.textContent.includes('POS')) {
              section.style.display = '';
            } else {
              section.style.display = 'none';
            }
          });
        } else if (tag === 'customer') {
          // Show customer endpoints
          document.querySelectorAll('[data-section-id]').forEach(section => {
            if (section.textContent.includes('Customer')) {
              section.style.display = '';
            } else if (!section.textContent.includes('Admin') && !section.textContent.includes('POS')) {
              section.style.display = '';
            } else {
              section.style.display = 'none';
            }
          });
        } else if (tag === 'pos') {
          // Show POS endpoints
          document.querySelectorAll('[data-section-id]').forEach(section => {
            if (section.textContent.includes('POS')) {
              section.style.display = '';
            } else if (!section.textContent.includes('Admin') && !section.textContent.includes('Customer')) {
              section.style.display = '';
            } else {
              section.style.display = 'none';
            }
          });
        }
      }
      
      // Apply initial filtering after Redoc is fully loaded
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
          // Redoc might need extra time to render
          filterApiByTag('all');
        }, 1000);
      });
    </script>
  </body>
</html>
`;
}
