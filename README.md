# POG Audit Dashboard

A dashboard for auditing and tracking planogram (POG) capture issues across product categories.

## Features

- **Audit Table** – Add, edit, and delete audit entries with filters (category, retailer, issue type) and search
- **Presentation View** – Summary cards, charts (issues by category, issue type distribution), and a findings table
- **Export to CSV** – Download audit data for backup or further analysis

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data Storage

- **Local:** Audit data is stored in `data/audits.json`. The file is created automatically when you add your first entry.
- **Vercel:** When deployed to Vercel, data is stored in [Vercel Blob](https://vercel.com/docs/storage/vercel-blob). Create a Blob store in your project's Storage tab — `BLOB_READ_WRITE_TOKEN` is added automatically.

## Usage

- **Audit Table** – Use the "Add Entry" button to record new POG capture issues. Filter and sort to review specific categories or retailers.
- **Presentation** – Switch to the Presentation view to share findings. Use the filters to focus on specific subsets during your meeting.
- **Export CSV** – Use "Export CSV" on either view to download the current dataset.
