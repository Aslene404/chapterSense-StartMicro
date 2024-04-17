import os
import platform

import pdfkit
import pypandoc


class Reponse:
    def __init__(self, data, status):
        self.data = data
        self.status = status


def TextToPdf(fileName, title, text, path):
    system = platform.system()
    if system.lower() == 'linux':
        print("Running on Linux")
        wkhtmltopdf_path = r'/usr/local/bin/wkhtmltopdf'

    elif system.lower() == 'darwin':
        print("Running on macOS")
        wkhtmltopdf_path = r'/usr/local/bin/wkhtmltopdf'
    elif system.lower() == 'windows':
        print("Running on Windows")
        wkhtmltopdf_path = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
    else:
        print("Running on", system)

    # Specify the path to the wkhtmltopdf executable

    # Configure pdfkit with the executable path
    config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
    try:
        if not os.path.exists("pdfs"):
            os.makedirs("pdfs")
            print(f"Folder 'pdfs' created.")
        if not os.path.exists("htmls"):
            os.makedirs("htmls")
            print(f"Folder 'pdfs' created.")
        style_content = """<style>
    label.upload-button {
      display: inline-block;
      background-color: #7BAF8A;
      color: white;
      cursor: pointer;
      border-radius: 5px;
      border: none;
      margin-bottom: 10px;
      height: 40px;
      width: 200px
    }

    .skript-button[disabled] {
      display: inline-block;
      cursor: pointer;
      border-radius: 5px;
      border: none;
      margin-bottom: 10px;
      opacity: 0.2;
      background-color: #7BAF8A;
      color: white;
      height: 40px;
      width: 200px;

    }

    html {
      padding: 0;
      margin: 0;
    }

    .main_content {
      background-color: #ECCD7C;
      padding: 0;
      height: 100vh;
      width: 100%;
      display: flex;
      flex-direction: column;

    }

    .row.full-height {
      height: 90vh;
      /* Add the desired padding */
    }

    .content-container {
      height: 100%;
      overflow: auto;
    }

    .btn {
      display: inline-block;
      background-color: #7BAF8A;
      color: white;
      cursor: pointer;
      border-radius: 5px;
      border: none;
      margin-bottom: 10px;
      height: 40px;
      width: 200px;
    }

    footer {
      background-color: #D17F39;
      text-align: left;
      z-index: 900;
      position: fixed;
      bottom: 0;
      width: 100%;
      /* Make the footer span the entire width */
    }

    footer p {
      margin-left: 50px;
    }

    .modal-class {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      transition: 200ms ease-in-out;
      background-color: #7BAF8A;
      border-radius: 10px;
      width: 260px;
      height: 245px;
      padding: 10px 10px;
      z-index: 10;

    }

    .active {
      transform: translate(-50%, -50%) scale(1);
    }

    .title-modal{
      font-weight:600; 
      padding: 5px 5px;
    }

    #zoomInButton,
    #zoomOutButton,
    #resetZoomButton {
      height: 40px;
      background-color: rgba(0, 0, 0, 0.6);
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: background-color 0.3s ease-in-out;
    }

    #zoomInButton:hover,
    #zoomOutButton:hover,
    #resetZoomButton:hover {
      background-color: rgba(0, 0, 0, 0.8);
    }

    .close-button {
      cursor: pointer;
      border: none;
      outline: none;
      background: none;
      font-size: 1.25rem;
    }

    .input-title {
      display: flex;
      width: 240px;
      padding: 10px;
      margin-top: 5px;
      border: none;
      outline: none;
      border-radius: 10px;
    }

    .modal-button {
      background-color: #D9D9D9;
      border: none;
      width: 80px;
      border-radius: 10px;
      height: 40px;
    }

    .centered-image {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
      /* Center horizontally */
      text-align: center;
    }

    .overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      /* Semi-transparent black background */
    }

    #spinner_overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black overlay */
      align-items: center;
      justify-content: center;
    }

    #summaryOption {
     margin-left: 5px;
    }

    .img {
      cursor: pointer;
      width: 50px;
      height: 50px;
    }

    .img.disabled{
      opacity: 0.5;
    }
    
  </style>"""
        html_content = ("\n"
                        "        <!DOCTYPE html>\n"
                        "        <html>\n"
                        "        <head>\n" + style_content +
                        "            <title>" + title + "</title>\n"
                                                        "        </head>\n"
                                                        "        <body>\n" + text +
                        "        </body>\n"
                        "        </html>\n"
                        "        ")
        with open('htmls/test.html', 'w') as html_file:
            html_file.write(html_content)
        input_html = 'htmls/test.html'

        pdf_filename = os.path.join(path, fileName + ".pdf")

        pdfkit.from_file(input_html, pdf_filename, configuration=config)

        response_data = {"message": "Text processed and saved successfully", "filename": pdf_filename}
        return Reponse(response_data, 200)

        # ------------------> Return the generated PDF as a Flask response
    # response = Response(pdf_buffer, content_type='application/pdf')
    # response.headers['Content-Disposition'] = 'inline; filename=generated_pdf.pdf'
    # return response

    except Exception as e:
        error_message = {"error": str(e)}
        return Reponse(error_message, 400)


def TextToTxt(fileName, title, text, path):
    try:
        if not os.path.exists("txts"):
            os.makedirs("txts")
            print(f"Folder 'txts' created.")
        # Save the text as a .txt file on the server's filesystem

        # txt_filename = os.path.join('txts', fileName + ".txt")
        txt_filename = os.path.join(path, fileName + ".txt")

        with open(txt_filename, 'w') as txt_file:
            txt_file.write(text)

        response_data = {"message": "Text processed and saved successfully", "filename": txt_filename}

        return Reponse(response_data, 200)

    except Exception as e:
        error_message = {"error": str(e)}
        return Reponse(error_message, 400)


def TextToRtf(fileName, title, text, path):
    if not os.path.exists("rtfs"):
        os.makedirs("rtfs")
        print(f"Folder 'rtfs' created.")
    if not os.path.exists("htmls"):
        os.makedirs("htmls")
        print(f"Folder 'htmls' created.")
    style_content = """<style>
          label.upload-button {
            display: inline-block;
            background-color: #7BAF8A;
            color: white;
            cursor: pointer;
            border-radius: 5px;
            border: none;
            margin-bottom: 10px;
            height: 40px;
            width: 200px
          }

          .skript-button[disabled] {
            display: inline-block;
            cursor: pointer;
            border-radius: 5px;
            border: none;
            margin-bottom: 10px;
            opacity: 0.2;
            background-color: #7BAF8A;
            color: white;
            height: 40px;
            width: 200px;

          }

          html {
            padding: 0;
            margin: 0;
          }

          .main_content {
            background-color: #ECCD7C;
            padding: 0;
            height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;

          }

          .row.full-height {
            height: 90vh;
            /* Add the desired padding */
          }

          .content-container {
            height: 100%;
            overflow: auto;
          }

          .btn {
            display: inline-block;
            background-color: #7BAF8A;
            color: white;
            cursor: pointer;
            border-radius: 5px;
            border: none;
            margin-bottom: 10px;
            height: 40px;
            width: 200px;
          }

          footer {
            background-color: #D17F39;
            text-align: left;
            z-index: 900;
            position: fixed;
            bottom: 0;
            width: 100%;
            /* Make the footer span the entire width */
          }

          footer p {
            margin-left: 50px;
          }

          .modal-class {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            transition: 200ms ease-in-out;
            background-color: #7BAF8A;
            border-radius: 10px;
            width: 260px;
            height: 245px;
            padding: 10px 10px;
            z-index: 10;

          }

          .active {
            transform: translate(-50%, -50%) scale(1);
          }

          .title-modal{
            font-weight:600; 
            padding: 5px 5px;
          }

          #zoomInButton,
          #zoomOutButton,
          #resetZoomButton {
            height: 40px;
            background-color: rgba(0, 0, 0, 0.6);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background-color 0.3s ease-in-out;
          }

          #zoomInButton:hover,
          #zoomOutButton:hover,
          #resetZoomButton:hover {
            background-color: rgba(0, 0, 0, 0.8);
          }

          .close-button {
            cursor: pointer;
            border: none;
            outline: none;
            background: none;
            font-size: 1.25rem;
          }

          .input-title {
            display: flex;
            width: 240px;
            padding: 10px;
            margin-top: 5px;
            border: none;
            outline: none;
            border-radius: 10px;
          }

          .modal-button {
            background-color: #D9D9D9;
            border: none;
            width: 80px;
            border-radius: 10px;
            height: 40px;
          }

          .centered-image {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
            /* Center horizontally */
            text-align: center;
          }

          .overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            /* Semi-transparent black background */
          }

          #spinner_overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black overlay */
            align-items: center;
            justify-content: center;
          }

          #summaryOption {
           margin-left: 5px;
          }

          .img {
            cursor: pointer;
            width: 50px;
            height: 50px;
          }

          .img.disabled{
            opacity: 0.5;
          }

        </style>"""
    html_content = ("\n"
                    "        <!DOCTYPE html>\n"
                    "        <html>\n"
                    "        <head>\n" + style_content +
                    "            <title>" + title + "</title>\n"
                                                    "        </head>\n"
                                                    "        <body>\n" + text +
                    "        </body>\n"
                    "        </html>\n"
                    "        ")
    with open('htmls/test.html', 'w') as html_file:
        html_file.write(html_content)

    txt_filename = os.path.join(path, fileName + ".rtf")
    html_file_path = 'htmls/test.html'
    docx_file_path = 'rtfs/output.docx'
    # extra_args = [
    #     '--reference-doc=your_styles.docx',  # Use a Word document as a reference for styles
    #     '--extract-media=./media',  # Extract media files to the 'media' folder
    # ]

    output = pypandoc.convert_file(html_file_path, 'docx', outputfile=docx_file_path)
    pypandoc.convert_file(docx_file_path, 'docx', outputfile=txt_filename)

    print(f"Conversion complete.")

    response_data = {"message": "Text processed and saved successfully", "filename": "done"}

    return Reponse(response_data, 200)
