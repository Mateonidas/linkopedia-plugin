import axios from "axios";

const url = "http://localhost:8080/api";

const logForm = document.querySelector(".log-data");
const webForm = document.querySelector(".website-data");
const errors = document.querySelector(".errors");
const user = document.querySelector(".username");
const pass = document.querySelector(".password");
const address = document.querySelector(".address");
const categories = document.querySelector(".categories")

errors.textContent = "";
webForm.style.display = "none";
let token;
let categoriesList;

const logIn = async (username, password) => {
    errors.textContent = "";

    const testResponse = await axios({
        method: 'POST',
        url: `${url}/login`,
        data: {
            username: username,
            password: password
        }
    }).catch(function (error) {
            webForm.style.display = "none";
            user.value = "";
            pass.value = "";
            errors.textContent = "Wrong username or password.";
            console.log(error.textContent);
        })

    token = testResponse.data.access_token;
    console.log(token);

    logForm.style.display = "none";

    categoriesList = await axios({
        method: 'GET',
        url: `${url}/categories`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })

    let element;
    let i = 0;
    for (element in categoriesList.data) {
        let opt = document.createElement("option");
        opt.text = categoriesList.data[i].name;
        categories.add(opt);
        i++;
    }

    await chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
        address.value = tabs[0].url;
    });

    webForm.style.display = "block";
}

const handleSubmitLog = async e => {
    e.preventDefault();
    logIn(user.value, pass.value);
    console.log(user.value, pass.value);
};

logForm.addEventListener("submit", e => handleSubmitLog(e));

const addWebsite = async (token) => {

    errors.textContent = "";

    let address = document.querySelector(".address").value;
    let description = document.querySelector(".description").value;
    let isPublic = document.querySelector(".public").value;
    let category = document.querySelector(".categories").value;
    let tagsInput = document.querySelector(".tags").value;

    const tags = tagsInput.split(' ')
    const tagsArray = tags.map(tag => {
        return {
            tagName: tag
        }
    })

    let element;
    let i = 0;

    let idCategory;
    for (element in categoriesList.data) {
        if (category === categoriesList.data[i].name) {
            idCategory = categoriesList.data[i].id;
            break;
        }
        i++;
    }

    const response = await axios({
        method: 'POST',
        url: `${url}/websites`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        data: {
            address: address,
            description: description,
            isPublic: isPublic,
            idCategory: idCategory,
            category: category,
            tags: tagsArray
        }
    })
        .then(function () {
            errors.textContent = "The website has been added.";
        })
        .catch(function (error) {
        errors.textContent = error.response.data.details;
        console.log(error.response.data.details);
    })

    console.log(response);
}

const handleSubmitAddWebsite = async e => {
    e.preventDefault();
    addWebsite(token);
};

webForm.addEventListener("submit", e => handleSubmitAddWebsite(e));