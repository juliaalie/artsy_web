document.addEventListener("DOMContentLoaded", () => {
	console.log("main.js running...");
	if (document.getElementById("searchForm")) {
		indexPage();
	} 
	else if (document.getElementById("loginForm")) {
		loginPage();
	} 
	else if (document.getElementById("registerForm")) {
		registerPage();
	}
});

//handling index.html
function indexPage() {
	const searchForm = document.getElementById("searchForm");
	const searchIcon = document.getElementById("searchIcon");
	const searchInput = document.getElementById("searchInput");
	const clearIcon = document.getElementById("clearIcon");
	const resultsContainer = document.getElementById("resultsContainer");
	const artistDetails = document.getElementById("artistDetails");
	const loading = document.getElementById("loading");
	const noResultsMessage = document.getElementById("noResultsMessage");
	
	const loginButton = document.getElementById("loginButton");
	const registerButton = document.getElementById("registerButton");
	const favButton = document.getElementById("favoritesButton");
	const signoutButton = document.getElementById("signoutButton");
	
	//local storage for logging in
	const isLoggedIn = localStorage.getItem("logged-in") === "yes";
	
	//if user is loggein in then adjust buttons
	if(isLoggedIn) {
		loginButton.classList.add("hidden");
	    registerButton.classList.add("hidden");
	    favButton.classList.remove("hidden");
	    signoutButton.classList.remove("hidden");
	}
	
	//sign out button on click
	signoutButton.addEventListener("click", () => {
	    localStorage.removeItem("logged-in");
	    localStorage.removeItem("user-email");
	    window.location.href = "index.html";
	});

	//handle search form submit 
	searchForm.addEventListener("submit", (e) => {
		e.preventDefault();
		//console.log("Search form submitted!");
		const query = searchInput.value.trim();
	    if (query !== "") {
			searchArtists(query);
		}
	});
	
	//when search icon is clicked, submit
	searchIcon.addEventListener("click", () => {
		searchForm.requestSubmit();
	})
	
	//when clear icon is clicked, clear results
	clearIcon.addEventListener("click", () => {
		searchInput.value = "";
		clearResults();
	})
	
	//to clear result on search bar
	function clearResults() {
		resultsContainer.innerHTML = "";
		artistDetails.classList.add("hidden");
		noResultsMessage.classList.add("hidden");
	}
	
	//search artist
	function searchArtists(query) {
		clearResults();
		loading.classList.remove("hidden"); //loading gif
		
		fetch("/juliaali_CSCI201_Assignment3/ArtsyTokenServlet")
		.then(res => res.json())
		.then(data => {
			const token = data.token; //get API token
			return fetch(`https://api.artsy.net/api/search?q=${query}&size=10&type=artist`, {
				headers: {"X-XAPP-Token": token}
			});
		})
		
		/*fetch(`https://api.artsy.net/api/search?q=${query}&size=10&type=artist`, {
		    headers: { "X-XAPP-Token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsInN1YmplY3RfYXBwbGljYXRpb24iOiI1MjYzOGVhYy0yYTU2LTQ1MWQtOTI4MS04OTY5ZTRlNDkxZmUiLCJleHAiOjE3NDU2MDU2MjMsImlhdCI6MTc0NTAwMDgyMywiYXVkIjoiNTI2MzhlYWMtMmE1Ni00NTFkLTkyODEtODk2OWU0ZTQ5MWZlIiwiaXNzIjoiR3Jhdml0eSIsImp0aSI6IjY4MDI5OTc3ZjE1NDU3MDAxMGExNjMwYyJ9.MuS0eOuWroWkl2Y9bMvCgXpcXM1qbKi8ULslBjeJ93k" }
		}) */
		.then(res => res.json())
		.then(json => {
			loading.classList.add("hidden"); //hide loading gif when shwoing results
			const results = json._embedded.results.filter(r => r.type === "artist");
			
			if (results.length === 0) {
				noResultsMessage.classList.remove("hidden");
				return;
			}
			
			//for each artist fetch details and create artist card
			results.forEach(artist => {
				const card = document.createElement("div");
				card.classList.add("artistCard");
				card.dataset.artistId = artist._links.self.href.split("/").pop();
				
				const img = document.createElement("img");
				const thumb = artist._links.thumbnail.href;
				img.src = thumb.includes("missing_image") ? "Images/artsy_logo.svg" : thumb;
				img.classList.add("artistImage");
				
				const name = document.createElement("p");
				name.textContent = artist.title;
				
				card.appendChild(img);
				card.appendChild(name);
				resultsContainer.appendChild(card);
				
				card.addEventListener("click", () => {
					document.querySelectorAll(".artistCard").forEach(c => c.classList.remove("active"));
					card.classList.add("active");
					fetchArtistDetails(card.dataset.artistId);
				});
			});
		})
		.catch(err => {
			loading.classList.add("hidden");
			console.error("Search error:", err);
		});
	} //test
	
	//to get artist details
	function fetchArtistDetails(id) {
		const email = localStorage.getItem("user-email");
		
		artistDetails.classList.add("hidden");
		loading.classList.remove("hidden");
		
		fetch("/juliaali_CSCI201_Assignment3/ArtsyTokenServlet")
		.then(res => res.json())
		.then(data => {
			const token = data.token;
			return fetch(`https://api.artsy.net/api/artists/${id}`, {
				headers: { "X-XAPP-Token": token }
			});
		})
		.then(res => res.json())
		.then(artist => {
			loading.classList.add("hidden");
			artistDetails.classList.remove("hidden");
			
			artistDetails.innerHTML = `
			<div class="artistHeader">
				<h2>${artist.name} (${artist.birthday ?? ""} - ${artist.deathday ?? ""})
				<button id="starButton" class="star">&#9734;</button>
				</h2>
			</div>
			<h3>${artist.nationality ?? ""}</h3>
			<p>${artist.biography ?? ""}</p>`;
			
			//handle star
			const starButton = document.getElementById("starButton");
			if(!email) {
				starButton.style.display = "none";
				return;
			}
			
			//check if artist is already in favorites
			fetch(`/juliaali_CSCI201_Assignment3/getFavorite?email=${encodeURIComponent(email)}`) 
				.then(res => res.json())
				.then(data => {
					const favoriteIds = data.favorites || [];
					if (favoriteIds.includes(id)) {
						starButton.classList.add("filled");
						starButton.innerHTML = "&#9733;";
					}
				});
			
			//handle click start to add/remove artist
			starButton.addEventListener("click", () => {
				const isFavorite = starButton.classList.contains("filled");
				const url = isFavorite ? "removeFavorite" : "insertFavorite";
				
				fetch(`/juliaali_CSCI201_Assignment3/${url}`, {
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
					body: `email=${encodeURIComponent(email)}&artist_id=${encodeURIComponent(id)}`
				})
					.then(res => res.json())
					.then(data => {
						if(data.status === "success") {
							starButton.classList.toggle("filled");
							starButton.innerHTML = starButton.classList.contains("filled") ? "&#9733;" : "&#9734;";
						}
					})
					.catch(err => {
						console.error("Error updating favorites:", err);
					});
					
			});
		})
		.catch(err => {
			loading.classList.add("hidden");
			console.error("Failed to fetch artist details:", err);
		});
	}
	favButton.addEventListener("click", () => {
		showFavorites();
	});
	
	//handle showing users' favorites
	function showFavorites() {
		const email = localStorage.getItem("user-email");
			
		loading.classList.remove("hidden");
		artistDetails.classList.add("hidden");
		resultsContainer.innerHTML = "";
		noResultsMessage.classList.add("hidden");
		
		fetch(`/juliaali_CSCI201_Assignment3/getFavorite?email=${encodeURIComponent(email)}`)
			.then(res => res.json())
			.then(data => {
				const favoriteIds = data.favorites || [];
				
				//if there are no favorites
				if (favoriteIds.length === 0) {
					loading.classList.add("hidden");
					noResultsMessage.textContent = "No favorites artists.";
					noResultsMessage.classList.remove("hidden");
					return;
				}
				
				//get token
				fetch("/juliaali_CSCI201_Assignment3/ArtsyTokenServlet") 
					.then(res => res.json())
					.then(tokenData => {
						const token = tokenData.token;
						
						//for each favorite artis, fetch their data and cards
						Promise.all(favoriteIds.map(artistId => {
							fetch(`https://api.artsy.net/api/artists/${artistId}`, {
								headers: {"X-XAPP-Token": token}
							})
								.then(res => res.json())
								.then(artist => {
									const card = document.createElement("div");
									card.classList.add("artistCard");
									card.dataset.artistId = artist.id;
									
									const img = document.createElement("img");
									const thumb = artist._links.thumbnail.href;
									img.src = thumb.includes("missing_image") ? "Images/artsy_logo.svg" : thumb;
									img.classList.add("artistImage");
													
									const name = document.createElement("p");
									name.textContent = artist.name;
													
									card.appendChild(img);
									card.appendChild(name);
									resultsContainer.appendChild(card);
									
									card.addEventListener("click", () => {
										document.querySelectorAll(".artistCard").forEach(c => c.classList.remove("active"));
										card.classList.add("active");
										fetchArtistDetails(card.dataset.artistId);
									});
								});
						})) 
						.then(() => {
							loading.classList.add("hidden");
						});
						
					});
			})
			.catch(err => {
				loading.classList.add("hidden");
				console.error("Error loading favorites:", err);
			});	
	}
//indexpage()
}

//handle log in page
function loginPage() {
	console.log("loginPage() is running!");
	
	const loginForm = document.getElementById("loginForm");
	const email = document.getElementById("email");
	const password = document.getElementById("password");
	const errorMsg = document.getElementById("loginError");
	
	const emailIcon = document.getElementById("emailIcon");
	const passwordIcon = document.getElementById("passwordIcon");
	const emailError = document.getElementById("emailError");
	const passwordError = document.getElementById("passwordError");
	
	function validateInputs() {
		let valid = true;
		
		//reset
		[email, password].forEach(i => i.classList.remove("error"));
		[emailIcon, passwordIcon, emailError, passwordError].forEach(e => e.classList.add("hidden"));
		
		if (!email.value.includes("@")) {
			email.classList.add("error");
			emailIcon.classList.remove("hidden");
			emailError.classList.remove("hidden");
			valid = false;
		}
		
		if (password.value.trim() === "") {
			password.classList.add("error");
			passwordIcon.classList.remove("hidden");
			passwordError.classList.remove("hidden");
			valid = false;
		}
	}
	
	email.addEventListener("blur", validateInputs);
	password.addEventListener("blur", validateInputs);
	
	loginForm.addEventListener("submit", (e) => {
		e.preventDefault();
		
		validateInputs();
		
		const emailInput = email.value.trim();
		const passwordInput = password.value;
		
		fetch("login", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `email=${encodeURIComponent(emailInput)}&password=${encodeURIComponent(passwordInput)}`
		})
		.then(res => res.json())
		.then(data => {
			if (data.status === "success") {
				localStorage.setItem("logged-in", "yes");
				localStorage.setItem("user-email", emailInput);
				window.location.href = "index.html";
			} 
			else {
				errorMsg.classList.remove("hidden");
				errorMsg.textContent = data.message || "Login failed.";
			}
		})
		.catch(err => {
			errorMsg.classList.remove("hidden");
			errorMsg.textContent = "Something went wrong!";
			console.error(err);
		});
	});
}


//handle register page
function registerPage() {
	const registerForm = document.getElementById("registerForm");
	const errorMsg = document.getElementById("registerError");
	const fullname = document.getElementById("fullname");
	const email = document.getElementById("email");
	const password = document.getElementById("password");
	
	const fullnameIcon = document.getElementById("fullnameIcon");
	const emailIcon = document.getElementById("emailIcon");
	const passwordIcon = document.getElementById("passwordIcon");
	const fullnameError = document.getElementById("fullnameError");
	const emailError = document.getElementById("emailError");
	const passwordError = document.getElementById("passwordError");
	
	function validateInputs() {
		let valid = true;
		
		//reset
		[fullname, email, password].forEach(i => i.classList.remove("error"));
		[fullnameIcon, emailIcon, passwordIcon, fullnameError, emailError, passwordError].forEach(e => e.classList.add("hidden"));

		if (fullname.value.trim() === "") {
			fullname.classList.add("error");
			fullnameIcon.classList.remove("hidden");
			fullnameError.classList.remove("hidden");
			valid = false;
		}
						
		if (!email.value.includes("@")) {
			email.classList.add("error");
			emailIcon.classList.remove("hidden");
			emailError.classList.remove("hidden");
			valid = false;
		}
				
		if (password.value.trim() === "") {
			password.classList.add("error");
			passwordIcon.classList.remove("hidden");
			passwordError.classList.remove("hidden");
			valid = false;
		}
	}
	
	fullname.addEventListener("blur", validateInputs);
	email.addEventListener("blur", validateInputs);
	password.addEventListener("blur", validateInputs);
	
	registerForm.addEventListener("submit", (e) => {
		e.preventDefault();
		
		validateInputs();
		
		const fullnameInput = fullname.value.trim();
		const emailInput = email.value.trim();
		const passwordInput = password.value;
		
		fetch("register", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `fullname=${encodeURIComponent(fullnameInput)}&email=${encodeURIComponent(emailInput)}&password=${encodeURIComponent(passwordInput)}`
		})
		.then(res => res.json())
		.then(data => {
			if (data.status === "success") {
				localStorage.setItem("logged-in", "yes");
				localStorage.setItem("user-email", emailInput);
				window.location.href = "index.html";
			} 
			else {
				errorMsg.classList.remove("hidden");
				errorMsg.textContent = data.message;
			}
		})
		.catch(err => {
			errorMsg.classList.remove("hidden");
			errorMsg.textContent = "Something went wrong!";
			console.error(err);
		});
	});
}
