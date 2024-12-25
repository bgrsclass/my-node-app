const express = require('express');
const Groq = require('groq-sdk');
const client = new Groq({ apiKey: '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' });

const app = express();
const port = 3000;

// Array to store responses
const searchHistory = [];

app.use(express.static('public'));

// Main route
app.get('/', async (req, res) => {
  const searchTerm = req.query.query || '';
  let formattedResponses = '';

  if (searchTerm.toLowerCase() === 'clear chat') {
    // Clear chat history if the search term is "clear chat"
    searchHistory.length = 0;
    formattedResponses = `  
      <div class="response-container">
        <h2>The chat history has been cleared.</h2>
      </div>
    `;
  } else if (searchTerm) {
    try {
      const chatCompletion = await client.chat.completions.create({
        "messages": [{ "role": "user", "content": searchTerm }],
        "model": "llama3-70b-8192",
        "temperature": 1,
        "max_tokens": 1024,
        "top_p": 1,
        "stream": true,
        "stop": null
      });

      let responseText = '';
      for await (const chunk of chatCompletion) {
        responseText += chunk.choices[0]?.delta?.content || '';
      }

      responseText = responseText.replace(/\*\*/g, '').trim();

      // Save response to search history
      searchHistory.push({ term: searchTerm, response: responseText });

      // Prepare formatted response with MathJax for rendering mathematical equations
      formattedResponses = ` 
      <div class="message-container">
        <div class="user-message">
          <span class="highlight">Question:</span> ${searchTerm}
        </div>
        <div class="bot-message">
          <span class="highlight">Answer:</span> ${responseText}
        </div>
      </div>
    `;
    
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
      return;
    }
  } else {
    // Welcome message when no search term is provided
    formattedResponses = `  
      <div class="response-container">
        <h2>Welcome to the Teacher's Chatbot</h2>
        <p>Ask your questions below, and I will assist you with clear and structured answers!</p>
      </div>
    `;
  }

  // Only generate the output for the latest query
  res.send(`
    <html>
      <head>
        <script type="text/javascript" async
          src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML">
        </script>
        <style>
          /* Highlight class for headings */
          .highlight {
            font-size: 20px;
            font-weight: 700;
            color:rgb(54, 46, 204);
            text-transform: uppercase;
            text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
          }

          .message-container .user-message,
          .message-container .bot-message {
            padding: 15px 20px;
            border-radius: 20px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 18px;
            color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .user-message {
            background-color: #3498db;
            align-self: flex-start;
          }

          .bot-message {
            background-color: rgb(234, 214, 31);
            align-self: flex-end;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f7fa;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
            margin: 0;
            overflow: hidden; /* Prevent scrolling */
          }

          .chat-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            transition: transform 0.3s ease;
          }

          .header {
            background: linear-gradient(135deg, #2c3e50, #3498db);
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
          }

          .main-content {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: 100%;
          }

          .scroll-container {
            max-height: calc(100vh - 220px); /* Adjust height based on header and input */
            overflow-y: auto;
            padding: 25px;
            flex-grow: 1;
            background-color: #f5f5f5;
            border-top: 2px solid #3498db;
          }

          .message-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
          }

          .user-message, .bot-message {
            padding: 15px 20px;
            border-radius: 20px;
            max-width: 80%;
            word-wrap: break-word;
            font-size: 18px;
            color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .user-message {
            background-color: #3498db;
            align-self: flex-start;
          }

          .search-container {
            padding: 20px;
            display: flex;
            justify-content: center;
            gap: 20px;
            background-color: #ffffff;
            border-top: 1px solid #ddd;
            border-bottom-left-radius: 12px;
            border-bottom-right-radius: 12px;
          }

          .search-container input[type="text"] {
            padding: 15px 20px;
            font-size: 18px;
            border-radius: 20px;
            border: 1px solid #ccd1d9;
            width: 75%;
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .search-container input[type="text"]:focus {
            border-color: #3498db;
            outline: none;
            box-shadow: 0 0 5px rgba(52, 152, 219, 0.7);
          }

          .search-container button {
            padding: 15px 20px;
            font-size: 18px;
            color: white;
            background-color: #3498db;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
          }

          .search-container button:hover {
            background-color: #2980b9;
            transform: scale(1.05);
          }

          /* Smooth Scrollbar */
          .scroll-container::-webkit-scrollbar {
            width: 8px;
          }

          .scroll-container::-webkit-scrollbar-thumb {
            background: #3498db;
            border-radius: 10px;
          }

          .scroll-container::-webkit-scrollbar-thumb:hover {
            background: #2980b9;
          }
        </style>
      </head>
      <body>
        <div class="chat-container">
          <div class="header">
            Teacher's Chatbot
          </div>
          <div class="main-content">
            <div class="scroll-container">
              ${formattedResponses}
            </div>
            <div class="search-container">
              <form action="/" method="get">
                <input type="text" name="query" placeholder="Ask your question..." required>
                <button type="submit">Ask</button>
              </form>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
