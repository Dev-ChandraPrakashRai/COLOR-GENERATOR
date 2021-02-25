//global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjust = document.querySelectorAll(".close-adjustment")
const sliderContainers = document.querySelectorAll(".sliders")

let initialColors;
//local storage 
let savedPalettes = [];

//add evet listner
generateBtn.addEventListener("click", randomColors);
sliders.forEach(slider => {
    slider.addEventListener("input", hslcontrols)
});

colorDivs.forEach((div, index) => {
    div.addEventListener("change", () => {
        updateTextUI(index);
    })
});
currentHexes.forEach(hex => {
    hex.addEventListener("click", () => {
        copyToClipboard(hex);
    })
});
popup.addEventListener("transitionend", () => {
    const popupBox = popup.children[0];
    popup.classList.remove("active");
    popupBox.classList.remove("active");
});
adjustButton.forEach((button, index) => {
    button.addEventListener("click", () => {
        openAdjustPanel(index);
    });
});
closeAdjust.forEach((button, index) => {
    button.addEventListener("click", () => {
        closeAdjustPannel(index);
    })
})
lockButton.forEach((button, index) => {
    button.addEventListener("click", e => {
        lockLayer(e, index);
    });
});


//function


//color generator
function generateHex() {
    const hexColor = chroma.random();
    return hexColor;

}

function randomColors() {
    //
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        //add it to array

        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        }
        else {

            initialColors.push(chroma(randomColor).hex())
        }
        // add the colo to bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;



        //initial colorize sliders
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll(".sliders input");
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];
        colorizeSliders(color, hue, brightness, saturation);





    })
    //reset input
    resetInputs();
    //cheack the buttons contrast
    adjustButton.forEach((button, index) => {
        cheackTextContrast(initialColors[index], button);
        cheackTextContrast(initialColors[index], lockButton[index]);

    })
}
function cheackTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";

    }
    else {
        text.style.color = "white";
    }
}
function colorizeSliders(color, hue, brightness, saturation) {
    //scale saturation
    const noSat = color.set("hsl.s", 0);
    const fullSat = color.set("hsl.s", 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    //scale brightness
    const midBright = color.set("hsl.l", 0.5);
    const scaleBright = chroma.scale(["black", midBright, "white"]);
    // //scale hue
    // const noSat =color.set("hsl.s",0);
    // const fullSat=color.set("hsl.s",1); 
    // const scaleSat=chroma.scale([noSat,color,fullSat]);


    //update input color
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)},${scaleSat(1)})`
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(0)},${scaleBright(0.5)},${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,75,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,75),rgb(204,75,204 ))`

}
function hslcontrols(e) {
    const index =
        e.target.getAttribute("data-bright") ||
        e.target.getAttribute("data-sat") ||
        e.target.getAttribute("data-hue");
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    const bgcolor = initialColors[index];
    let color = chroma(bgcolor)
        .set("hsl.s", saturation.value)
        .set("hsl.l", brightness.value)
        .set("hsl.h", hue.value)
    colorDivs[index].style.backgroundColor = color;
    //colorize inuts/sliders
    colorizeSliders(color, hue, brightness, saturation);
}
function updateTextUI(index) {
    const activDiv = colorDivs[index];
    const color = chroma(activDiv.style.backgroundColor);
    const textHex = activDiv.querySelector("h2");
    const icons = activDiv.querySelectorAll(".controls button");
    textHex.innerText = color.hex();
    //cheack contrast
    cheackTextContrast(color, textHex)
    for (icon of icons) {
        cheackTextContrast(color, icon)
    }
}
function resetInputs() {
    const sliders = document.querySelectorAll(".sliders input")
    sliders.forEach(slider => {
        if (slider.name === "hue") {
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);

        }
        if (slider.name === "brightness") {
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;

        }
        if (slider.name === "saturation") {
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;

        }
    })

}
function copyToClipboard(hex) {
    const el = document.createElement("textarea");
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    //pop up ANIMATION
    const popupBox = popup.children[0];
    popup.classList.add("active");
    popupBox.classList.add("add");

}
function openAdjustPanel(index) {
    sliderContainers[index].classList.add("active");


}
function closeAdjustPannel(index) {
    sliderContainers[index].classList.remove("active");

}
function lockLayer(e, index) {
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");

    if (lockSVG.classList.contains("fa-lock-open")) {
        e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
        e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}

//implement save to palettes and local storage stuff
const saveBtn = document.querySelector(".save")
const submitSave = document.querySelector(".submit-save")
const closeSave = document.querySelector(".close-save")
const saveContainer = document.querySelector(".save-container")
const saveInput = document.querySelector(".save-container input");
const libraryContainer =document.querySelector(".library-container");
const closeLibraryBtn = document.querySelector(".library-close");
const libraryBtn =document.querySelector(".library");

//event listener
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savepalette);
libraryBtn.addEventListener("click",openl)
closeLibraryBtn.addEventListener("click",closelibrary)
function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add("active")
    popup.classList.add("active");

}

function closePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove("active")
    popup.classList.add("remove");
}
function savepalette(e) {
    saveContainer.classList.remove("active")
    popup.classList.remove("active")
    const name = saveInput.value;
    const colors = []
    currentHexes.forEach(hex => {
        colors.push(hex.innerText);
    });
    //generate obj
    let palettesNr = savedPalettes.length;
    const palettesObj = { name, colors, nr: palettesNr }
    savedPalettes.push(palettesObj);
    //save to LocalStorage
    savetoLocal(palettesObj)
    saveInput.value = "";
    //generate palettes for library
    const palette = document.createElement("div");
    palette.classList.add("custom-palette");
    const tittle=document.createElement("h4");
    tittle.innerText = palettesObj.name;
    const preview=document.createElement("div")
    preview.classList.add("small-preview");
    palettesObj.colors.forEach(smallcolor =>
        {
            const smallDiv=document.createElement("div");
            smallDiv.style.backgroundColor = smallcolor;
            preview.appendChild(smallDiv);

        });
        const paletteBtn=document.createElement("button");
        paletteBtn.classList.add("pick-palette-btn");
        paletteBtn.innerText="Select";


        //append to library
        palette.appendChild(tittle);
        palette.appendChild(preview)
        palette.appendChild(paletteBtn);
        libraryContainer.children[0].appendChild(palette);




}

function savetoLocal(palettesObj) {
    let localPalettes;
    if (localStorage.getItem("palettes") === null) {
        localPalettes = [];

    }
    else {
        localPalettes = JSON.parse(localStorage.getItem("palettes"));

    }
    localPalettes.push(palettesObj)
    localStorage.setItem("palettes", JSON.stringify(localPalettes))
}
function openl()
{
    console.log("hello bro")
    const popup =libraryContainer.children[0];
    libraryContainer.classList.add("active");
    popup.classList.add("active");
}
function closelibrary()
{
    const popup =libraryContainer.children[0];
    libraryContainer.classList.remove("active");
    popup.classList.remove("active");
}






randomColors();