# AI-Enhanced Kanban Board

![Dashboard Preview](https://via.placeholder.com/800x400/1e293b/ffffff?text=AI+Kanban+Board+Dashboard)

A modern, interactive Kanban board built with **React** and **Tailwind CSS**, featuring generative AI integration to help break down complex tasks into actionable sub-steps automatically.

## 🚀 Features

- **🤖 AI Task Breakdown**: One-click generation of sub-steps using Google's **Gemini 2.5 Flash** model.
- **📋 Kanban Workflow**: Intuitive "To Do", "In Progress", and "Done" columns.
- **🖱️ Drag & Drop**: Smooth drag-and-drop experience powered by `@dnd-kit`.
- **💾 Local Persistence**: Tasks are automatically saved to your browser's local storage.
- **✨ Modern UI**: sleek, dark-mode interface styled with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State/DnD**: @dnd-kit/core
- **AI Integration**: Google GenAI SDK (@google/genai)
- **Build Tool**: Vite

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-kanban-board.git
   cd ai-kanban-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Security is a priority. Never commit your API keys. 
   Create a `.env` file in the root directory based on the example provided:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and add your Google Gemini API Key:
   ```env
   # Get your key at https://aistudio.google.com/
   API_KEY=your_actual_api_key_here
   ```

   > **Note**: This project uses `process.env.API_KEY` for demonstration purposes. Ensure your build tool (e.g., Vite) is configured to expose this variable securely or use a backend proxy for production.

4. **Run the application**
   ```bash
   npm run dev
   ```

## 📸 Screenshots

| Task Creation | AI Breakdown |
|:---:|:---:|
| ![Task Creation](https://via.placeholder.com/400x300/1e293b/ffffff?text=New+Task+Modal) | ![AI Breakdown](https://via.placeholder.com/400x300/1e293b/ffffff?text=AI+Generated+Steps) |

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
