let currentLang = "ar"; // par défaut arabe
const postsContainer = document.getElementById("postsContainer");

// --- AFFICHER POSTS SUR INDEX.HTML ---
async function displayPosts() {
    if (!postsContainer) return;

    try {
        const res = await fetch("/api/posts");
        const posts = await res.json();

        postsContainer.innerHTML = "";
        posts.forEach(post => {
            const postDiv = document.createElement("div");
            postDiv.className = "post";
            postDiv.innerHTML = `
                ${post.image ? `<img src="${post.image}" class="post-image">` : ""}
                <h3>${post[currentLang].title}</h3>
                <p>${post[currentLang].content}</p>
            `;
            postsContainer.appendChild(postDiv);
        });
    } catch (err) {
        console.error("Erreur fetch posts:", err);
    }
}

// --- CHANGEMENT DE LANGUE ---
function changeLang(lang) {
    currentLang = lang;
    displayPosts();
    document.body.style.direction = lang === "ar" ? "rtl" : "ltr";
}

// --- MODE NUIT ---
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

// --- AUTHOR.HTML : SUBMIT POST ---
async function submitPost() {
    const imageFile = document.getElementById("imageFile").files[0];

    // Lire l'image en base64
    let imageBase64 = "";
    if (imageFile) {
        imageBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = err => reject(err);
            reader.readAsDataURL(imageFile);
        });
    }

    const data = {
        imageBase64,
        fr: { 
            title: document.getElementById("title_fr").value, 
            content: document.getElementById("content_fr").value 
        },
        en: { 
            title: document.getElementById("title_en").value, 
            content: document.getElementById("content_en").value 
        },
        ar: { 
            title: document.getElementById("title_ar").value, 
            content: document.getElementById("content_ar").value 
        }
    };

    try {
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (res.ok) {
            alert("Annonce enregistrée avec succès ✅");
            document.getElementById("postForm").reset();
            displayPosts();
        } else {
            alert(result.message || "Erreur serveur ❌");
        }
    } catch (err) {
        console.error(err);
        alert("Erreur serveur ❌");
    }
}
 
// --- INIT --- 
displayPosts();