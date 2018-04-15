document.addEventListener("DOMContentLoaded", main());

function main() {
    getData();
};

function getData() {
    $.ajax({
        url: "./json/dane.json",
        dataType: 'text',
        success: function (data) {
            const str = data.replace(/\}\,\n\]/g, '}\n]');
            let arrFromJson; 
            const columsHead = document.querySelectorAll("thead th");;
            let reverse = false;
            arr = JSON.parse(str);
            arrFromJson = convertFromJson(arr);
            for (let i = 0; i < arrFromJson.length; i++) {
                arrFromJson[i] = objToArr(arrFromJson[i][1])
            }
            tableFromArr(arrFromJson.slice(0, 5));
            createPaginationBar(arrFromJson.length, 5);
            const pages = document.querySelectorAll("#paginationBar a");
            pages.forEach(function (element) {
                element.addEventListener("click", function (e) {
                    changeCurrnetPage(e, arrFromJson, 5);
                })
            });
            columsHead.forEach(function (element) {
                element.addEventListener("click", function (e) {
                    let returnFromFunction = sortArr(e, arrFromJson, reverse);
                    arrFromJson = returnFromFunction[0];
                    reverse = returnFromFunction[1];
                    refreshPagination(arrFromJson, 5)
                })
            });
        },
        error: function (jqXHR, exception) {
            let msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}

function sortArr(e, arr, reverse) {
    const sortByData = e.target.getAttribute("data-sort");
    let ifEnd = false;
    let cell1, cell2;
    while (!ifEnd) {
        for (let i = 0; i < arr.length - 1; i++) {
            cell1 = arr[i][sortByData];
            cell2 = arr[i + 1][sortByData];
            if (sortByData == 3) {
                cell1 = convertDateToCompare(cell1);
                cell2 = convertDateToCompare(cell2);
            }
            if (!reverse) {
                if (cell1 > cell2) {
                    let temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                    temp = "";
                    ifEnd = false;
                    break;
                }
            } else if (reverse) {
                if (cell1 < cell2) {
                    let temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                    temp = "";
                    ifEnd = false;
                    break;
                }
            }
            ifEnd = true;
        }
        
    }
    return [arr, !reverse];
}

function refreshPagination(arr, rowsPerPage) {
    const active = document.querySelector(".active").innerHTML;
    let startCurrentPage = (parseInt(active) - 1) * rowsPerPage;
    let endCurrentPage = startCurrentPage + rowsPerPage;
    tableFromArr(arr.slice(startCurrentPage, endCurrentPage));
}

function convertDateFromJson(date) {
    date = date.slice(0, date.indexOf(" "));
    let day = date.slice(0, date.indexOf("."));;
    let month = date.slice(day.length + 1, date.indexOf(".", day.length + 1));;
    const year = date.slice(day.length + month.length + 2, date.length);;
    const monthsArr = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"]
    month = monthsArr[parseInt(month) - 1]
    if (day.length == 2 && day[0] == "0") {
        day = day[1];
    }
    return day + " " + month + " " + year;
}

function convertDateToCompare(date) {
    if (date[1] == " ") {
        date = "0" + date
    }
    const monthsArrPL = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień",
        "październik", "listopad", "grudzień"];
    const monthsArrUS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const monthToConvert = date.slice(3, date.indexOf(" ", 3));
    date = new Date(date.replace(monthToConvert, monthsArrUS[monthsArrPL.indexOf(monthToConvert)]));
    return date;
}


function createPaginationBar(totalRows, rowsPerPage) {
    const pages = totalRows / rowsPerPage;
    if (document.querySelector("#paginationBar")) return;
    const paginationBar = document.createElement("div");
    const prevPage = document.createElement('a');
    const nextPage = document.createElement('a');
    prevPage.setAttribute("href", "#");
    prevPage.setAttribute("id", "change");
    prevPage.setAttribute("data-change", "-1");
    prevPage.innerHTML = "< back";
    nextPage.setAttribute("href", "#");
    nextPage.setAttribute("id", "change");
    nextPage.setAttribute("data-change", "1")
    nextPage.innerHTML = "next >"
    paginationBar.setAttribute("id", "paginationBar");
    paginationBar.appendChild(prevPage)
    for (let i = 0; i < pages; i++) {
        const page = document.createElement('a');
        page.setAttribute("href", "#");
        page.setAttribute("id", "page");
        if (i == 0) {
            page.classList.add("active");
        }
        page.innerHTML = i + 1;
        paginationBar.appendChild(page);
    }
    paginationBar.appendChild(nextPage);
    const tableDiv = document.querySelector(".tableDiv");
    tableDiv.insertBefore(paginationBar, tableDiv.childNodes[6]);
}

function changeCurrnetPage(e, arr, rowsPerPage) {

    const curData = e.target.getAttribute("data-change");
    let currentPage = e.target.innerHTML;
    const activePage = document.querySelector(".active");
    const active = activePage.innerHTML;
    const pages = document.querySelectorAll("#page");
    let startCurrentPage, endCurrentPage;
    if ((curData == "-1" && active == 1) || (curData == "1" && active == pages.length)) {
        return
    }
    if (curData){
        currentPage = Number(active) + Number(curData);
        document.querySelector(".active").removeAttribute("class");
        if (curData == "-1"){
            activePage.previousSibling.classList.add("active");
        } else {
            activePage.nextSibling.classList.add("active");
        }
    } else {
        document.querySelector(".active").removeAttribute("class");
    e.target.classList.add("active");
    }
    
    startCurrentPage = (parseInt(currentPage) - 1) * rowsPerPage;
    endCurrentPage = startCurrentPage + rowsPerPage;
    tableFromArr(arr.slice(startCurrentPage, endCurrentPage))
}

function convertFromJson(obj) {
    let arr = [];
    for (const key in obj) {
        arr.push([key, obj[key]]);
    }
    return arr;
}

function objToArr(obj) {
    let arr = [];
    for (const key in obj) {
        if (key == "dateOfBirth") {
            obj[key] = convertDateFromJson(obj[key])

        }
        arr.push(obj[key]);
    }
    return arr;
}

function tableFromArr(arr) {
    let newTableBody = document.createElement("tbody");
    for (let i = 0; i < arr.length; i++) {
        const newRow = newTableBody.insertRow(-1);
        newRow.innerHTML = "<th scope='row'>" + arr[i][0] + "</th>"
        for (let j = 1; j < arr[i].length; j++) {
            const cell = newRow.insertCell(j);
            cell.innerHTML = arr[i][j];
        }
    }
    document.querySelector("tbody").innerHTML = newTableBody.innerHTML;
}