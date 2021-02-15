function CreateDom1(content, who) {
    let div = document.createElement("div");
    let p = document.createElement("p")
    p.innerText = content
    div.appendChild(p)
    document.body.appendChild(div)
    //let text = $("<input type=\"text\">").css({ "width": "150px", "border": "1px lightgrey solid" }).appendTo($("body"));
}