document.addEventListener("DOMContentLoaded", main());

function main (){
    $.getJSON("json/dane.json", function(data){
        console.log(data);
    })
}