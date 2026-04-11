fetch("/navbar")
.then(res => res.text())
.then(data => {
    document.getElementById("navbar").innerHTML = data
})