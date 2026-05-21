const API_URL = "http://localhost:3000/blogs";

// DOM Elements: Selecting elements from the HTML page
const blogContainer = document.getElementById("blog-container");
const blogForm = document.getElementById("new-blog-form");
const titleInput = document.getElementById("blog-title");
const descInput = document.getElementById("blog-desc");
const titleError = document.getElementById("title-error");
const descError = document.getElementById("desc-error");

// Step 1: Get Blogs from the server and show them on the screen 
async function fetchBlogs() {
    try {
        // Send request to the local server and wait for response
        const response = await fetch(API_URL);
        // Convert the incoming data text into a real JavaScript array
        const blogs = await response.json();
        // Send the array to the display function
        renderBlogs(blogs);
    } catch (error) {
        console.error("Error fetching data from server:", error);
        // Show a red warning on the screen if the server is off
        blogContainer.innerHTML = `<p style="color:red; text-align:center;">Failed to load system blogs.</p>`;
    }
}
function renderBlogs(blogs) {
    // Clear old layout cards before adding updated ones
    blogContainer.innerHTML = ""; 
    // If there are no blogs in db.json, show an empty state message
    if (blogs.length === 0) {
        blogContainer.innerHTML = `<p style="color:#7f8c8d; text-align:center; width:100%;">No blogs found. Add one below!</p>`;
        return;
    }
    // Loop over each blog object to build dynamic HTML cards
    blogs.forEach(blog => {
        const card = document.createElement("div");
        card.classList.add("card");
        
        card.innerHTML = `
            <div class="card-image">
                <i class="far fa-image"></i>
            </div>
            <div class="card-content">
                <i class="fas fa-trash-alt delete-btn" data-id="${blog.id}"></i>
                <h3>${blog.title}</h3>
                <p>${blog.description}</p>
            </div>
        `;
        blogContainer.appendChild(card);
    });
    // Find all trash buttons and attach a click listener to delete
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const id = e.target.getAttribute("data-id");
            deleteBlog(id);
        });
    });
}
// Step 2: Delete a blog item
async function deleteBlog(id) {
    // Show a popup confirmation box to prevent accidental clicks
    if (confirm("Are you sure you want to delete this blog post?")) {
        try {
            // Send standard HTTP DELETE request for this specific blog ID
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            // Refresh the list immediately from the database
            fetchBlogs(); 
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }
}

//Step 3: Single Function Live Form Validation (Using simple If/Else)


// Regex rules to look for specific language and character types
const REGEX_ARABIC = /[\u0600-\u06FF]/; // Catches Arabic alphabet text
const REGEX_CAPITAL = /^[A-Z]/;        // Checks if index 0 is an uppercase letter
// Catches actual special symbols like $ or @ without blocking spaces
const REGEX_SPECIAL = /[\$@#!%\^&\*\(\)_\+\-=\{\}\[\]:;"'<>\,\.\?\/~`|\\\u00A0-\u00BF\u2000-\u206F]/; 

function validateField(inputElement) {
    const value = inputElement.value;         // Raw value typed by user (important for spaces/capital checks)
    const trimmedValue = value.trim();        // Clean value without extra side spaces (important for lengths)
    let errorMessage = "";

    // CHECKING THE TITLE FIELD 
    if (inputElement === titleInput) {
        
        if (trimmedValue.length === 0) {
            errorMessage = "Title is required.";
        } 
        else if (trimmedValue.length >= 50) {
            errorMessage = "Title must be less than 50 characters.";
        } 
        else if (REGEX_ARABIC.test(value)) {
            // Checks for Arabic characters first so it won't conflict with special characters
            errorMessage = "Only English letters are allowed. Arabic is not supported.";
        } 
        else if (REGEX_SPECIAL.test(value)) {
            // Checks if user types code symbols like $
            errorMessage = "Special characters are not allowed.";
        } 
        else if (/\d/.test(value)) {
            // Checks if user types numeric numbers
            errorMessage = "Numbers are not allowed in the title.";
        } 
        else if (!REGEX_CAPITAL.test(value)) {
            // Ensures the text starts with an upper case English letter
            errorMessage = "The first letter of the title must be capitalized.";
        }

        // Print the custom warning string dynamically into the title error space
        titleError.textContent = errorMessage;
    } 
    // CHECKING THE DESCRIPTION FIELD 
    else if (inputElement === descInput) {
        
        if (trimmedValue.length === 0) {
            errorMessage = "Description is required.";
        } 
        else if (trimmedValue.length >= 1000) {
            errorMessage = "Description must be less than 1000 characters.";
        } 
        else if (REGEX_ARABIC.test(value)) {
            // Catches Arabic letters inside the description box
            errorMessage = "Description must be written in English only.";
        } 
        else if (REGEX_SPECIAL.test(value)) {
            // Catches symbols like $ inside the description box
            errorMessage = "Special characters are not allowed in description.";
        }

        // Print the custom warning string dynamically into the description error space
        descError.textContent = errorMessage;
    }

    // Returns true if there is no error text (field is perfectly valid)
    return errorMessage === "";
}

// Listen to the input event live so the function triggers on every single keystroke!
titleInput.addEventListener("input", () => validateField(titleInput));
descInput.addEventListener("input", () => validateField(descInput));


//Step 4: Form Submission Handling

blogForm.addEventListener("submit", async (e) => {
    // Prevent default browser refreshing action when hitting submit
    e.preventDefault();

    // Re-verify both fields one last time at submit for security
    const isTitleValid = validateField(titleInput);
    const isDescValid = validateField(descInput);

    // Cancel submission if either input fails its validation conditions
    if (!isTitleValid || !isDescValid) return;

    // Create a clean payload object to send to backend server database
    const newBlog = {
        title: titleInput.value.trim(),
        description: descInput.value.trim()
    };

    try {
        // Send a standard POST request with data formatted into JSON text strings
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBlog)
        });

        blogForm.reset(); // Empty form entry values upon success
        fetchBlogs();     // Refresh the list cards feed layout automatically
    } catch (error) {
        console.error("Error creating blog post:", error);
    }
});

// Run the application initial boot setup routine
fetchBlogs();
