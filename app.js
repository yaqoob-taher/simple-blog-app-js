const API_URL = "http://localhost:3000/blogs";

// DOM Elements (Document object model)
const blogContainer = document.getElementById("blog-container");
const blogForm = document.getElementById("new-blog-form");
const titleInput = document.getElementById("blog-title");
const descInput = document.getElementById("blog-desc");

const titleError = document.getElementById("title-error");
const descError = document.getElementById("desc-error");

// Step 4a: Fetch and Render Blogs from db.json 
//Gets blogs from server and displays them on page
//Server → fetch() → response → JSON → JavaScript array → renderBlogs()
async function fetchBlogs() {
    try {
        // wait for server response 
        // fetch(API_URL) -> Sends HTTP request to server.
        // await -> WAIT until server responds
        // const response -> stores server response object.

        const response = await fetch(API_URL);

        // response.json() -> Server sends JSON text
        //.json() converts it into REAL JavaScript array:
        // await -> wait until json converts into JavaScript object
        // Store final JavaScript array in variable:blogs 

        const blogs = await response.json();

        // we send blogs array to another function.
        //Take blogs array and display cards in HTML.
        //Then renderBlogs() creates cards dynamically.

        renderBlogs(blogs);

    }
    //Runs ONLY if error happens inside try blo 
    catch (error) {
        // Prints error in console.
        /*
        | console.error() | error message "Prints critical failure messages." |
        Errors usually appear RED in console.
        */
        console.error("Error fetching data from server:", error);
        //Changes HTML content inside container.
        blogContainer.innerHTML = `<p style="color:red; text-align:center;">Failed to load system blogs.</p>`;
    }
}

/* Takes blogs array and displays blog cards inside HTML
   
*/
function renderBlogs(blogs) {
    //Clears all old HTML inside container.
    blogContainer.innerHTML = ""; // Clear existing elements
    // cheack if empty 
    if(blogs.length === 0) {
        blogContainer.innerHTML = `<p style="color:#7f8c8d; text-align:center; width:100%;">No blogs found. Add one below!</p>`;
        /*STOP function here 
        Because if no blogs exist:
        There’s no reason to continue loop.
        */
        return;
    }
// Loop through every blog object.
    blogs.forEach(blog => {

        // flow : create empty div element and adds CSS class named card
        // Then CSS automatically styles it.
        //Creates NEW HTML element using JavaScript.
        const card = document.createElement("div");
        /*Add CSS class "card" to the element
        card This variable contains HTML element created earlier:
        classList -> classList is a JavaScript property used to manage CSS classes.
        It can:add classes, remove classes, toggle classes
        like this in html <div class="card"></div>
        */
        card.classList.add("card");
        /*
        This is called:
        Dynamic Rendering
        Instead of writing HTML manually, JavaScript generates it automatically from data.
        
        This code builds the HTML content INSIDE the card dynamically.
        card.innerHTML -> Insert HTML inside this element
        Template Literals -> `` -> multi-line HTML, variable insertion
        <div class="card-image">
            <i class="far fa-image"></i>
        </div>
        Shows gray image icon.

        <div class="card-content">
        Container for: title, description, delete button 
        
        Creates trash/delete icon. 
        <i class="fas fa-trash-alt delete-btn"></i>
        data-id="${blog.id}" -> Custom HTML attribute
        To store blog ID inside HTML element..So when user clicks delete:
        JavaScript knows WHICH blog to delete.
        ${} -> Insert JavaScript value here
        become:
        <i class="delete-btn" data-id="5"></i>

        title -> <h3>${escapeHTML(blog.title)}</h3> 
        Creates blog title.
 blog object -> template literal->generate HTML->insert into card->show on page

        */
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
        /* The card exists in JS memory 
            puts the card inside: main 
            card appears on screen 

        */
        blogContainer.appendChild(card);
    });

    // Attach deletion event listeners after creating elements
    /*
    querySelectorAll -> Find ALL elements matching selector.
    Loop through every delete button.
    addEventListener() -> Listen for an event
    "click" -> when user click button, run this code 
    e -> event object
    .target -> The exact element user clicked
    getAttribute() -> Gets attribute value from HTML element.
    "data-id" -> custom HTML attribute stores extra information inside an HTML element.
    */
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            //Which blog user wants to delete
            const id = e.target.getAttribute("data-id");
            // call delete function 
            deleteBlog(id);
        });
    });
}

// Step 4b: Delete blog item from backend and update view
/*
This function Deletes a blog from db.json using json-server
User clicks delete ->Get blog id -> Send DELETE request
-> Remove blog from db.json->Reload blogs 

function receives blog id 
why use confirm() -> to prevent accidental deletion 
deleting something by mistake 
confirm() -> Built-in function shows pop-up message.
browser shows [ OK ]   [ Cancel ]
ok -> true -> continue deletion 
Cancel -> false ->Stop function 
Template Literal builds URL dynamically.
we want to delete specific blog.

*/
async function deleteBlog(id) {
    if (confirm("Are you sure you want to delete this blog post?")) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });// to delete specific item(id)
            // Re-fetch clean list state
            fetchBlogs();
            //Reload updated blogs from server.
            // page must refresh automatically
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    }
}

// Step 4: Regex Field Form Validations and Submissions
blogForm.addEventListener("submit", async (e) => {
    //Stop the default behavior of the event
    /*
    For a form submit, the default behavior is:
        1. Send form data
        2. Reload the page
    stops the browser from doing its normal action
    */
    e.preventDefault();

    
    // Reset error alerts
    //  Removes previous error messages from the screen.
    //  when user tries again, old errors don’t stay visible.
    titleError.textContent = "";
    descError.textContent = "";
    // titleInput.value → text user typed
    // trim() → removes spaces at start/end
    const titleVal = titleInput.value.trim();
    const descVal = descInput.value.trim();
    //assume form is valid at first.
    let isValid = true;

    /* Title Validation Rules:
      - Only English letters and spaces: ^[a-zA-Z ]+$
      - First letter must be Capitalized: ^[A-Z]
      - Character length under 50 characters
        ^ Start of the string
        [a-zA-Z ] small letters	capital letters	space character
        + One or more characters -> text must NOT be empty
        $ -> End of string
      */

    const titleRegex = /^[a-zA-Z ]+$/;
    //Check if title is empty
    if (!titleVal) {
        titleError.textContent = "Title is required.";
        isValid = false;
    } else if (titleVal.length >= 50) {
        titleError.textContent = "Title must be less than 50 characters.";
        isValid = false;
    } else if (!/^[A-Z]/.test(titleVal)) {
        titleError.textContent = "The first letter of the title must be capitalized.";
        isValid = false;
        //Only English letters and spaces
    } else if (!titleRegex.test(titleVal)) {
        titleError.textContent = "Only English characters and spaces are allowed.";
        isValid = false;
    }

    /* Description Validation Rules:
      - Only English letters and spaces: ^[a-zA-Z ]+$
      - Character length under 1000 characters
    */
    const descRegex = /^[a-zA-Z ]+$/;
    if (!descVal) {
        descError.textContent = "Description is required.";
        isValid = false;
    } else if (descVal.length >= 1000) {
        descError.textContent = "Description must be less than 1000 characters.";
        isValid = false;
    } else if (!descRegex.test(descVal)) {
        descError.textContent = "Only English characters and spaces are allowed (No special symbols or punctuation).";
        isValid = false;
    }

    // Stop post routine if validation parameters fail
    if (!isValid) return;

    // Send verified data bundle payload to local database environment
    const newBlog = {
        title: titleVal,
        description: descVal
    };

    try {
        // send data to the server (send request to server)
        // method: "POST" Add new data to server
        // “ tell server I am sending JSON data”
        //Convert JavaScript object → JSON format
        //Wait until server finishes saving data
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newBlog)
        });

        // Reset form inputs & update dynamic content container feed
        blogForm.reset();//Clear form inputs after success.
        //refresh blogs Get updated blogs from server and show them again.
        fetchBlogs();
    } catch (error) {
        console.error("Error creating blog post submission entry:", error);
    }
});

// Initial Boot Run 
fetchBlogs();
