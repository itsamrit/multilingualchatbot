import { streamGemini } from './bot-api.js';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let languageInput = document.getElementById('language-input');
let businessTypePicker = document.getElementById('business-type-picker');
let industryPicker = document.getElementById('industry-picker');
let output = document.querySelector('.output');

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Load the image as a base64 string
    let imageUrl = form.elements.namedItem('chosen-image').value;
    let imageBase64 = await fetch(imageUrl)
      .then(r => r.arrayBuffer())
      .then(a => base64js.fromByteArray(new Uint8Array(a)));

    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
          { text: 'Ignore the provided image' + 'and give the data about ' + businessTypePicker.value + ' and also provide data about ' + industryPicker.value + '.'+ 'The question is' +  promptInput.value+ 'Please Provide the answer in' + languageInput.value }
        ]
      }
    ];

    // Call the gemini-pro-vision model, and get a stream of results
    let stream = streamGemini({
      model: 'gemini-pro-vision',
      contents,
    });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new markdownit();
    for await (let chunk of stream) {
      buffer.push(chunk);
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

document.getElementById('language-input').addEventListener('input', function() {
  var language = this.value.trim();
  var businessTypePicker = document.getElementById('business-type-picker');
  var industryPicker = document.getElementById('industry-picker');

  if (language) {
      businessTypePicker.style.display = 'block';
      industryPicker.style.display = 'block';
  } else {
      businessTypePicker.style.display = 'none';
      industryPicker.style.display = 'none';
  }
});

