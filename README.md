# ChatVRM

<img src="https://github.com/Cloud-Dark/ChatVRM/blob/9d50c106cb971e9ef53cfff22e6ea9d75d61fe69/public/ogp-en.png" width="600">

[This repo was cloned from [ChatVRM-jp](https://github.com/Cloud-Dark/ChatVRM-jp), which is a fork of [@pixiv/ChatVRM](https://github.com/pixiv/ChatVRM).]

ChatVRM is a demo application that allows you to easily talk with a 3D character in your browser.

By importing VRM files, you can adjust the voice to match the character, and generate responses that include emotional expressions.

## ✨ New Features (Latest Updates)

- 🎤 **Dual Voice Providers** - Choose between ElevenLabs (premium AI voices) or Browser Speech Synthesis (free, built-in voices)
- 🔍 **Searchable Voice Dropdowns** - Easily find voices with Select2 search functionality
- 🎭 **4 VRM Model Presets** - Quick switch between Victoria, Nako, Cyber, and Miinaa models
- 🎛️ **Voice Customization** - Adjust pitch and speed for browser speech synthesis
- 💾 **Persistent Settings** - All your preferences saved in localStorage
- 🚀 **GitHub Pages Deploy** - Auto-deploy on push to main branch

ChatVRM mainly uses the following technologies.

- Generate response text
    - [OpenRouter](https://openrouter.ai/)
- User speech recognition
    - [Web Speech API (SpeechRecognition)](https://developer.mozilla.org/ja/docs/Web/API/SpeechRecognition)
- Text to speech
    - [ElevenLabs](https://beta.elevenlabs.io/) or **Browser Speech Synthesis** (Web Speech API)
- Displaying 3D characters
    - [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- Searchable dropdowns
    - [Select2](https://select2.org/)


## Demo

A demo is available at Vercel.

[https://chat-vrm-window.vercel.app/](https://chat-vrm-window.vercel.app/)

Or try the GitHub Pages deployment:

[https://cloud-dark.github.io/ChatVRM/](https://cloud-dark.github.io/ChatVRM/)


## Execution
Clone or download this repository to run locally.

```bash
git clone https://github.com/Cloud-Dark/ChatVRM.git
```

Please install the required packages.
```bash
npm install
```

After package installation is complete, start the development web server with the following command.
```bash
npm run dev
```

After execution, access the following URL.

[http://localhost:3001](http://localhost:3001)

## Deployment

### GitHub Pages (Automated)

This repository is configured for automatic deployment to GitHub Pages on every push to the `main` branch.

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy
3. View your site at: `https://cloud-dark.github.io/ChatVRM/`

To configure GitHub Pages:
1. Go to repository **Settings** → **Pages**
2. Under **Build and deployment**, select **Source: GitHub Actions**
3. Deployment will happen automatically on each push

### Vercel (Alternative)

You can also deploy to Vercel by connecting your GitHub repository. 


## How to integrate with livestream

ChatVRM supports reading chat messages from a livestream and generating responses, via the Restream API. Currently, X and Twitch sources are supported. It uses a batching system so that the LLM is called for each batch of messages, not for each message.

### Quick Start

1. **Choose Voice Provider** (Settings or Intro modal):
   - **ElevenLabs**: High-quality AI voices (requires API key)
   - **Browser Speech Synthesis**: Free built-in voices (no API needed)

2. **Configure Settings**:
   - Set OpenRouter API key (for LLM access)
   - Set ElevenLabs API key (if using ElevenLabs)
   - Select your preferred voice from the dropdown
   - Choose a VRM avatar model (or upload custom)
   - Set custom system prompt for your character

3. **Setup Restream**:
   - Get your Restream authentication tokens from [Restream Token Fetcher](https://restream-token-fetcher.vercel.app/)
   - Paste the tokens JSON in Settings
   - Click "Start Listening"

4. **Go Live**:
   - Start your livestream using Restream
   - ChatVRM will automatically respond to chat messages

### Troubleshooting

- **Not receiving messages?** Try:
  - Click "Stop Listening" then "Start Listening" again
  - Get fresh Restream tokens
  - Refresh the ChatVRM page

- **Voice not working?** Check:
  - API key is valid (for ElevenLabs)
  - Correct voice is selected
  - Browser supports speech synthesis (for free option)

- **Wrong voice gender?** (e.g., Nanami sounds male)
  - Refresh the page after selecting voice
  - Check console logs for voice selection confirmation
  - Try selecting voice again from dropdown
