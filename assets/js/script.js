"use strict";

// element toggle function
const elementToggleFunc = function (elem) {
  elem.classList.toggle("active");
};

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () {
  elementToggleFunc(sidebar);
});

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
};

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector(
      "[data-testimonials-title]"
    ).innerHTML;
    modalText.innerHTML = this.querySelector(
      "[data-testimonials-text]"
    ).innerHTML;

    testimonialsModalFunc();
  });
}

// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }
  });
}

const url = "https://codestats.net/api/users/alri";

fetch(url)
  .then((res) => res.json())
  .then((data) => {
    const { languages } = data;
    if (languages) {
      // Преобразуем объект в массив и фильтруем по xps > 100
      let filteredLanguages = Object.entries(languages)
        .filter(([key, value]) => value.xps > 1000)
        .sort((a, b) => b[1].xps - a[1].xps); // Сортировка по убыванию xps

      // Массивы для данных графика
      const labels = filteredLanguages.map(([key]) => key);
      const xpsData = filteredLanguages.map(([_, value]) => value.xps);

      // Цвета для графика
      const backgroundColor = "rgba(234, 188, 79, 0.7)"; // Желтый цвет с прозрачностью
      const borderColor = "rgba(234, 188, 79, 1)"; // Яркий желтый цвет
      const gridColor = "rgba(255, 255, 255, 0.1)"; // Прозрачный белый для сетки

      // Создаем график с помощью Chart.js
      const ctx = document.getElementById("languagesChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "XP by Language",
              data: xpsData,
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              borderWidth: 2,
              borderRadius: 10,
            },
          ],
        },
        options: {
          scales: {
            x: {
              grid: {
                color: gridColor,
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.9)", // Белый цвет меток на оси X
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: gridColor,
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.9)", // Белый цвет меток на оси Y
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: "rgba(255, 255, 255, 0.9)", // Белый цвет текста легенды
              },
            },
          },
        },
      });
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

const repositories = [
  "https://github.com/alridev/gosu",
  "https://github.com/alridev/xstore-for-umbrel",
  "https://github.com/alridev/BestSeedParserSource",
];

async function fetchPortfolioData(repoUrl) {
  const repoPath = repoUrl.replace("https://github.com/", "");
  const url = `https://api.github.com/repos/${repoPath}/contents/portfolio.yaml`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3.raw", // Получаем чистый текст файла
    },
  });

  if (response.status === 404) {
    console.error(`File portfolio.yaml not found in ${repoUrl}`);
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const yamlContent = await response.text();
  return jsyaml.load(yamlContent); // Парсим YAML в объект JavaScript
}
async function aggregatePortfolioData(repositories) {
  const allProjects = [];

  for (const repo of repositories) {
    const data = await fetchPortfolioData(repo);
    if (data && data.info) {
      const filteredProjects = data.info.filter((project) => !project.hide);
      filteredProjects.sort(
        (a, b) => a.data.options.index - b.data.options.index
      );
      filteredProjects.forEach((project) => {
        project.github = repo;
      });
      allProjects.push(...filteredProjects);
    }
  }

  return allProjects;
}
// Функция для добавления тегов в контейнер #projects-tags
function addTags(tags) {
  const tagsContainer = document.getElementById("projects-tags");
  const filterTagsContainer = document.getElementById("filter-projects-tags");

  tags.forEach((tag) => {
    const listItem = document.createElement("li");
    listItem.classList.add("select-item");

    const button = document.createElement("button");
    button.setAttribute("data-select-item", "");
    button.textContent = tag;

    listItem.appendChild(button);
    tagsContainer.appendChild(listItem);

    const filterListItem = document.createElement("li");
    filterListItem.classList.add("filter-item");

    const filterButton = document.createElement("button");
    filterButton.setAttribute("data-filter-btn", "");
    filterButton.textContent = tag;

    filterListItem.appendChild(filterButton);
    filterTagsContainer.appendChild(filterListItem);
  });
}

// Функция для добавления проектов в контейнер #projects-list
function addProjects(projects) {
  const projectsContainer = document.getElementById("projects-list");

  projects.forEach((project) => {
    const listItem = document.createElement("li");
    listItem.classList.add("project-item", "active");
    listItem.setAttribute("data-filter-item", "");
    listItem.setAttribute("data-category", project.tag.toLowerCase());

    const anchor = document.createElement("a");
    anchor.setAttribute("href", "#");

    const figure = document.createElement("figure");
    figure.classList.add("project-img");

    const iconBox = document.createElement("a");
    iconBox.classList.add("project-item-icon-box");
    iconBox.href = project.url || project.github;

    const icon = document.createElement("ion-icon");
    if (!project.url) {
      icon.setAttribute("name", "logo-github");
    } else {
      icon.setAttribute("name", "link");
    }
    iconBox.appendChild(icon);

    const img = document.createElement("img");
    img.setAttribute("src", project.preview);
    img.setAttribute("alt", project.name);
    img.setAttribute("loading", "lazy");

    figure.appendChild(iconBox);
    figure.appendChild(img);

    const title = document.createElement("h3");
    title.classList.add("project-title");
    title.textContent = project.name;

    const description = document.createElement("p");
    description.classList.add("project-category");
    description.textContent = project.description;

    anchor.appendChild(figure);
    anchor.appendChild(title);
    anchor.appendChild(description);

    listItem.appendChild(anchor);
    projectsContainer.appendChild(listItem);
  });
}
// Функция фильтрации проектов
function filterFunc(selectedValue) {
  const filterItems = document.querySelectorAll("[data-filter-item]");

  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
}
// Функция для обработки выбора фильтров и тэгов
function setupCustomSelectAndFilter() {
  const select = document.querySelector("[data-select]");
  const selectItems = document.querySelectorAll("[data-select-item]");
  const selectValue = document.querySelector("[data-select-value]");
  const filterBtn = document.querySelectorAll("[data-filter-btn]");

  select.onclick = function () {
    elementToggleFunc(select);
  };

  for (let i = 0; i < selectItems.length; i++) {
    selectItems[i].onclick =  function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    };
  }

  let lastClickedBtn = filterBtn[0];

  for (let i = 0; i < filterBtn.length; i++) {
    filterBtn[i].onclick = function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      filterFunc(selectedValue);

      lastClickedBtn.classList.remove("active");
      this.classList.add("active");
      lastClickedBtn = this;
    }
  }
}

// Основная функция для получения данных и обновления страницы
async function updatePortfolio(repositories) {
  const projects = await aggregatePortfolioData(repositories);
  const tags = [...new Set(projects.map((project) => project.tag))]; // Уникальные теги

  addProjects(projects);
  addTags(tags);
  setupCustomSelectAndFilter();
}

updatePortfolio(repositories).catch((error) => {
  console.error("Error:", error.message);
});

setupCustomSelectAndFilter();

function setAvatar(avatar) {
  const avatarImg = document.getElementById("avatar");
  switch (avatar) {
    case "skills":
      avatarImg.src = "assets/images/avatar-skills.png";
      break;
    case "projects":
      avatarImg.src = "assets/images/avatar-projects.png";
      break;

    default:
      avatarImg.src = "assets/images/my-avatar.png";
  }
}
const nav_items = document.querySelectorAll("[data-nav-link]");
