document.addEventListener("DOMContentLoaded", main());

function main() {
    getData();
};

function getData() {
    $.ajax({
        url: "./json/dane.json",
        dataType: 'text',
        success: function (data) {
            var str = data.replace(/\}\,\n\]/g, '}\n]');
            arr = JSON.parse(str);
            var txt = "";
            for (x in arr) {
                txt += "<tr><th scope='row' data-sort='id'>" + arr[x].id + "</th><td data-sort='firstName'>" + arr[x].firstName + "</td><td data-sort='lastName'>" + arr[x].lastName + "</td><td data-sort='birthDate'>" + convertDateFromJson(arr[x].dateOfBirth) + "</td><td data-sort='company'>" + arr[x].company + "</td><td data-sort='note'>" + arr[x].note + "</td></tr>";
            }
            document.querySelector("tbody").innerHTML = txt;
        },
        error: function (jqXHR, exception) {
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
    }).done(function () {
        var tableToPaginate = document.querySelector("table");
        var columsHead = document.querySelectorAll("thead th");
        var direction = "asc";
        for (var i = 0; i < columsHead.length; i++) {
            columsHead[i].addEventListener("click", function (e) {
                direction = sortBy(e, direction);
            });
        }
        tablePagination(5);
    });
}

function sortBy(e, direction) {
    var sortByData = e.target.getAttribute("data-sort");
    var ifEnd = false;
    var searchCell;
    var rows, cell1, cell2;
    if (sortByData == "id") {
        searchCell = "th[data-sort='" + sortByData + "']";
    }
    else {
        searchCell = "td[data-sort='" + sortByData + "']";
    };
    while (!ifEnd) {
        rows = document.querySelectorAll("tbody tr");
        for (var i = 0; i < rows.length - 1; i++) {
            cell1 = rows[i].querySelector(searchCell).innerHTML;
            cell2 = rows[i + 1].querySelector(searchCell).innerHTML;
            if (sortByData == "id" || sortByData == "note") {
                cell1 = parseInt(cell1);
                cell2 = parseInt(cell2);
            } else if (sortByData == "birthDate"){
                cell1 = convertDateToCompare(cell1);
                console.log(cell1);
                cell2 = convertDateToCompare(cell2);
                console.log(cell2);
            }
            if (cell1 > cell2) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                ifEnd = false;
                break;
            }
            ifEnd = true;
        }
    }
}

function convertDateFromJson(date) {
    var day, month, year;
    var monthsArr = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"]
    date = date.slice(0, date.indexOf(" "));
    day = date.slice(0, date.indexOf("."));
    month = date.slice(day.length + 1, date.indexOf(".", day.length + 1));
    year = date.slice(day.length + month.length + 2, date.length);
    month = monthsArr[parseInt(month) - 1]
    if (day.length == 2 && day[0] == "0") {
        day = day[1];
    }
    return day + " " + month + " " + year;
}

function convertDateToCompare(date) {
    var monthsArrPL = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień",
        "październik", "listopad", "grudzień"];
    var monthsArrUS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    var monthToConvert = date.slice(3, date.indexOf(" ", 3));
    date = new Date(date.replace(monthToConvert, monthsArrUS[monthsArrPL.indexOf(monthToConvert)]));
    return date;
}

function paginate(tableName, RecordsPerPage) {
    $('#nav').remove();
    $(tableName).after('<div id="nav"></div>');
    var rowsShown = RecordsPerPage;
    var rowsTotal = $("table tbody tr").length;
    var numPages = rowsTotal / rowsShown;
    for (i = 0; i < numPages; i++) {
        var pageNum = i + 1;
        $('#nav').append('<a href="#" rel="' + i + '">' + pageNum + '</a> ');
    }
    $("table tbody tr").hide();
    $("table tbody tr").slice(0, rowsShown).show();
    $('#nav a:first').addClass('active');
    $('#nav a').bind('click', function () {

        $('#nav a').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $("table tbody tr").css('opacity', '0.0').hide().slice(startItem, endItem).
            css('display', 'table-row').animate({ opacity: 1 }, 300);
    });
}

function tablePagination(rowsPerPage) {
    var rowsToPaginate = document.querySelectorAll("tbody tr");
    var totalRows = rowsToPaginate.length;
    var pages = totalRows / rowsPerPage;
    createPaginationBar(pages);
    for (i = 0; i < rowsPerPage; i++) {
        rowsToPaginate[i].classList.add("show");
    }
    var linkToPage = document.querySelectorAll("#page");
    linkToPage[0].classList.add("active");
    linkToPage.forEach(function (element) {
        element.addEventListener("click", function (e) {
            changeCurrnetPage(e, rowsPerPage)
        });
    })
}

function createPaginationBar(rowsPerPage) {
    var paginationBar = document.createElement("div");
    var prevPage = document.createElement('a');
    var nextPage = document.createElement('a');
    prevPage.setAttribute("href", "#");
    prevPage.setAttribute("id", "back");
    prevPage.innerHTML = "< back";
    nextPage.setAttribute("href", "#");
    nextPage.setAttribute("id", "next");
    nextPage.innerHTML = "next >"
    paginationBar.setAttribute("id", "paginationBar");
    paginationBar.appendChild(prevPage)
    for (var i = 0; i < rowsPerPage; i++) {
        var page = document.createElement('a');
        page.setAttribute("href", "#");
        page.setAttribute("data-page", i);
        page.setAttribute("id", "page");
        page.innerHTML = i + 1;
        paginationBar.appendChild(page);
    }
    paginationBar.appendChild(nextPage);
    document.querySelector(".tableDiv").appendChild(paginationBar);
}

function changeCurrnetPage(e, rowsPerPage) {
    var currentPage = e.target.innerHTML;
    var startCurrentPage = (currentPage - 1) * rowsPerPage;
    console.log(startCurrentPage)
    var endCurrentPage = startCurrentPage + rowsPerPage;
    console.log(endCurrentPage)
    var allRows = document.querySelectorAll("tbody tr")
    allRows.forEach(function (element) {
        element.classList.remove("show");
    })
    e.target.parentElement.querySelectorAll("#page").forEach(function (element) {
        element.classList.remove("active");
    });
    e.target.classList.add("active");
    for (var i = startCurrentPage; i < endCurrentPage; i++) {
        if (allRows[i]) {
            allRows[i].classList.add("show");
        }
    }
}