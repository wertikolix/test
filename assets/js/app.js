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
    '.layer__card, .gallery__item, .ethics, .pulse, .sequence, .algorithms, .metrics, .sequence__page, .algorithm__card, .metric'
);

animatedBlocks.forEach((block) => {
    block.classList.add('will-animate');
    observer.observe(block);
});

const metricValues = document.querySelectorAll('.metric__value');

const animateMetricValue = (element) => {
    const target = parseFloat(element.dataset.target || '0');

    if (Number.isNaN(target)) {
        return;
    }

    const scaledTarget = Math.round(target * 100);
    let current = 0;

    element.textContent = '0.00%';

    const interval = setInterval(() => {
        current += 1;

        if (current >= scaledTarget) {
            current = scaledTarget;
        }

        element.textContent = `${(current / 100).toFixed(2)}%`;

        if (current === scaledTarget) {
            clearInterval(interval);
        }
    }, 10);
};

const metricObserver = new IntersectionObserver(
    (entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateMetricValue(entry.target);
                obs.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.6 }
);

metricValues.forEach((value) => {
    value.textContent = '0.00%';
    metricObserver.observe(value);
});
