document.addEventListener("DOMContentLoaded", main());

function main() {
    getData();
};

function getData() {
    $.ajax({
        url: "../json/dane.json",
        dataType: 'text',
        success: function (data) {
            var str = data.replace(/\}\,\n\]/g, '}\n]');
            arr = JSON.parse(str);
            var txt = "";
            for (x in arr) {
                txt += "<tr><th scope='row' data-sort='id'>" + arr[x].id + "</th><td data-sort='firstName'>" + arr[x].firstName + "</td><td data-sort='lastName'>" + arr[x].lastName + "</td><td data-sort='birthDate'>" + convertDate(arr[x].dateOfBirth) + "</td><td data-sort='company'>" + arr[x].company + "</td><td data-sort='note'>" + arr[x].note + "</td></tr>";
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
        var columsHead = document.querySelectorAll("thead th");
        for (var i = 0; i < columsHead.length; i++) {
            columsHead[i].addEventListener("click", sortBy);
        }
    });
}

function sortBy(e) {
    //var tableBody = document.querySelector("tbody");
    var sortByData = e.target.getAttribute("data-sort");
    var ifEnd = false;
    var searchCell;
    var rows, cell1, cell2;
    var count = 0;
    if (sortByData == "id") {
        searchCell = "th[data-sort='" + sortByData + "']";
    } else {
        searchCell = "td[data-sort='" + sortByData + "']";
    };
    while (!ifEnd) {
        rows = document.querySelectorAll("tbody tr");
        for (var i = 0; i < rows.length-1; i++) {
            cell1 = rows[i].querySelector(searchCell);
            //console.log(cell1.innerHTML)
            cell2 = rows[i + 1].querySelector(searchCell);
            //console.log(cell2.innerHTML)
            if (cell1.innerHTML > cell2.innerHTML) {
                console.log(cell1.innerHTML.toLowerCase())
                console.log(cell2.innerHTML.toLowerCase())
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                ifEnd = false;
                break;   
            }
            ifEnd = true;
        }
        count++
        console.log("conunt")
        console.log(count)
    }
}

function convertDate (date){
    var day, month, year;
    var zero = "0";
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    var monthsArr = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"]
    date = date.slice(0, date.indexOf(" ")).replace(/\./g, "-");
    day = date.slice(0, date.indexOf("-"));
    month = date.slice(day.length+1, date.indexOf("-", day.length+1));
    year = date.slice(day.length + month.length + 2, date.length);
    month = monthsArr[Number(month)-1]
    if (day.length  == 1){
        day = zero.concat(day);
    } else if (month.length == 1){
        month = zero.concat(month);
    }
    //date = new Date (year, month, day);
    return day + " " + month + " " + year
    //date.toLocaleString('en-US', options);
}
