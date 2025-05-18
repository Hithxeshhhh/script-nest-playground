# CodeBuddy - Modern JavaScript Playground


**CodeBuddy** is a modern, browser-based JavaScript playground that allows you to write, run, and experiment with JavaScript code in a clean, intuitive interface. Perfect for learning, testing ideas, or solving coding problems on the go.

## ✨ Features

- **Live JavaScript Execution** - Write and run JavaScript code directly in your browser
- **Interactive Console** - See your output in a dedicated console area
- **User Input Support** - Get user input using the `prompt()` function
- **Code Persistence** - Your code is automatically saved to local storage
- **Syntax Highlighting** - Powered by CodeMirror for a great coding experience
- **Coding Tips** - Built-in hints and examples to help you learn JavaScript
- **Responsive Design** - Works on desktop and mobile devices
- **Modern UI** - Clean, intuitive interface with dark mode support

## 🚀 Quick Start

### Online Demo

Visit [codebuddy.vercel.app](https://codebuddy.vercel.app) to start coding right away!

### Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codebuddy.git

# Navigate to the project directory
cd codebuddy

# Install dependencies
npm install

# Start the development server
npm run dev
```

Now open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## 📖 How to Use

1. **Write Your Code** - Type your JavaScript code in the editor area
2. **Run Your Code** - Click the "Run Code" button to execute
3. **View Results** - See the output in the console below
4. **Get User Input** - Use `prompt("Your question")` for user input
5. **Learn from Tips** - Check out the tips section for JavaScript examples

### Example Code

```javascript
// Basic input/output
const name = prompt("What's your name?");
console.log(`Hello, ${name}!`);

// Working with arrays
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled numbers:", doubled);

// Using async/await
async function fetchData() {
  try {
    console.log("Fetching data...");
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await response.json();
    console.log("Fetched data:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchData();
```

## 🔮 Coming Soon

- **More Programming Languages** - Support for Python, TypeScript, C++, and Java
- **Code Sharing** - Share your code snippets with others
- **Themes** - Choose between different editor themes
- **Custom Settings** - Personalize your coding environment
- **Export Options** - Download your code in various formats

## 🔧 Technologies Used

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [CodeMirror](https://codemirror.net/) - Code editor component
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve CodeBuddy.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

