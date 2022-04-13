
function getSubstrings(text) {
    let result = [];

    if (typeof (text) != "string") return result;
    let size = text.length;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let aux = text.slice(i, j + 1);
            if (aux != "" && aux != null) {
                result.push(aux)
            }
        }
    }
    return result;
}

function getSearchResult(input, database) {
    let result = [];

    if (typeof (input) != "string") return result;
    input = input.trim().toUpperCase().split(" ");

    let substrings = []

    input.map((element) => {
        substrings = substrings.concat(getSubstrings(element));
    });

    let values = database.map(element => {
        return element
        //does nothing
    })

    values.map(value => {
        result = result.concat(substrings.map(substr => {
            return { id: value["id"], substr: substr }
        }).filter(element => {
            return value["value"].includes(element.substr)
        }));
    });

    let aux = {}

    result.map(element => {
        element["substr"] = element["substr"].length

        aux[element["id"]] = !isNaN(aux[element["id"]]) ? aux[element["id"]] + element["substr"] : element["substr"]
    });

    return aux
}

let database = [
    {
        "id": 1,
        "value": "NUNO"
    }, {
        "id": 2,
        "value": "BERNARDO"
    }, {
        "id": 3,
        "value": "ANTONIO"
    }
];

console.log(getSearchResult("coelho", database))