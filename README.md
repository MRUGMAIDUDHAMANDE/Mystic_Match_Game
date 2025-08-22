# Mystic_Match_Game

This is a memory game.  
Match all the pairs to win.  
Choose your difficulty and test your skills.

## 🎮 Features
- Dark mode with neon blue highlights
- Easy, Medium, and Hard difficulty modes
- Animated UI with smooth flip and hover effects
- Responsive design (Desktop, Tablet, Mobile)

## 🕹️ How to Play
0. Login to game page.I have used Email.js to get information about person playing game.
1. Select a mode (**Easy**, **Medium**, or **Hard**).
2. Click **Play** to start the game.
3. Flip the cards to reveal images.
4. Match all pairs to win.
5. Check your performance (time, moves, matches) in the results popup.

## 📜 Rules
- You can only flip **two cards at a time**.  
- If the cards **match**, they stay revealed.  
- If the cards **do not match**, they flip back automatically.  
- The game ends once **all pairs are matched**.  
- Your **score depends on moves and time taken** (except in Easy mode).  

## ℹ️ Difficulty Modes
- **Easy Mode** 🟢  
  - Unlimited moves and unlimited time.  
  - You will never lose — just play casually and enjoy.  
- **Medium Mode** 🟡  
  - Limited moves and time (balanced challenge).  
  - You must finish before moves or time run out.  
- **Hard Mode** 🔴  
  - Strict limits on moves and time.  
  - Requires sharp memory and fast thinking to win.  

## 📊 Performance Tracking
At the end of each game, you can view:  
- Total moves taken  --> According to Mode
- Time spent         --> According to Mode
- Whether you won or lost (Medium/Hard only)  

## 🛠️ Tech Stack
- **HTML5** – Game structure and layout.  
- **CSS3** – Styling, animations, and responsive design.  
- **JavaScript (ES6)** – Game logic, interactivity, and mode handling.  
- **EmailJS** – For getting information about person playing game via email.  

## 📂 Project File Structure

Mystic_Match_Game/
 ┣ 📂 assets/             
 ┃ ┣ 📂 cards/            
 ┃ ┣ 📂 info_assets/      
 ┃ ┣ 📂 logos/ 
 | |
 ┣ 📂 script/                 
 ┃ ┗ 📜 config.js           
 ┃ ┗ 📜 game_info.js           
 ┃ ┗ 📜 game.js            
 ┃ ┗ 📜 login.js
 | |
 ┣ 📂 style/                
 ┃ ┣ 📜 cursor.css         
 ┃ ┣ 📜 game_info.css          
 ┃ ┣ 📜 game.css 
 ┃ ┣ 📜 index.css  
 ┃ ┗ 📜 style.css  
 | | 
 ┣ 📜 index.html          
 ┣ 📜 game.html   
 ┣ 📜 game_info.html           
 | |                               
 ┗ 📜 README.md 

 ## 🌍 Live Demo
👉 [Play Mystic Match Game](https://MRUGMAIDUDHAMANDE.github.io/Mystic_Match_Game/)           

## ⚡ Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MRUGMAIDUDHAMANDE/Mystic_Match_Game.git
