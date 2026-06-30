export function updateParticles(particles) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.size *= 0.95; // Shrink over time
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

export function spawnParticle(particles, x, y, facingRight) {
    const isSnow = Math.random() > 0.5;
    particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 5,
        vx: (facingRight ? -1 : 1) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
        vy: Math.random() * -2 - 0.5,
        size: Math.random() * 4 + 2,
        life: Math.random() * 20 + 10,
        maxLife: 30,
        color: isSnow ? '#ffffff' : '#d2e3f0'
    });
}

export function drawParticles(ctx, particles) {
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 20);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1.0; // Reset global alpha
}