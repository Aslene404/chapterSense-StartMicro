// Variables used for PDF processing and selection
let textValue = null;
const screenshot = new Image();
const button = document.getElementById('restart_button');
button.addEventListener('click', handleClick);
function handleClick() {

  const modal = document.getElementById("alert");
  modal.classList.add("active");
  overlay.style.display = 'block';

  const okButton = modal.querySelector("[alert-ok-button]");
  okButton.addEventListener("click", () => {
    modal.classList.remove("active");
    overlay.style.display = 'none';
    width = 0;
    height = 0;
    document.querySelector(".skript-button").disabled = true;
    document.getElementById("container").style.backgroundColor = "rgba(0, 0, 0, 0.15)";
    document.getElementById('responseContainer').innerHTML = "\n          ";
    button.disabled = true;

  })
  const cancelButton = modal.querySelector("[alert-cancel-button]");
  cancelButton.addEventListener("click", () => {
    // Close the modal without proceeding
    modal.classList.remove("active");
    overlay.style.display = 'none';
    width = 0;
    height = 0;

  });
}



let saved_progress;
axios.get('http://127.0.0.1:5000/api/get_progress')
  .then(response => {
    return response.data;
  })
  .then(data => {
    saved_progress = data;
    console.log(saved_progress);
    if (saved_progress.progress != "\n          ") {

      document.querySelector(".skript-button").removeAttribute("disabled");
      document.getElementById("container").style.backgroundColor = "white";
      button.removeAttribute("disabled");


      document.getElementById('responseContainer').innerHTML = saved_progress.progress;
      // Select images by class name within the container
      var imagesToRemove = document.getElementById('responseContainer').getElementsByClassName("savePictureMode");

      // Loop through and remove the selected images
      while (imagesToRemove.length > 0) {
        imagesToRemove[0].parentNode.removeChild(imagesToRemove[0]);
      }
      // Select elements by class name within the container
      var elementsToRemove = document.getElementById('responseContainer').getElementsByClassName("reTransformMode");

      // Loop through and remove the selected elements
      while (elementsToRemove.length > 0) {
        elementsToRemove[0].parentNode.removeChild(elementsToRemove[0]);
      }


    }
  }

  )
  .catch();

const intervalId = setInterval(save_progress, 10000);
let pdfData;
let isSelecting = false;
let selectionStartX, selectionStartY;
let width, height;
let stringArray = [];
const zoomStep = 0.1;
let scale = 1;
let scaleZoom = 1;

let capturedImages = [];
let Percentages = [];
document.getElementById("run_button").setAttribute("disabled", "true");
document.getElementById("run_button_image").classList.add("disabled")
// Append a new value if it doesn't exist
function appendUniqueValue(value) {
  if (!stringArray.includes(value)) {
    stringArray.push(value);
  }
}
const spinner_overlay = document.getElementById("spinner_over");
spinner_overlay.style.display = "none";
let selectedPageNumber; // Store the selected page number
exported_functions.showDialog();
// Function to read PDF file as an array buffer
async function readPDF(file) {
  // Using a Promise to handle asynchronous file reading
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
// Function to render the PDF pages with the specified scale
async function renderPDFPagesToFillContainer() {
  const pdfContainer = document.getElementById('pdfContainer');
  pdfContainer.innerHTML = '';
  let numPages = pdfDoc.numPages;
  const containerWidth = pdfContainer.clientWidth;


  // Ensure targetPage is within valid bounds
  let targetPage;
  if (saved_progress) {
    targetPage = parseInt(saved_progress.page_number);
  } else {
    targetPage = 1;
  }
  if (targetPage < 1) {
    targetPage = 1;
  } else if (targetPage > numPages) {
    targetPage = numPages;
  }



  for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
    const canvas = document.createElement('canvas');
    pdfContainer.appendChild(canvas);
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const context = canvas.getContext('2d');
    // Reset the canvas transform to the identity matrix
    context.setTransform(1, 0, 0, 1, 0, 0);
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };
    await page.render(renderContext);
    if (pageNumber === targetPage) {
      // Scroll to the target page (optional)
      canvas.scrollIntoView({ behavior: 'smooth' });
    }

  }
}
// Attach event listener to PDF input
document.getElementById("pdfInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  handlePDFInput(file);
  const filePath = file.path;
  localStorage.setItem("pdf_path", filePath);
});
document.getElementById('zoomInButton').addEventListener('click', () => {
  scaleZoom += zoomStep;
  if (scaleZoom > 1.3) {
    scaleZoom = 1.3;
  }
  updateZoom(scaleZoom);
});
document.getElementById('zoomOutButton').addEventListener('click', () => {
  scaleZoom -= zoomStep;
  if (scaleZoom < 0.5) {
    scaleZoom = 0.5;
  }
  if (scaleZoom > 1) {
    scaleZoom = 1;
  }
  updateZoom(scaleZoom);
});
document.getElementById('resetZoomButton').addEventListener('click', () => {
  scaleZoom = 1
  updateZoom(1);
});

async function updateZoom(scale) {
  const pdfContainer = document.getElementById('pdfContainer');
  const canvasElements = pdfContainer.getElementsByTagName('canvas');
  for (let i = 0; i < canvasElements.length; i++) {
    const canvas = canvasElements[i];
    canvas.style.transform = `scale(${scale})`;
    if (scale < 1) {
      canvas.style.marginBottom = `-${(1 - scale) * 130}%`;
      canvasElements[0].style.marginTop = `-${(1 - scale) * 60}%`
    } else if (scale > 1) {
      canvas.style.marginBottom = `${(scale - 1) * 150}%`;
      canvasElements[0].style.marginTop = `${(scale - 1) * 60}%`
      canvas.style.marginLeft = `${(scale - 1) * 50}%`
    }
    else {
      canvas.style.margin = ''
    }

  }
}

/*const debouncedResizeHandler = _.debounce(loadAndRenderPDF, 1000);
window.addEventListener('resize', debouncedResizeHandler);*/

async function loadAndRenderPDF() {
  pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
  const pdfContainer = document.getElementById('pdfContainer');
  pdfContainer.style.backgroundColor = '';
  renderPDFPagesToFillContainer();
  const zoomButtons = document.getElementById('zoomButtons')
  zoomButtons.removeAttribute("disabled");
  zoomButtons.style.display = ""
}
// Call this function when loading a new PDF
async function handlePDFInput(file) {
  try {
    if (file && file.type === "application/pdf") {
      pdfData = await readPDF(file);
      loadAndRenderPDF();
    } else {
      console.error("Invalid file format. Please select a PDF file.");
    }
  } catch (err) {
    console.error("Error during file upload:", err);
  }
}
// Event listeners for mouse actions to create a selection rectangle
const pdfContainer = document.getElementById("pdfContainer");
const selectionCanvas = document.getElementById("selectionCanvas");
const selectionContext = selectionCanvas.getContext("2d");

pdfContainer.addEventListener("mousedown", (event) => {
  isSelecting = true;
  selectionStartX = event.clientX;
  selectionStartY = event.clientY;
  // Find the selected page number based on the mouse click position
  const pdfPageCanvasList = pdfContainer.getElementsByTagName("canvas");
  for (let i = 0; i < pdfPageCanvasList.length; i++) {
    const pdfPageCanvas = pdfPageCanvasList[i];
    const rect = pdfPageCanvas.getBoundingClientRect();
    if (
      selectionStartX >= rect.left &&
      selectionStartX <= rect.right &&
      selectionStartY >= rect.top &&
      selectionStartY <= rect.bottom
    ) {
      selectedPageNumber = i + 1;
      localStorage.setItem("page", selectedPageNumber - 1);
      break;
    }
  }
});

document.addEventListener("mousemove", (event) => {
  if (isSelecting) {
    const zoomButtons = document.getElementById('zoomButtons')
    zoomButtons.style.display = "none";
    // Update the selection rectangle dimensions while the mouse is moved
    const pdfPageCanvas = pdfContainer.lastChild; // Get the last canvas of the rendered PDF page
    const containerRect = pdfContainer.getBoundingClientRect(); // Get the bounding rectangle of the pdfContainer
    const scaleFactor = pdfPageCanvas.width / pdfPageCanvas.offsetWidth; // Scale factor to account for resizing
    // Adjust the mouse coordinates to match the canvas coordinates
    const selectionEndX = event.clientX; //(event.clientX - containerRect.left) * scaleFactor;
    const selectionEndY = event.clientY; //(event.clientY - containerRect.top) * scaleFactor;
    width = Math.abs(selectionEndX - selectionStartX);
    height = Math.abs(selectionEndY - selectionStartY);
    const left = Math.min(selectionStartX, selectionEndX);
    const top = Math.min(selectionStartY, selectionEndY);
    // Update the selection canvas to show the rectangle
    selectionCanvas.width = width;
    selectionCanvas.height = height;
    selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
    selectionContext.setLineDash([5, 5]);
    selectionContext.strokeStyle = "#D17F39";
    selectionContext.lineWidth = 6;
    selectionContext.strokeRect(0, 0, width, height);
    selectionCanvas.style.left = left + "px";
    selectionCanvas.style.top = top + "px";
  }
});

const titleInput = document.getElementById("textInput");
const optionsList = document.getElementById("options");
// Function to add a new value to the array and the datalist
function appendUniqueValue(value) {
  if (!stringArray.includes(value)) {
    stringArray.push(value);
    const option = document.createElement("option");
    option.value = value;
    optionsList.appendChild(option);
    if (optionsList.childNodes.length > 4) {
      optionsList.removeChild(optionsList.childNodes[0]);
    }
  }
}
titleInput.addEventListener("focus", () => {
  titleInput.setAttribute("list", "options");
});
titleInput.addEventListener("blur", () => {
  titleInput.removeAttribute("list");
});
document.addEventListener("click", (event) => {
  if (!titleInput.contains(event.target)) {
    titleInput.removeAttribute("list");
  }
});
optionsList.addEventListener("input", (event) => {
  titleInput.value = event.target.value;
});

document.addEventListener("mouseup", async () => {
  if (isSelecting) {
    isSelecting = false;
    titleInput.value = "";
    const captureCanvas = document.createElement("canvas");
    captureCanvas.width = width; // Use the width of the selection
    captureCanvas.height = height; // Use the height of the selection
    const captureContext = captureCanvas.getContext("2d");
    const pdfPageCanvasList = pdfContainer.getElementsByTagName("canvas");
    const pdfPageCanvas = pdfPageCanvasList[selectedPageNumber - 1];
    let scaleFactor = (pdfPageCanvas.width / pdfPageCanvas.offsetWidth); // Scale factor to account for resizing

    if (scaleZoom != 1) {
      scaleFactor = (pdfPageCanvas.width / pdfPageCanvas.offsetWidth) / scaleZoom;
    }

    // Draw the selected area from the PDF canvas onto the capture canvas
    captureContext.drawImage(
      pdfPageCanvas,
      (selectionStartX - pdfPageCanvas.getBoundingClientRect().left) *
      scaleFactor, // X-coordinate of the top-left corner of the selection adjusted for the scale factor and offset
      (selectionStartY - pdfPageCanvas.getBoundingClientRect().top) *
      scaleFactor, // Y-coordinate of the top-left corner of the selection adjusted for the scale factor and offset
      width * scaleFactor, // Width of the selection adjusted for the scale factor
      height * scaleFactor, // Height of the selection adjusted for the scale factor
      0, // Destination X-coordinate on the capture canvas
      0, // Destination Y-coordinate on the capture canvas
      width, // Destination width on the capture canvas (no need to adjust here)
      height // Destination height on the capture canvas (no need to adjust here)
    );
    let imgData = captureCanvas.toDataURL("image/png");
    
    screenshot.src = imgData;

    localStorage.setItem("x0", selectionStartX);
    localStorage.setItem("y0", selectionStartY);
    // Check if the selection contour has been drawn (width and height are greater than 0)
    if (width > 0 && height > 0) {
      // Display the modal

      const modal = document.querySelector(".modal-class");
      modal.classList.add("active");
      overlay.style.display = 'block';
      let isImageDisplayed = false;
      const okButton = modal.querySelector("[data-ok-button]");
      const imageCheckbox = document.getElementById("imageCheckbox");
      const imageOptions = document.getElementById('imageOptions');
      const imageTitle = document.getElementById('imageTitle');
      const texttTitle = document.getElementById("textTitle");
      const textOptions = document.getElementById("titleOptions")
      const summaryOptions = document.getElementById('summaryOptions');
      const summaryTitle = document.getElementById('summaryTitle');
      imageCheckbox.addEventListener('change', () => {
        if (imageCheckbox.checked) {
          summaryOptions.style.display = 'none';
          summaryTitle.style.display = 'none'
          imageOptions.style.display = 'block';
          texttTitle.style.display = 'none';
          textOptions.style.display = "none";
          imageTitle.style.display = 'block'
        } else {
          summaryOptions.style.display = 'block';
          imageOptions.style.display = 'none';
          summaryTitle.style.display = 'block'
          imageTitle.style.display = 'none';
          texttTitle.style.display = 'blcok';
          textOptions.style.display = "block";


        }
      });
      okButton.addEventListener("click", () => {
        // Close the modal

        document.getElementById("run_button").removeAttribute("disabled");
        document.getElementById("run_button_image").classList.remove("disabled")
        const zoomButtons = document.getElementById('zoomButtons')
        zoomButtons.style.display = "";
        modal.classList.remove("active");
        overlay.style.display = 'none';
        width = 0;
        height = 0;
        selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
        // Get the checkbox state
        const imageCheckbox = document.getElementById("imageCheckbox");
        const exkursCheckbox = document.getElementById("exkursCheckbox");
        const isImageSelected = imageCheckbox.checked;
        const isExkursSelected = exkursCheckbox.checked;
        // Get the entered title from the input field
        const titleInput = document.getElementById("textInput");
        // Add label to Array
        appendUniqueValue(titleInput.value);
        // Get the selected summary option
        const summaryOptions = document.getElementsByName('summaryOption');
        let selectedValue = null;
        // Iterate through the radio buttons to find the selected one
        for (const option of summaryOptions) {
          if (option.checked) {
            selectedValue = option.value;
            break; // Exit the loop when the selected option is found
          }
        }
        const imageOptions = document.getElementsByName('imageOption');
        let imageValue = null;
        // Iterate through the radio buttons to find the selected one
        for (const option of imageOptions) {
          if (option.checked) {
            imageValue = option.value;
            break; // Exit the loop when the selected option is found
          }
        }
        const titleOptions = document.getElementsByName('titleOption');
        // Iterate through the radio buttons to find the selected one
        for (const option of titleOptions) {
          if (option.checked) {
            textValue = option.value;
            console.log(textValue);
            break; // Exit the loop when the selected option is found
          }
        }
        Percentages.push(selectedValue);
        // API upload
        if (isImageSelected) {
          if (!isImageDisplayed && imgData!=null) {
            // Create the wrapper for centered content
            const container = document.getElementById("container");
            container.style.backgroundColor = "white";
            const restartButton = document.getElementById("restart_button");
            restartButton.removeAttribute("disabled");
            const centeredWrapper = document.createElement("div");
            const imageContainer = document.createElement("div");

            if (imageValue != "middle") {
              centeredWrapper.classList.add(`${imageValue.toLowerCase()}-image`);
            }
            else {
              centeredWrapper.classList.add("centered-image");
            }
            // Create the image element 
            imageContainer.classList.add("savePictureMode");
            const responseImage = document.createElement("img");
            responseImage.src = screenshot.src;
            responseImage.alt = titleInput.value; // Set the title as the image alt text
            centeredWrapper.appendChild(responseImage);
            // Display the title under the image
            const titleText = document.createElement("p");
            titleText.textContent = titleInput.value;
            centeredWrapper.appendChild(titleText);
            imageContainer.appendChild(centeredWrapper);
            const imageElement = document.createElement("img");
            imageElement.src = "../../assets/check.png";
            imageElement.classList.add("cornerCheckImage");
            imageContainer.appendChild(imageElement);
            imageElement.setAttribute("id", "imgId");
            const crossElement = document.createElement("img");
            crossElement.src = "../../assets/cross.png";
            crossElement.classList.add("cornerCrossImage");
            imageContainer.appendChild(crossElement);
            crossElement.setAttribute("id", "imgId2");
            imageElement.addEventListener("click", function (event) {
              imageContainer.classList.remove("savePictureMode")
              imageContainer.removeChild(imageElement)
              imageContainer.removeChild(crossElement)
            });
            crossElement.addEventListener("click", function (event) {
              imageContainer.classList.remove("savePictureMode")

              imageContainer.removeChild(imageElement)
              imageContainer.removeChild(crossElement)
              imageContainer.removeChild(centeredWrapper);
              imageContainer.removeChild(responseTitle);
              imageContainer.removeChild(titleText);

            });
            responseContainer.appendChild(imageContainer);


            // Append the centered content to the response container
            // responseContainer.appendChild(centeredWrapper);
            isImageDisplayed = true; // Set the flag to true
            screenshot.src = null;
            titleInput.value = null;
            // add annotation to file
            const storedpath = localStorage.getItem("pdf_path");
            const storedx0 = localStorage.getItem("x0");
            const storedy0 = localStorage.getItem("y0");
            const storedpage = localStorage.getItem("page");
            const skriptButton = document.querySelector(".skript-button");
            skriptButton.removeAttribute("disabled");
            imgData = null;
            // add_annotation(storedpath,storedpage,storedx0,storedy0,imageTitle);
          }
        }
        else {
          if (imgData != null) {
            capturedImages.push(imgData);
            imgData=null;
          }

        }
      });

      // Handle modal "Cancel" button click event
      const cancelButton = modal.querySelector("[data-cancel-button]");
      cancelButton.addEventListener("click", () => {
        // Close the modal without proceeding
        modal.classList.remove("active");
        overlay.style.display = 'none';
        screenshot.src = null;
        selectionContext.clearRect(0, 0, selectionCanvas.width, selectionCanvas.height);
        width = 0;
        height = 0;
        const titleInput = document.getElementById("textInput");
        titleInput.value = null;
        isImageDisplayed = true;
        const zoomButtons = document.getElementById('zoomButtons')
        zoomButtons.style.display = "";
      });
    }

  }

});
const runButton = document.getElementById("run_button");

runButton.addEventListener("click", () => {

  document.getElementById("run_button").setAttribute("disabled", true);
  document.getElementById("run_button_image").classList.add("disabled")


  validTransformation = false;

  spinner_overlay.style.display = "flex";
  screenshot.src = null;
  const titleInput = document.getElementById("textInput");
  const temptitleInput = titleInput.value;
  const responseContainer = document.getElementById("responseContainer");
  const HoleParagraphContainer = document.createElement("div");
  HoleParagraphContainer.classList.add("reTransformMode");
  if (textValue != "h2" && temptitleInput != '') {
    const responseTitle = document.createElement(textValue);
    responseTitle.textContent = temptitleInput;
    responseTitle.classList.add("p-3");
    HoleParagraphContainer.appendChild(responseTitle);
  }
  else {
    const responseTitle = document.createElement("h2");
    responseTitle.textContent = temptitleInput;
    responseTitle.classList.add("p-3");
    HoleParagraphContainer.appendChild(responseTitle);
  }


  let PercentagesWithoutNulls = Percentages.filter(value => value !== null);
  isImageDisplayed = true;
  let combinedArray = capturedImages.map((image, index) => ({
    image,
    percentage: PercentagesWithoutNulls[index]
  }));
  if (combinedArray.length > 0) {
    const requestData = {
      image_data_array: combinedArray,
      label: temptitleInput
    };
    axios.post("http://127.0.0.1:5000/api/upload", requestData, {
      headers: {
        "Content-Type": "application/json",
      }
    })
      .then(response => {
        capturedImages = [];
        combinedArray = [];
        imgData = null;
        // Assuming the API response contains JSON data, you should use response.data
        return response.data;
      })
      .then(data => {
        titleInput.value = null;

        spinner_overlay.style.display = "none";
        // const responseContainer = document.getElementById("responseContainer");
        // const HoleParagraphContainer = document.createElement("div");
        // HoleParagraphContainer.classList.add("reTransformMode");
        // const responseTitle = document.createElement("h1");
        // responseTitle.textContent = temptitleInput;
        // responseTitle.classList.add("p-3");
        // HoleParagraphContainer.appendChild(responseTitle);
        const responseText = document.createElement("p");
        responseText.textContent = data.message;
        responseText.classList.add("p-3");
        responseText.setAttribute("id", "idProvisoire");
        HoleParagraphContainer.appendChild(responseText);
        const skriptButton = document.querySelector(".skript-button");
        const container = document.getElementById("container");
        container.style.backgroundColor = "white";
        const restartButton = document.getElementById("restart_button");
        restartButton.removeAttribute("disabled");
        skriptButton.removeAttribute("disabled");
        const imageElement = document.createElement("img");
        imageElement.src = "../../assets/check.png";
        imageElement.classList.add("cornerCheckImage");
        HoleParagraphContainer.appendChild(imageElement);
        imageElement.setAttribute("id", "imgId");
        const crossElement = document.createElement("img");
        crossElement.src = "../../assets/cross.png";
        crossElement.classList.add("cornerCrossImage");
        HoleParagraphContainer.appendChild(crossElement);
        crossElement.setAttribute("id", "imgId2");
        imageElement.addEventListener("click", function (event) {
          localStorage.setItem("validTransformation", true);
          HoleParagraphContainer.classList.remove('reTransformMode')
          HoleParagraphContainer.removeChild(imageElement)
          HoleParagraphContainer.removeChild(crossElement)
          localStorage.setItem("selectionPrevented", false)
          localStorage.setItem("nbClickRuningMan", 0)

          responseText.id = ""
        });
        crossElement.addEventListener("click", function (event) {
          HoleParagraphContainer.classList.remove('reTransformMode')
          HoleParagraphContainer.removeChild(imageElement)
          HoleParagraphContainer.removeChild(crossElement)
          HoleParagraphContainer.removeChild(responseText);

          HoleParagraphContainer.innerHTML = "";


        });


        responseContainer.appendChild(HoleParagraphContainer);
        // add annotation to file
        const storedpath = localStorage.getItem("pdf_path");
        const storedx0 = localStorage.getItem("x0");
        const storedy0 = localStorage.getItem("y0");
        const storedpage = localStorage.getItem("page");
        // add_annotation(storedpath,storedpage,storedx0,storedy0,imageTitle);
      })
      .catch((error) => {
        spinner_overlay.style.display = "none";
        console.error("Error:", error);
      });
  }
  // else {
  //   const responseText = document.getElementById("idProvisoire")
  //   spinner_overlay.style.display = "flex";
  //   axios.post("http://127.0.0.1:5000/api/upload", {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ image_data: imgData }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       spinner_overlay.style.display = "none";
  //       responseText.textContent = data.message;
  //     })
  // }


});

function add_annotation(pdf_path, page, x0, y0, my_i) {
  spinner_overlay.style.display = "flex";
  axios.post("http://127.0.0.1:5000/api/annotation", {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pdf_path: pdf_path,
      page: page,
      x0: x0,
      y0: y0,
      my_i: my_i,
    }),
  })
    .then((response) => { return response.data })
    .then((data) => {
      spinner_overlay.style.display = "none";
    })
    .catch((error) => {
      spinner_overlay.style.display = "none";
      console.error("Error:", error);
    });
}
function save_progress() {
  let storedpage = localStorage.getItem("page");
  let num = parseInt(storedpage) + 1;
  storedpage = num.toString();



  const responseText = document.getElementById('responseContainer').innerHTML;
  axios.post("http://127.0.0.1:5000/api/save_progress", {
    page_number: storedpage,
    progress: responseText
  }, {
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      console.log("Progress Saved !!!!", response);
      // You might choose to return response.data if the API sends some specific data in response
    })
    .catch(error => {
      console.log(error);
    });
}
