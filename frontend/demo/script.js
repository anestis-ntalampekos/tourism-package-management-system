function fontSizeIncrease() {

    const current_fontSize = document.getElementById('fontSizeWrapper').style.fontSize;
    if (current_fontSize >= 50)
        return;


    document.getElementById('fontSizeWrapper').style.fontSize = (current_fontSize + 5) + 'px';

}



function fontSizeDecrease() {

    const current_fontSize = document.getElementById('fontSizeWrapper').style.fontSize;
    if (current_fontSize <= 10)
        return;


    document.getElementById('fontSizeWrapper').style.fontSize = (current_fontSize - 5) + 'px';

}