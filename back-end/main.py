import base64
import os

from flask import Flask, request, jsonify

from annotations import create_annotation
from text_summarizing import read_text_from_image, call_language_model
from text_transforming import TextToPdf, TextToRtf
from utils import string_display
import json

app = Flask(__name__)

global_keys = None





@app.route('/api/hello')
def hello():
    # system = platform.system()
    # node_name = platform.node()
    # release = platform.release()
    # machine = platform.machine()
    # python_version = platform.python_version()
    # python_compiler = platform.python_compiler()
    #
    # platform_info = {
    #     "System": system,
    #     "Node Name": node_name,
    #     "Release Version": release,
    #     "Processor Architecture": machine,
    #     "Python Version": python_version,
    #     "Python Compiler": python_compiler
    # }
    # ai_question = """ich möchte, dass du mir hilfst ein #Buch Kapitelweise zusammenzufassen.
    # Es ist wichtig die Zusammenfassung Quote zu berücksichtigen.
    # Ich unterscheide zwischen 3 Quoten: Kurz, Mittel, Lang, die Quote gibt an um wieviel Prozent soll der Text zusammengefasst werden.
    # Kurz heißt nur 30% der Länge soll übrig bleiben, Mittel 50% und Lang 70%. Verstanden?"""
    ai_question = """Ich brauche deine Hilfe, um ein Kapitel zusammenzufassen. Dazu werde ich dir das gesamte Kapitel Absatz für Absatz zur Verfügung stellen. Jedes Mal werde ich dir einen Absatz aus diesem Kapitel und damit einen Wert aus diesen drei Werten 30, 50 und 70, falls vorhanden, zur Verfügung stellen. Der Wert ist 30 dann möchte ich dass du nur 30 % dieses Textes zusammenfassen. Wenn der Wert 50 % beträgt, solltest du 50 % dieses Textes zusammenfassen, und wenn der Wert 70 % beträgt, solltest du 70 % des Textes zusammenfassen. Die Meinung des Textes soll beibehalten werden. Als Antwort gibt es mir nur den zusammengefassten Text zurück. D.h ohne mich noch mal zu fragen was meine Meinung ist oder um wieviel Prozent du den Text zusammengefasst hast."""
    for item in global_keys:
        print(item)
        first_response = call_language_model(ai_question, item)

    return first_response


@app.route('/api/receive_key', methods=['POST'])
def receive_key():
    global global_keys
    try:
        data = request.get_json()

        

        global_keys = data['keys']

        response = {"message": "API key received and processed successfully"}
        return jsonify(response), 200

    except Exception as e:
        response = {"error": str(e)}
        return jsonify(response), 500


@app.route('/api/upload', methods=['POST'])
def upload_image_array():
    global global_keys
    local_key=string_display(global_keys)

    data = request.json
    image_data_array = data['image_data_array']

    saved_paths = []  # To store the paths of saved images
    summarized_texts = []
    if image_data_array:
        # Create a new directory to save images if it doesn't exist
        save_dir = 'tmp'  # Replace with the actual directory path
        if not os.path.exists(save_dir):
            os.makedirs(save_dir)

        for index, image_entry in enumerate(image_data_array):
            img_data = image_entry['image'].split(',')[1]
            img_data = base64.b64decode(img_data)

            percentage = image_entry['percentage']
            print('percentage value', percentage)

            save_path = os.path.join(save_dir, f'image_{index}.png')
            with open(save_path, 'wb') as f:
                f.write(img_data)

            saved_paths.append(save_path)

            extracted_text = read_text_from_image(save_path)  # Extract text from the image

            length = str(percentage) + '%'
            ai_question = length+ ":"+ extracted_text

            summarized_text = call_language_model(ai_question, local_key)
            summarized_texts.append(summarized_text)

        print("------------------------------rendered text after summarization --------------------------------------")
        result = "".join(summarized_texts)
        print("All summarized texts:", result)
        print("------------------------------------------text finished-----------------------------------------------")

        return jsonify({'message': summarized_texts})

        # max_tokens_per_chunk = 3000
        # chunked_text = split_into_chunks(extracted_text, max_tokens_per_chunk)

        # ai_response = ""

        # for i, chunk in enumerate(chunked_text):
        #     print(f"Chunk {i + 1}:", chunk)
        #     ai_question = 'restate this text : ' + chunk
        #     summarized_text =  call_language_model(ai_question)
        #     ai_response += summarized_text



    else:
        return jsonify({'message': 'No image data received'})


@app.route('/api/TextTransform', methods=['POST'])
def TextTransform():
    # get  data from the request 
    data = request.get_json()
    Filetype = data.get('type')
    title = data.get('title')
    text = data.get('text')
    fileName = data.get('fileName')
    path = data.get('path')
    # print("type :", Filetype, "title :", title, "text :", text, "fileName :", fileName, "path :" , path)

    if (Filetype.lower() == "pdf"):
        response = TextToPdf(fileName, title, text, path)
        # print("------------------------------>", response.data)

        return jsonify(response.data), response.status
    else:
        print("its an RTF")
        response = TextToRtf(fileName, title, text, path)
        return jsonify(response.data), response.status


@app.route('/api/annotation', methods=['POST'])
def add_annotation():
    data = request.get_json()
    pdf_path = data.get('pdf_path')
    x0 = data.get('x0')
    y0 = data.get('y0')
    page_number = int(data.get('page'))
    print(page_number)
    my_i = data.get('my_i')
    response = create_annotation(my_i, pdf_path, x0, y0, page_number)
    return jsonify(response.data), response.status


@app.route('/api/save_progress', methods=['POST'])
def save_progress():
    data = request.get_json()
    # Save the object to a file

    with open("progress.json", "w") as file:
        json.dump(data, file)
    return data


@app.route('/api/get_progress')
def get_progress():
    file_path = "progress.json"

    # Open the file for reading
    with open(file_path, "r") as file:
        # Load the JSON data from the file into a Python object
        json_object = json.load(file)
    return json_object


if __name__ == '__main__':
    app.run()
