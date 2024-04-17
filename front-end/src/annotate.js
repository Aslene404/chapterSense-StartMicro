
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
//<script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>-->
//<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.6.1-rc1/pdf-lib.min.js" integrity="sha512-L2L1Z1f+Nh0R4DnvxxORV/o3w+E64xOUXmHt7UA6lbfhFwVfoHuegdTFdE95V+R7Bt9HT80POXfRD99ddU69XA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>-->
//<script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.13.0/dist/pdf-lib.min.js"></script>

async function  AddAnnotation(file)
{
  const pdfDoc = await PDFDocument.load(file)
// Embed the Helvetica font
const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
// Get the first page of the document
const pages = pdfDoc.getPages()
const firstPage = pages[0]
// Draw a string of text diagonally across the first page
firstPage.drawText('This text was added with JavaScript!', {
  x: 5,
  y: height / 2 + 300,
  size: 50,
  font: helveticaFont,
  color: rgb(0.95, 0.1, 0.1),
  rotate: degrees(-45),
})
// Serialize the PDFDocument to bytes (a Uint8Array)
const pdfBytes = await pdfDoc.save()
}
    
