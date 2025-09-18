const nodes = document.querySelectorAll('.pulse__node');
const tooltip = document.getElementById('pulseTooltip');
const tooltipYear = tooltip?.querySelector('.pulse__tooltip-year');
const tooltipInfo = tooltip?.querySelector('.pulse__tooltip-info');

const lerp = (start, end, alpha) => (1 - alpha) * start + alpha * end;

let tooltipPosition = { x: 0, y: 0 };
let targetPosition = { x: 0, y: 0 };

nodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
        tooltip.classList.add('is-visible');
        tooltip.style.opacity = '1';
        tooltipYear.textContent = node.dataset.year;
        tooltipInfo.textContent = node.dataset.info;
        const rect = node.getBoundingClientRect();
        targetPosition = {
            x: rect.left + rect.width / 2,
            y: rect.top,
        };
    });

    node.addEventListener('mousemove', (event) => {
        targetPosition = {
            x: event.clientX,
            y: event.clientY - 20,
        };
    });

    node.addEventListener('mouseleave', () => {
        tooltip.classList.remove('is-visible');
        tooltip.style.opacity = '0';
    });
});

const animateTooltip = () => {
    tooltipPosition.x = lerp(tooltipPosition.x, targetPosition.x, 0.12);
    tooltipPosition.y = lerp(tooltipPosition.y, targetPosition.y, 0.12);

    tooltip.style.left = `${tooltipPosition.x}px`;
    tooltip.style.top = `${tooltipPosition.y}px`;

    requestAnimationFrame(animateTooltip);
};

if (tooltip) {
    tooltipPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    targetPosition = { ...tooltipPosition };
    animateTooltip();
}

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    },
    { threshold: 0.2 }
);

const animatedBlocks = document.querySelectorAll(
    '.layer__card, .gallery__item, .ethics, .pulse'
);

animatedBlocks.forEach((block) => {
    block.classList.add('will-animate');
    observer.observe(block);
});
