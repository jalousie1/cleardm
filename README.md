# Discord Message Manager

## Overview

Discord Message Manager is a web application designed to streamline the process of managing Discord messages. It allows users to connect to Discord via their token, load direct messages from selected channels, and delete messages in bulk while keeping track of progress and logs. The application is built using HTML, JavaScript, and Bootstrap for the frontend and a Node.js backend.

## Features

- **Authentication**: Securely connect to your Discord account using your token.
- **Channel Selection**: Choose specific DM channels to manage messages.
- **Message Management**:
  - Load messages from selected channels.
  - Bulk delete messages with progress tracking and log details.
- **Progress Visualization**:
  - Toggle between progress bar and log views for message deletion.
- **Tutorial**: Step-by-step instructions to retrieve your Discord token.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jalousie1/cleardm.git
   cd discord-message-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Open the application in your browser at `http://localhost:3000`.

## Usage

1. Enter your Discord token in the input field and click **Connect to Discord**.
2. Select a DM channel from the dropdown list.
3. Load messages from the selected channel by clicking **Load Messages**.
4. Delete messages in bulk using the **Delete Messages** button. Use the **Stop** button to interrupt the process at any time.

### How to Retrieve Your Discord Token

Follow the instructions provided in the **Tutorial** section of the application to obtain your Discord token safely.

## Technologies Used

- **Frontend**: HTML, Bootstrap, JavaScript
- **Backend**: Node.js, Express
- **API Integration**: Discord API for message management

## Future Enhancements

- Implement message filtering options (e.g., date range, keywords).
- Support for additional Discord features (e.g., managing server messages).

## License

This project is not under a specific license and is for educational purposes only. Use it responsibly and within the limits of the law and Discord's Terms of Service.
