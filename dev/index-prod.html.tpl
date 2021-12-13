<!DOCTYPE html>
<html>
    <head>
        <title><%= title %></title>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
        <meta name="robots" content="noindex,nofollow" />

        <link rel="stylesheet" type="text/css" href="css/bundle.min.css" />
    </head>
    <body>
        <div id="canvas-container"></div>
        <div id="feedback-widget-container">
            <div id="feedback-widget-wrapper">
                <div id="feedback-widget">
                    <div class="button-close">
                        <span>×</span>
                    </div>
                    <h2 class="title">Feedback</h2>
                    <p class="subtitle">How can we improve the game?</p>
                    <br>
                    <label for="message">Nachricht</label>
                    <textarea id="message" class="swal2-textarea dialog-textarea"></textarea>
                    <br>
                    <label for="email">Email (optional)</label>
                    <input type="email" id="email" class="swal2-input">
                    <br>
                    <button class="button">Send</button>
                </div>
                <div id="alert">Message!</div>
            </div>
        </div>
        <div id="rotate">
            <svg viewBox="0 0 24 24">
                <path
                        d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32zm-6.25-.77c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75zm4.6 19.44L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-7.31.29C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"
                ></path>
            </svg>
        </div>
        <div id="loading-overlay" class="spinner-container">
            <div class="loading-spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
            <div id="preloader">
                <svg class="progress-ring"></svg>
                <picture>
                    <source srcset="css/icon.webp" type="image/webp">
                    <img src="css/icon.png" alt="Papa Cherry" id="game-icon">
                </picture>
                <p class="progress-text">0</p>
            </div>
            <p class="copyright">Developed by Robowhale, 2020-2021</p>
        </div>

        <script>window.environment = "production"</script>
        <script src="js/cache-busters.js" type="text/javascript"></script>
        <script src="js/vendor.min.js" type="text/javascript"></script>
        <script src="js/game.min.js" type="text/javascript"></script>
    </body>
</html>
