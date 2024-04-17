const {contextBridge , ipcRenderer } = require('electron')
const axios = require('axios'); 

/*
function createPDF(path) {
  const responseText = document.getElementById('responseContainer').textContent;
  fetch('http://127.0.0.1:5000/api/TextTransform', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: "pdf", title: "testing", text: responseText, fileName: "testingFile" , path:path}),
  })
    .then(response => response.json())
    .then(data => {
      alert("Operation Success");

    })
    .catch(error => {
      console.error('Error:', error);
    });
}
*/

/*
function createTXT(path) {
  const responseText = document.getElementById('responseContainer').textContent;
  fetch('http://127.0.0.1:5000/api/TextTransform', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: "txt", title: "testing", text: responseText, fileName: "testingFile", path:path }),
  })
    .then(response => response.json())
    .then(data => {
      alert("Operation Success");

    })
    .catch(error => {
      console.error('Error:', error);
    });

}
*/


function showDialogPDF() 
{
  ipcRenderer.send('openDialog');
  ipcRenderer.on('selectedFile', (event, data) => {
    console.log("-------------------------> data: ", data)

    
      const responseText = document.getElementById('responseContainer').innerHTML;
      axios.post('http://127.0.0.1:5000/api/TextTransform', {
        type: "pdf",
        title: "",
        text: responseText,
        fileName: data.fileName,
        path: data.directoryPath
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
      
      console.log("tararampam ")
    
    
  });
}
function showDialogRTF()
{
  ipcRenderer.send('openDialog');
  ipcRenderer.on('selectedFile',  (event, data) => {
    console.log("-------------------------> data: ", data)

    // console.log("---------------------------> filePath :", filePath);
    const responseText = document.getElementById('responseContainer').innerHTML;
    axios.post('http://127.0.0.1:5000/api/TextTransform', {
      type: "txt",
      title: "",
      text: responseText,
      fileName: data.fileName,
      path: data.directoryPath
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
    
       console.log("tararampam ")
  });
}
contextBridge.exposeInMainWorld('exported_functions', {
  showPopup: () => {  
    ipcRenderer.send('show-popup');},
    showDialog:()=>{
      createTXT=document.getElementById("createTXT")
      createPDF=document.getElementById("createPDF")
     
      createTXT.addEventListener('mouseup', () => {
        showDialogRTF();
        console.log("rtf clicked");
      });
      createPDF.addEventListener('mouseup', () => {
      showDialogPDF();
      console.log("pdf clicked");
      });
  
      
    }

})