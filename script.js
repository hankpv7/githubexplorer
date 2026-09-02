const usernameInput = document.getElementById("username-input");
const searchButton = document.getElementById("search-btn");

const profileSection = document.getElementById("profile-section");
const repositoriesSection = document.getElementById("repositories");

const repoContainer = document.getElementById("repo-container");

const repoSearch = document.getElementById("repo-search");
const sortRepos = document.getElementById("sort-repos");

let repositories = [];

// Hide results initially

profileSection.style.display = "none";
repositoriesSection.style.display = "none";

// SEARCH BUTTON

searchButton.addEventListener("click", searchUser);

// PRESS ENTER

usernameInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchUser();
  }
});

// MAIN SEARCH FUNCTION

async function searchUser() {
  const username = usernameInput.value.trim();

  if (username === "") {
    alert("Please enter a GitHub username.");

    return;
  }

  try {
    searchButton.textContent = "Searching...";

    // GET PROFILE

    const profileResponse = await fetch(
      `https://api.github.com/users/${username}`,
    );

    if (!profileResponse.ok) {
      alert("GitHub user not found.");

      return;
    }

    const profileData = await profileResponse.json();

    // SHOW PROFILE

    document.getElementById("avatar").src = profileData.avatar_url;

    document.getElementById("profile-name").textContent =
      profileData.name || profileData.login;

    document.getElementById("profile-username").textContent =
      "@" + profileData.login;

    document.getElementById("bio").textContent =
      profileData.bio || "No bio available.";

    document.getElementById("followers").textContent = profileData.followers;

    document.getElementById("repo-count").textContent =
      profileData.public_repos;

    document.getElementById("github-link").href = profileData.html_url;

    // GET REPOSITORIES

    const repoResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
    );

    repositories = await repoResponse.json();

    // FIND MAIN LANGUAGE

    const languageCount = {};

    repositories.forEach(function (repo) {
      if (repo.language) {
        if (languageCount[repo.language]) {
          languageCount[repo.language]++;
        } else {
          languageCount[repo.language] = 1;
        }
      }
    });

    let mainLanguage = "-";
    let highestCount = 0;

    for (let language in languageCount) {
      if (languageCount[language] > highestCount) {
        highestCount = languageCount[language];

        mainLanguage = language;
      }
    }

    document.getElementById("language").textContent = mainLanguage;

    // DISPLAY REPOSITORIES

    displayRepositories(repositories);

    // SHOW RESULTS

    profileSection.style.display = "block";
    repositoriesSection.style.display = "block";
  } catch (error) {
    console.log(error);

    alert("Something went wrong.");
  }

  searchButton.textContent = "Search";
}

// DISPLAY REPOSITORIES

function displayRepositories(repoList) {
  repoContainer.innerHTML = "";

  if (repoList.length === 0) {
    repoContainer.innerHTML = "<p>No repositories found.</p>";

    return;
  }

  repoList.forEach(function (repo) {
    const card = document.createElement("div");

    card.className = "repo-card";

    card.innerHTML = `

            <h3>${repo.name}</h3>

            <p>
                ${repo.description || "No description available."}
            </p>

            <div class="repo-info">

                <span>⭐ ${repo.stargazers_count}</span>

                <span>🍴 ${repo.forks_count}</span>

                <span>${repo.language || "N/A"}</span>

            </div>

            <a href="${repo.html_url}" target="_blank">
                View Repository →
            </a>

        `;

    repoContainer.appendChild(card);
  });
}

// SEARCH REPOSITORIES

repoSearch.addEventListener("input", function () {
  const searchText = repoSearch.value.toLowerCase();

  const filteredRepos = repositories.filter(function (repo) {
    return repo.name.toLowerCase().includes(searchText);
  });

  displayRepositories(filteredRepos);
});

// SORT BY STARS

sortRepos.addEventListener("change", function () {
  if (sortRepos.value === "stars") {
    const sortedRepos = [...repositories];

    sortedRepos.sort(function (a, b) {
      return b.stargazers_count - a.stargazers_count;
    });

    displayRepositories(sortedRepos);
  } else {
    displayRepositories(repositories);
  }
});
