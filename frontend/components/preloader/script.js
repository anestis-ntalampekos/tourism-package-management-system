document.write(`
    <style>
        #loader-wrapper {
            position: fixed;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 100%;
            -webkit-transform: translateX(0);
            transform: translateX(0);
            transition: opacity .55s ease;
            height: 100vh;
            width: 100vw;
            z-index: 9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
            visibility: visible;
        }

        .loader {
            border: 16px solid #f3f3f3;
            border-radius: 50%;
            border-top: 16px solid #3498db;
            width: 120px;
            height: 120px;
            -webkit-animation: spin 2s linear infinite;
            /* Safari */
            animation: spin 2s linear infinite;
            position: absolute;
        }

        /* Safari */
        @-webkit-keyframes spin {
            0% {
                -webkit-transform: rotate(0deg);
            }

            100% {
                -webkit-transform: rotate(360deg);
            }
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }
    </style>


    <div id="loader-wrapper">
        <div class="loader"></div>
    </div>
`)





const pre_loader_disable_hide = () => {

    document.querySelector('body').classList.add('loaded');

    const preloader = document.getElementById('loader-wrapper');
    let id = null;
    let opacity = 1;
    clearInterval(id);
    id = setInterval(notIncOpacity, 10);
    function notIncOpacity() {

        if (opacity <= -1) {
            preloader.style.opacity = 0;
            preloader.style.visibility = 'hidden';
            clearInterval(id);
        } else {
            opacity = opacity - 0.01;
            if (opacity > 0)
                preloader.style.opacity = opacity;
        }

    }

};




const pre_loader_enable_visible = () => {

    document.querySelector('body').classList.remove('loaded');

    const preloader = document.getElementById('loader-wrapper');
    let id = null;
    let opacity = 0;
    clearInterval(id);
    id = setInterval(incOpacity, 10);
    function incOpacity() {

        if (opacity >= 1) {
            preloader.style.opacity = 1;
            preloader.style.visibility = 'visible';
            clearInterval(id);
        } else {
            opacity += 0.1;
            if (opacity < 1)
                preloader.style.opacity = opacity;
        }

    }

}




document.onreadystatechange = () => {
    if (document.readyState === 'complete')
        pre_loader_disable_hide();
}




// export { pre_loader_disable_hide, pre_loader_enable_visible };