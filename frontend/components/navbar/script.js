let user_logged_in = true;
if (!JSON.parse(localStorage.getItem('session_data'))?.user?.account_id)
    user_logged_in = false;


let session_data = null;
if (user_logged_in)
    session_data = JSON.parse(localStorage.getItem('session_data'));




document.write(`
    <nav class="navbar navbar-expand-lg bg-body-tertiary" id="global-navbar">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Tourist Office</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" aria-current="page" href="../../index.html">Αρχική</a>
                    </li>
                    
                    <!-- <li class="nav-item">
                        <a class="nav-link" href="#">Δημιουργία πακέτου</a>
                    </li> -->


                    ${user_logged_in ? session_data.user.account_type === 'secretariat' ? `
                        <li class="nav-item">
                            <a class="nav-link" href="./plans.html">Πακέτα</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="./bookings.html">Κρατήσεις</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="./travel-agents.html">Ταξιδιωτικοί πράκτορες</a>
                        </li>
                    ` : `` : ``}



                    ${user_logged_in ? session_data.user.account_type === 'travel_agent' ? `
                        <li class="nav-item">
                            <a class="nav-link" href="./plans.html">Πακέτα</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="./bookings.html">Κρατήσεις</a>
                        </li>
                    ` : `` : ``}



                    ${user_logged_in ? `
                        <li class="nav-item">
                            <a class="nav-link" href="./my-bookings.html">Οι κρατήσεις μου</a>
                        </li>
                    ` : ``}

                </ul>
                <!-- <form class="d-flex" role="search">
                    <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
                    <button class="btn btn-outline-success" type="submit">Search</button>
                </form> -->

                ${user_logged_in ? `
                    <a href="./logout.html" class="btn btn-secondary" id="logoutLinkButton">
                        Αποσύνδεση
                    </a>
                ` : `
                    <a href="./login.html" class="btn btn-primary" id="loginLinkButton">
                        Σύνδεση
                    </a>
                    <a href="./register.html" class="btn btn-primary ms-2" id="registerLinkButton">
                        Δημιουργία λογαριασμού
                    </a>
                `}
            </div>
        </div>
    </nav>
`);