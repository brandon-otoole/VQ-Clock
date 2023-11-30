'use strict';

const PI2 = Math.PI*2;

function getSeconds(now) {
    return now.getSeconds() + now.getMilliseconds()/1000;
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

    let width, height, r;

    const resize = () => {
        canvas.width = width = window.innerWidth;
        canvas.height = height = window.innerHeight;

        r = Math.min(height, width)*0.40;
        ctx.font = `${r*.25}px monospace`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
    };

    const loop = (t) => {
        const date = new Date();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // draw the clock face background
        ctx.beginPath();
        ctx.arc(width/2, height/2, r, 0, PI2, false);
        ctx.fillStyle = "black";
        ctx.fillStyle = '#000000';
        ctx.fill();

        // draw the quarterMod marks
        const spacing = r*0.1;
        ctx.fillStyle = "white";
        for (let i=-7; i<=7; ++i) {
            if (i == 0) {
                continue;
            }

            const dw = i*spacing;
            const dh = 0.25*r;
            const dr = (i==5 || i==-5) ? (.04*r) : (.02*r);

            ctx.beginPath();
            ctx.arc(width/2 + dw, height/2 + dh, dr, 0, PI2, false);
            ctx.fill();
        }

        // draw the quarter mod center line
        ctx.fillStyle = "white";
        ctx.fillRect(width/2-.015*r, height/2+0.2*r, .03*r, 0.1*r);

        // draw the quarter mod indicator
        ctx.fillStyle = "green";
        const mi = getQuarterMod(date);
        ctx.fillRect(width/2-.01*r+spacing*mi, height/2+0.175*r, .02*r, 0.15*r);

        // draw the quarter hand
        const qi = getQuarterHand(date);
        ctx.save()
        ctx.translate(width/2, height/2);
        ctx.rotate(2*Math.PI * (qi - 1) / 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0.35*r, -0.0125*r, .55*r, (0.025)*r);
        ctx.restore();

        // draw the seconds blip
        ctx.beginPath();
        const stheta = Math.PI * (getSeconds(date)-15)/30.0;
        const sx = 0.95*r*Math.cos(stheta);
        const sy = 0.95*r*Math.sin(stheta);
        ctx.arc(width/2 + sx, height/2 + sy, r*.025, 0, 2 * Math.PI, false);
        ctx.fillStyle = "green";
        ctx.fill();

        // draw the hour digit
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${getHour(date)}`, width/2, height/2);

        // update the title with the normal time
        const sH = date.getHours()%12;
        const sM = date.getMinutes().toString().padStart(2, '0');
        const sS = date.getSeconds().toString().padStart(2, '0');
        const normalTime = `${sH}:${sM}:${sS}`;

        document.getElementById('title').innerHTML = `QuadTime - ${normalTime}`;

        window.requestAnimationFrame(loop);
    };

    window.removeEventListener('load', init);
    window.addEventListener('resize', resize);
    resize();

    window.requestAnimationFrame(loop);
};

window.addEventListener('load', init);
