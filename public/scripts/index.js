function toggleResponseRequest(elementID) {
    let element = document.getElementById(elementID);
    let paragraphElement = document.getElementById(elementID + "_p");

    if (window.getComputedStyle(element).backgroundColor != "rgba(0, 0, 0, 0)") {
        element.style.backgroundColor = "rgba(0, 0, 0, 0)";
        element.style.marginBottom = "0px"
        paragraphElement.classList.add("notVisible");
    } else {
        element.style.backgroundColor = "#b5b5b5";
        element.style.marginBottom = "10px"
        paragraphElement.classList.remove("notVisible");
    }
}

async function redirectToAPI(url) {
     let completeurl = window.location.href + url;

     const response = await fetch(completeurl, {method: "POST", headers: {"API_KEY": process.env.API_KEY}})
     console.log(response);
    console.log("ola")
}