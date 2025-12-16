# Relationship Countdown App ❤️

A personal, offline-first web application to celebrate your relationship. Track your anniversary, save memories, and customize your experience with a beautiful, private interface.

## Features

- **Countdown Timer**: See exactly how long you've been together in years, months, days, hours, minutes, and seconds.
- **Memories Gallery**: Store your favorite photos locally on your device.
- **Profile Customization**: Set profile pictures for you and your partner.
- **Themes**: Choose from various themes (Couple, Birthday, Wedding, etc.) and color palettes.
- **Music Player**: Background music to set the mood.
- **Privacy First**: All data (photos, settings, messages) is stored locally in your browser (IndexedDB & LocalStorage). No data is sent to the cloud.
- **PWA Support**: Installable as a progressive web app on your mobile device.

## Tech Stack

- **Frontend**: React.js
- **Styling**: CSS (Theme-based variables)
- **Storage**: IndexedDB (via `idb` pattern) & LocalStorage
- **Build Tool**: Vite

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/subahdeepmistri/Relationship-countdown.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd Relationship-countdown
    ```
3.  Install dependencies:
    ```bash
    cd frontend
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## Usage

- **First Launch**: You will be guided through a setup process to choose your anniversary date, type, and photos.
- **Settings**: Click the gear icon to customize notifications, themes, and manage your data.
- **Memories**: Add photos to your private gallery. They are stored safely on your device.

## License

This project is for personal use.
