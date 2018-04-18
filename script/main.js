var monthsArrPL = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień",
    "październik", "listopad", "grudzień"];
var monthsArrUS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

document.addEventListener("DOMContentLoaded", main());

function main() {
    getData();
};

function getData() {
    $.ajax({
        url: "./json/dane.json",
        dataType: 'text',
        success: renderData,
        error: showErrorMessage
    });
}

function renderData(data) {
    var str = data.replace(/\}\,\n\]/g, '}\n]');
    var arrFromJson;
    var columsHead = document.querySelectorAll("thead th");;
    var reverse = false;
    arr = JSON.parse(str);
    arrFromJson = convertFromJson(arr);
    for (var i = 0; i < arrFromJson.length; i++) {
        arrFromJson[i] = objToArr(arrFromJson[i][1])
    }
    tableFromArr(arrFromJson.slice(0, 5));
    createPaginationBar(arrFromJson.length, 5);
    var pages = document.querySelectorAll("#paginationBar a");
    pages.forEach(function (element) {
        element.addEventListener("click", function (e) {
            changeCurrnetPage(e, arrFromJson, 5);
        })
    });
    columsHead.forEach(function (element) {
        element.addEventListener("click", function (e) {
            var returnFromFunction = sortArr(e, arrFromJson, reverse);
            arrFromJson = returnFromFunction[0];
            reverse = returnFromFunction[1];
            refreshPagination(arrFromJson, 5)
        })
    });
}

function showErrorMessage(jqXHR, exception) {
    var msg = '';
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

function sortArr(e, arr, reverse) {
    var sortByData = e.target.getAttribute("data-sort");
    if (reverse) {
        arr.reverse();
        reverse = false;
        return [arr, reverse];
    }
    arr.sort(compareByColumnIndex(sortByData));
    reverse = true;
    return [arr, reverse]
}

function compareByColumnIndex(index) {
    return function (a, b) {
        if (index == 3) {
            var date1  = convertDateToCompare(a[index]);
            var date2 = convertDateToCompare(b[index]);
            if (date1 === date2) {
                return 0;
            }
            else {
                return (date1 < date2) ? -1 : 1;
            }
        }
        if (a[index] === b[index]) {
            return 0;
        }
        else {
            return (a[index] < b[index]) ? -1 : 1;
        }
    }
}

function refreshPagination(arr, rowsPerPage) {
    var active = document.querySelector(".active").innerHTML;
    var startCurrentPage = (parseInt(active) - 1) * rowsPerPage;
    var endCurrentPage = startCurrentPage + rowsPerPage;
    tableFromArr(arr.slice(startCurrentPage, endCurrentPage));
}

function convertDateFromJson(date) {
    date = date.slice(0, date.indexOf(" "));
    var dateArr = date.split(".");
    return parseInt(dateArr[0]) + " " + monthsArrPL[parseInt(dateArr[1]) - 1] + " " + dateArr[2];
}

function convertDateToCompare(date) {
    if (date[1] == " ") {
        date = "0" + date
    }
    var monthToConvert = date.slice(3, date.indexOf(" ", 3));
    date = new Date(date.replace(monthToConvert, monthsArrUS[monthsArrPL.indexOf(monthToConvert)]));
    console.log(date)
    return date;
}

function createPaginationBar(totalRows, rowsPerPage) {
    var pages = totalRows / rowsPerPage;
    if (document.querySelector("#paginationBar")) return;
    var paginationBar = document.createElement("div");
    var prevPage = document.createElement('a');
    var nextPage = document.createElement('a');
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
    for (var i = 0; i < pages; i++) {
        var page = document.createElement('a');
        page.setAttribute("href", "#");
        page.setAttribute("id", "page");
        if (i == 0) {
            page.classList.add("active");
        }
        page.innerHTML = i + 1;
        paginationBar.appendChild(page);
    }
    paginationBar.appendChild(nextPage);
    var tableDiv = document.querySelector(".tableDiv");
    tableDiv.insertBefore(paginationBar, tableDiv.childNodes[6]);
}

function changeCurrnetPage(e, arr, rowsPerPage) {
    var curData = e.target.getAttribute("data-change");
    var currentPage = e.target.innerHTML;
    var activePage = document.querySelector(".active");
    var active = activePage.innerHTML;
    var pages = document.querySelectorAll("#page");
    var startCurrentPage, endCurrentPage;
    if ((curData == "-1" && active == 1) || (curData == "1" && active == pages.length)) {
        return
    }
    if (curData) {
        currentPage = Number(active) + Number(curData);
        document.querySelector(".active").removeAttribute("class");
        if (curData == "-1") {
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
    var arr = [];
    for (var key in obj) {
        arr.push([key, obj[key]]);
    }
    return arr;
}

function objToArr(obj) {
    var arr = [];
    for (var key in obj) {
        if (key == "dateOfBirth") {
            obj[key] = convertDateFromJson(obj[key])

        }
        arr.push(obj[key]);
    }
    return arr;
}

function tableFromArr(arr) {
    var newTableBody = document.createElement("tbody");
    for (var i = 0; i < arr.length; i++) {
        var newRow = newTableBody.insertRow(-1);
        newRow.innerHTML = "<th scope='row'>" + arr[i][0] + "</th>"
        for (var j = 1; j < arr[i].length; j++) {
            var cell = newRow.insertCell(j);
            cell.innerHTML = arr[i][j];
        }
    }
    document.querySelector("tbody").innerHTML = newTableBody.innerHTML;
}