# Government of Canada AI Registry
2025-11-30

An unofficial interactive web application for exploring the Government of Canada's AI inventory.

**Disclaimer**: This website is not affiliated with the Government of Canada. It is an unofficial visualization of the open dataset.

Vibe-coded in Google Antigravity with Gemini and Claude. I have no expereince with web development, I just prompted until it worked.

## Features

- **Semantic Search**: Find AI projects by concept (e.g., "fraud detection", "chatbots") even when exact keywords aren't used
- **Bilingual**: Switch between English and French
- **Filters**: Filter table by department, development source, users, personal information usage, AI notification status, and project status
- **Expandable Details**: Click to view additional project details including descriptions, capabilities, and results

## Data Source

This application displays data from the official Government of Canada AI Register:

- **Announcement**: [Canada launches first register of AI uses in federal government](https://www.canada.ca/en/treasury-board-secretariat/news/2025/11/canada-launches-first-register-of-ai-uses-in-federal-government.html)
- **Open Data Page**: [Government of Canada AI Register (Minimum Viable Product)](https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b)
- **Data Dictionary**: [Government of Canada AI Register (MVP) - Resource Details](https://open.canada.ca/data/en/dataset/fcbc0200-79ba-4fa4-94a6-00e32facea6b/resource/369f6f34-148a-42ed-b581-8c164e941a89)

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS v4
- **Semantic Search**: 
  - Server-side: `sentence-transformers` (Python) for embedding generation
  - Client-side: `@xenova/transformers` for query embedding
- **Data Processing**: Python (pandas, sentence-transformers)

## Setup

### Required Software

- Node.js (v16 or higher)
- Python 3.9+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "GoC AI Registry"
```

2. Install Python dependencies:
```bash
pip install pandas sentence-transformers
```

3. Install Node.js dependencies:
```bash
npm install
```

### Data Processing

Process the CSV data and generate embeddings:

```bash
python3 scripts/process_data.py
```

This will:

- Split the data into English (`public/data_en.json`) and French (`public/data_fr.json`)

- Clean and normalize field values

- Generate semantic search embeddings for all records

### Development

Run the development server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Deployment

The application is a static site. Deploy the `dist` folder to any static hosting service (e.g. GitHub Pages).


## Project Structure

```
GoC AI Registry/
├── data/                    # Source data
│   └── gc-ai-register-mvp-registre-de-lia-du-gc-pmv.csv
├── scripts/                 # Data processing scripts
│   └── process_data.py     # Generates embeddings and splits EN/FR data
├── public/                  # Static assets and processed data
│   ├── data_en.json        # English dataset with embeddings
│   └── data_fr.json        # French dataset with embeddings
├── src/                     # React application source
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   ├── index.css           # Global styles (Tailwind)
│   └── lib/
│       └── search.js       # Semantic search logic
├── dist/                    # Production build output
├── index.html              # HTML template
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.cjs     # Tailwind CSS configuration
└── postcss.config.cjs      # PostCSS configuration
```

## How Semantic Search Works

1. **Data Processing** (Python):
   - Each AI project is converted into an embedding vector using the `all-MiniLM-L6-v2` model
   - Embeddings capture the semantic meaning of the project (name, description, capabilities, etc.)
   - Pre-computed embeddings are stored in the JSON files

2. **Search** (Browser):
   - User's search query is converted to an embedding using `@xenova/transformers`
   - Cosine similarity is computed between the query and all project embeddings
   - Results are ranked by similarity score

This approach enables concept-based search without requiring exact keyword matches.

## License

The source data is provided by the Government of Canada under the [Open Government Licence - Canada](https://open.canada.ca/en/open-government-licence-canada).

The software is licensed under the terms of the MIT license