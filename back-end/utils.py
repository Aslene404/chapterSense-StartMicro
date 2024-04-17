def split_into_chunks(text, max_tokens):
    chunks = []
    current_chunk = ""

    # Split the text into words or tokens (depending on your model)
    tokens = text.split()  # Split by spaces, adjust based on your tokenization

    for token in tokens:
        # Check if adding the token exceeds the max_tokens limit
        if len(current_chunk.split()) + len(token.split()) <= max_tokens:
            current_chunk += token + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = token + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


def string_display(strings):
    if not hasattr(string_display, "index"):
        string_display.index = 0

    current_index = string_display.index % len(strings)
    string_to_display = strings[current_index]

    # Increment the index for the next call
    string_display.index += 1

    return string_to_display
