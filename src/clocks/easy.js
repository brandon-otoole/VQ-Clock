'use strict';

const PI2 = Math.PI*2;

function getSeconds(now) {
    return now.getSeconds() + now.getMilliseconds()/1000;
}

function getMinutes(now) {
    return now.getMinutes() + getSeconds(now)/60;
}

function getQuarterHand(now) {
    const m = now.getMinutes() + now.getSeconds()/60;

    return Math.round(m/15);
}

function getHour(now) {
    const m = now.getMinutes() + now.getSeconds()/60;

    if (m < 52.5) {
        return now.getHours() % 12;
    } else {
        return (now.getHours() + 1) % 12;
    }
}

function getQuarterMod(now) {
    const ms = now.getMilliseconds();
    const s = now.getSeconds() + ms / 1000;
    const m = now.getMinutes() + s / 60;

    return m - 15*getQuarterHand(now);
}

function init() {
    const canvas = document.getElementsByTagName('canvas').item(0)
    const ctx = canvas.getContext('2d');

    let width, height, r, spacing;

    const resize = () => {
        canvas.width = width = window.innerWidth;
        canvas.height = height = window.innerHeight;

        r = Math.min(height, width)*0.40;

        spacing = r*0.1;
        ctx.font = `${r*.25}px monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
    };

    function angledDraw(ctx, angle, actions) {
        ctx.save()
        ctx.translate(width/2, height/2);
        ctx.rotate(angle);
        actions(ctx);
        ctx.restore();
    }

    function drawFace() {
        // clear the screen
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // draw a basic black round clock face
        ctx.beginPath();
        ctx.arc(width/2, height/2, r, 0, PI2, false);
        ctx.fillStyle = "black";
        ctx.fill();
    }

    // draw the seconds blip
    function drawSecondsBlip(date) {
        const theta = Math.PI * (getSeconds(date))/30.0;

        angledDraw(ctx, theta, (ctx) => {
            ctx.beginPath();
            ctx.arc(0, -0.95*r, r*.025, 0, PI2, false);
            ctx.fillStyle = "red";
            ctx.fill();
        });

    }

    // draw the hour digit
    function drawHourDigit(date) {
        ctx.fillStyle = 'white';
        ctx.fillText(`${getHour(date)}`, width/2, height/2);
    }

    function drawMinuteHand(date) {
        const theta = Math.PI * (getMinutes(date))/30.0;

        angledDraw(ctx, theta, (ctx) => {
            ctx.beginPath();
            ctx.fillStyle = "green";
            ctx.fillRect(-.007*r, -0.45*r, .014*r, -0.1*r);
        });
    }

    function drawQuadMarks(date) {
        // draw the quarter hand
        const qi = getQuarterHand(date);
        const theta = PI2 * (qi)/4;

        ctx.fillStyle = "white";
        angledDraw(ctx, theta, (ctx) => {
            const increment = PI2 / 60;
            ctx.rotate(-7*increment);

            for (let i=-7; i<=7; ++i) {
                if (i == 0) {
                    // draw the major hand
                    ctx.fillRect(-.0075*r, -0.375*r, .015*r, -0.25*r);
                } else if (i == 5 || i == -5) {
                    // draw the major marks
                    ctx.beginPath();
                    ctx.fillRect(-.008*r, -0.45*r, .016*r, -0.1*r);
                    //ctx.arc(0, -0.5*r, 0.025*r, 0, PI2, false);
                    ctx.fill();
                } else {
                    // draw the minor marks
                    ctx.beginPath();
                    ctx.arc(0, -0.5*r, 0.01*r, 0, PI2, false);
                    ctx.fill();
                }

                ctx.rotate(increment);
            }
        });
    }

    const loop = (t) => {
        const date = new Date();

        // Draw the background
        drawFace();

        // Draw the seconds blip
        drawSecondsBlip(date);

        // Draw the Hour
        drawHourDigit(date);

        // Draw the quad marks
        drawQuadMarks(date);

        // Draw the minute hand
        drawMinuteHand(date);

        // update the title with the normal time
        const sH = date.getHours()%12;
        const sM = date.getMinutes().toString().padStart(2, '0');
        const sS = date.getSeconds().toString().padStart(2, '0');
        const normalTime = `${sH}:${sM}:${sS}`;

        document.getElementById('title').innerHTML = `Easy Mode - ${normalTime}`;

        window.requestAnimationFrame(loop);
    };

    window.removeEventListener('load', init);
    window.addEventListener('resize', resize);
    resize();

    window.requestAnimationFrame(loop);
};

const Easy = {
    run: function() {
        window.addEventListener('load', init);
    }
};

export default Easy;
