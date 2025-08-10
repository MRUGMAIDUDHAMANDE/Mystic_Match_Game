window.addEventListener("scroll", function () {
  const video = document.querySelector("#gameVideo");
  const scrollPos = window.scrollY;
  const scale = 1 + scrollPos / 900;
  video.style.transform = `scale(${Math.min(scale, 1.8)})`;
});

function startGame() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  window.location.href = `game.html?mode=${mode}`;
}
