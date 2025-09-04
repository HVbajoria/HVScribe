# **App Name**: LessonForge

## Core Features:

- Homepage Introduction: Landing page explaining the app's purpose: generating textual lessons.
- Data Input Choice: Choice between uploading an Excel file or manual text input.
- Excel File Upload: Allows users to upload an Excel file (.xlsx) with 'Lesson Name' and 'Slides' columns. Handles file parsing and data extraction.
- Markdown Generation: Utilizes Gemini 2.0 Flash model to generate lesson content in markdown format based on the provided lesson name and slides content. The Gemini tool reasons about which content to use.
- Markdown Rendering: Renders the generated markdown content for each row into a human-readable format. This will apply styles correctly so the lessons look nicely formatted.
- Doc File Creation: For each lesson, generate a .doc file from the rendered markdown content.
- Zip Archive Download: Combines all generated .doc files into a single zip archive, which is then made available for user download.
- Processing Animation: Displays a visual animation with estimated time remaining during the content generation and file processing stages.

## Style Guidelines:

- Primary color: Dark Purple (#7952B3) to inspire confidence and intelligence, reflecting the nature of generating lessons.
- Background color: Very light desaturated purple (#F2EFF7).
- Accent color: Analogous dark blue (#526AB3), for highlighting buttons and active elements.
- Font pairing: 'Belleza' (sans-serif) for headings, 'Alegreya' (serif) for body text. 'Belleza' provides a unique stylistic flair, and 'Alegreya' offers the comfortable readability required for larger amounts of text.
- Use clear, simple icons to represent file upload, download, and processing states. Icons should be monochromatic and consistent in style.
- A clean, intuitive layout is crucial. Use a card-based design for lessons and progress indicators, with clear visual hierarchy.
- A loading animation to give an impression about how long the gemini flash model will take for content generation