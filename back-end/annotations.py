import shutil

import fitz  # PyMuPDF


class Reponse:
    def __init__(self, data, status):
        self.data = data
        self.status = status


def create_annotation(my_i, pdf_path, x0, y0, page_number):
    # pdf_path = 'pdfs/testingFile.pdf'  # temporary
    pdf_document = fitz.open(pdf_path)
    page = pdf_document.load_page(page_number)
    point = fitz.Point(x0, y0)  # top-left coordinates of the icon
    annot = page.add_text_annot(point, my_i)
    pdf_document.save("annotatedPdf.pdf")  # save changes in a new file
    shutil.move("annotatedPdf.pdf", pdf_path)  # move changes from annotatedPdf.pdf to the original file
    response_data = {"message": "Text processed and saved successfully"}
    return Reponse(response_data, 200)
