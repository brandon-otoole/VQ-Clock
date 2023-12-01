'use strict';

const PI2 = Math.PI*2;

function getSecond(now) {
    const s = now.getSeconds() + now.getMilliseconds()/1000;

    const dt = 4;
    return Math.round(s*dt)/dt;
}

function getMinute(now) {
    const m =  now.getMinutes() + now.getSeconds()/60;

    const dt = 15;
    return Math.round(m*dt)/dt;
}

function getQuad(now) {
    const L = 15;
    const k = 100;
    let x0, offset;

    const milliseconds = now.getMilliseconds();
    const seconds = now.getSeconds() + milliseconds / 1000;
    const x = now.getMinutes() + seconds/60;
    if (x >= 0 && x < 15) {
        x0 = 7.5;
        offset = 0;
    } else if (x >= 15 && x < 30) {
        x0 = 22.5;
        offset = 15;
    } else if (x >= 30 && x < 45) {
        x0 = 37.5;
        offset = 30;
    } else if (x >= 45 && x < 60) {
        x0 = 52.5;
        offset = 45;
    }

    const mCenter = L / (1 + Math.exp(-k*(x-x0))) + offset;
    const theta = (PI2 * mCenter/60) - PI2/4;

    const dt = 1000000;
    return Math.round(theta*dt)/dt;
}

function getHour(now) {
    const m = now.getMinutes() + now.getSeconds()/60;

    if (m < 52.5) {
        return now.getHours() % 12;
    } else {
        return (now.getHours() + 1) % 12;
    }
}

function angledDraw(ctx, x, y, theta, actions) {
    ctx.save()
    ctx.translate(x, y);
    ctx.rotate(theta);
    actions(ctx);
    ctx.restore();
}

function init() {
    const canvas = document.getElementsByTagName('canvas').item(0)
    const ctx = canvas.getContext('2d');

    let width, height, r;
    const resize = () => {
        hourOld =  quadOld = minuteOld = secondOld = undefined;

        canvas.width = width = window.innerWidth;
        canvas.height = height = window.innerHeight;

        r = Math.min(height, width)*0.40;

        ctx.font = `${r*.25}px monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        // Draw the background
        drawFace();
    };

    function clearHour(hour) {
        const theta = 0;
        angledDraw(ctx, width/2, height/2, theta, (ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, r*.25, 0, PI2, false);
            ctx.fillStyle = "black";
            ctx.fill();
        });
    }

    function clearMinute(minute) {
        angledDraw(ctx, width/2, height/2, 0, (ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, 0.45*r, 0, PI2, false);
            ctx.lineWidth = r*0.4;
            ctx.strokeStyle = "black";
            ctx.stroke();
        });
    }

    function clearSecond(second) {
        const theta = Math.PI * (second)/30.0;

        angledDraw(ctx, width/2, height/2, theta, (ctx) => {
            ctx.beginPath();
            ctx.arc(0, -0.975*r, r*.025, 0, PI2, false);
            ctx.fillStyle = "black";
            ctx.fill();
        });
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
    function drawSecondsBlip(second) {
        const theta = Math.PI * (second)/30.0;

        angledDraw(ctx, width/2, height/2, theta, (ctx) => {
            ctx.beginPath();
            ctx.arc(0, -0.975*r, r*.0125, 0, PI2, false);
            ctx.fillStyle = "darkgrey";
            ctx.fill();
        });
    }

    // draw the hour digit
    function drawHourDigit(hour) {
        ctx.fillStyle = 'white';
        ctx.fillText(`${hour}`, width/2, height/2);
    }

    function drawMinuteHand(minute) {
        const theta = Math.PI * (minute)/30.0;

        angledDraw(ctx, width/2, height/2, theta, (ctx) => {
            ctx.beginPath();
            ctx.fillStyle = "green";
            ctx.fillRect(-.007*r, -0.45*r, .014*r, -0.1*r);
        });
    }

    function drawQuadMask(theta) {
        angledDraw(ctx, width/2, height/2, theta, (ctx) => {
            ctx.beginPath();
            ctx.arc(0, 0, 0.45*r, PI2*(1/8+1/240), PI2*(7/8 - 1/240), false);
            ctx.lineWidth = r*0.4;
            ctx.strokeStyle = "black";
            ctx.stroke();
        });
    }

    function drawQuadMarks() {
        // use angled Draw with theta=0 to preserve orientation
        angledDraw(ctx, width/2, height/2, 0, (ctx) => {
            ctx.fillStyle = "white";
            for (let i=0; i<60; ++i) {

                ctx.beginPath();
                if (i%15 == 0) {
                    // draw the major hand
                    ctx.fillRect(-.0075*r, -0.375*r, .015*r, -0.25*r);
                } else if (i%5 == 0) {
                    // draw the major marks
                    ctx.fillRect(-.008*r, -0.45*r, .016*r, -0.1*r);
                } else {
                    // draw the minor marks
                    ctx.arc(0, -0.5*r, 0.01*r, 0, PI2, false);
                    ctx.fill();
                }

                // draw each tic with one minute spacing
                ctx.rotate(PI2 / 60);
            }
        });
    }

    let hourOld, quadOld, minuteOld, secondOld;
    const loop = (t) => {
        //const date = new Date();

        const dm = 0;
        const date = new Date((new Date()).getTime() + dm*60000);

        const hour = getHour(date);
        const quadAngle = getQuad(date);
        const minute = getMinute(date);
        const second = getSecond(date);

        // Draw the Hour if it has changed
        if (hourOld != hour) {
            clearHour(hourOld);

            drawHourDigit(hour);

            hourOld = hour;
        }

        // Draw the minute hand
        if (minuteOld != minute || quadOld != quadAngle) {
            clearMinute(minuteOld);

            // Draw the quad marks
            drawQuadMarks();

            // Draw the quad mask
            drawQuadMask(quadAngle);

            drawMinuteHand(minute);

            minuteOld = minute;
            quadOld = quadAngle
        }

        // Draw the seconds blip
        if (secondOld != second) {
            clearSecond(secondOld);

            drawSecondsBlip(second);

            secondOld = second;
        }

        // update the title with the normal time
        const sH = date.getHours()%12;
        const sM = date.getMinutes().toString().padStart(2, '0');
        const sS = date.getSeconds().toString().padStart(2, '0');
        const normalTime = `${sH}:${sM}:${sS}`;

        //document.getElementById('title').innerHTML = `Easy Mode - ${normalTime}`;

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
