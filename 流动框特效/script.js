var back = document.getElementById("back")
var pixaldata = []
var pixallife = 300
window.addEventListener("mousemove", function (evt) {
    var span = document.createElement("span")
    span.className = "pixal"
    back.appendChild(span)
    pixaldata.push({
        age: 0,
        color: "rgba(" +
            parseInt(Math.random() * 255) + "," +
            parseInt(Math.random() * 255) + "," +
            parseInt(Math.random() * 255) + "," +
            parseInt(Math.random() * 255) + ")",
        vx: Math.random() * 0.5,
        vy: Math.random() * 0.75,
        sx: evt.x,
        sy: evt.y
    })
})

function draw() {
    for (var i = 0; i < pixaldata.length; i++) {
        pixal = pixaldata[i]
        children = back.children[i]
        pixal.age++
        pixal.sx += pixal.vx * 2
        pixal.sy += pixal.vy * 2
        children.style.background = pixal.color
        children.style.left = pixal.sx + "px"
        children.style.top = pixal.sy + "px"
        if (pixal.age > pixallife) {
            pixaldata.splice(i, 1)
            back.removeChild(back.childNodes[i])
        }
    }
}

setInterval(draw, 1)