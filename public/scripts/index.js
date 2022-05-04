
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

async function getLastTimeUpdatedInfo(){
    let response = await fetch("/lastDataUpdate");
    let time = JSON.parse(await response.text());
    return new Date(time.response).toGMTString();
}

getLastTimeUpdatedInfo().then(
    function(valor){
        document.getElementById("lastUpdatedInfoSpan").innerText = valor;
    }
);

console.log("Done by António Pinto")