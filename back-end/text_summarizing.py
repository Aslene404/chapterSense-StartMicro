import platform

import openai
import pytesseract
from PIL import Image


def read_text_from_image(image_path):
    system = platform.system()

    if system.lower() == 'linux':
        print("Running on Linux")
        pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'
    elif system.lower() == 'darwin':
        print("Running on macOS")
        pytesseract.pytesseract.tesseract_cmd = r'/opt/homebrew/Cellar/tesseract/5.3.2_1/bin/tesseract'
    elif system.lower() == 'windows':
        print("Running on Windows")
        pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    else:
        print("Running on", system)

    # Open the image using PIL (Python Imaging Library)
    image = Image.open(image_path)
    # Perform OCR to extract text from the image

    text = pytesseract.image_to_string(image,  # lang="deu"
                                       )
    print("----------------------text------------------ :", text)

    return text


def call_language_model(prompt, key):
    
    openai.api_key = key
    print(key)
    
    # prompt_len=4097-len(prompt)
    # chat_completion = openai.ChatCompletion.create(model="gpt-3.5-turbo",messages=[{"role": "user", "content": prompt}])

    # print the chat completion

    # response = openai.Completion.create(
    #     engine="text-davinci-003",  # Engine ID, choose the appropriate one for your needs
    #     prompt=prompt,
    #     max_tokens=3000  # Maximum length of the response
    # )

    chat_completion = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k",
                                                   messages=[{"role": "user", "content": prompt}])

    # print the chat completion
    print(chat_completion.choices[0].message.content)
    # Extract and print the response text

    if chat_completion:
        # print(chat_completion.choices[0].message.content)
        # print(response['choices'][0]['text'])
        return chat_completion.choices[0].message.content
        # return response.choices[0].message.content
    # else:
    #     print(f"Error: {response.status_code} - {response.text}")
    #     return None
