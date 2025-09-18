const bootScreen = document.querySelector('.boot-screen');
const bootLog = document.querySelector('.boot-screen__log');
const bootProgressBar = document.querySelector('.boot-screen__progress-bar');
const desktop = document.querySelector('.desktop');
const icons = document.querySelectorAll('.desktop-icon');
const windows = document.querySelectorAll('.window');
const taskbarTray = document.querySelector('.taskbar__tray');
const taskbarClock = document.querySelector('.taskbar__clock');

let highestZ = 20;
const taskButtonMap = new Map();

const bootLines = [
  'American Megatrends BIOS v1.43',
  'Copyright (C) 1994-1996 American Megatrends, Inc.',
  'BIOS Date: 09/01/95 16:06:41  Ver: 1.00.09.DF0',
  'CPU: Pentium(R) Pro 200MHz',
  'Memory Test: 131072K OK',
  'Keyboard... Detected',
  'Mouse.... PS/2 Compatible',
  'Initializing Plug and Play Cards...',
  'Primary Master: QUANTUM FIREBALL 4.3A',
  'Primary Slave : -- None --',
  'Secondary Master: ATAPI CD-ROM 24X',
  'Secondary Slave : 1.44MB 3½" Floppy',
  'Detecting IDE Devices...',
  'Auto-Detecting Fixed Disk...',
  'Auto-Detecting ATAPI Devices...',
  'Verifying DMI Pool Data...',
  'Starting Windows 95...'
];

function simulateBoot() {
  let index = 0;
  const total = bootLines.length;

  const interval = setInterval(() => {
    const line = bootLines[index];
    if (line) {
      bootLog.textContent += `${line}\n`;
      bootProgressBar.style.width = `${Math.round(((index + 1) / total) * 100)}%`;
    }

    index += 1;
    if (index >= total) {
      clearInterval(interval);
      setTimeout(() => {
        bootScreen.setAttribute('hidden', '');
        desktop.hidden = false;
        openWindow(document.getElementById('projects-window'));
      }, 1200);
    }
  }, 420);
}

function bringToFront(win) {
  highestZ += 1;
  win.style.zIndex = highestZ;
  windows.forEach((w) => w.classList.toggle('is-active', w === win && !w.classList.contains('window--hidden')));
  taskButtonMap.forEach((button, id) => {
    if (id === win.id && !win.classList.contains('window--hidden')) {
      button.classList.add('is-active');
    } else {
      button.classList.remove('is-active');
    }
  });
}

function ensureTaskButton(win) {
  let button = taskButtonMap.get(win.id);
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'taskbar__button';
    button.textContent = win.querySelector('.window__title span:last-child').textContent;
    button.addEventListener('click', () => {
      if (win.classList.contains('window--hidden')) {
        showWindow(win);
      } else {
        minimizeWindow(win);
      }
    });
    taskbarTray.appendChild(button);
    taskButtonMap.set(win.id, button);
  }
  return button;
}

function showWindow(win) {
  restorePreviousPosition(win);
  win.classList.add('is-active');
  win.classList.remove('window--hidden');
  win.style.display = 'flex';
  ensureTaskButton(win).classList.add('is-active');
  bringToFront(win);
}

function hideWindow(win) {
  win.classList.remove('is-active');
  win.style.display = 'none';
  const button = taskButtonMap.get(win.id);
  if (button) {
    button.classList.remove('is-active');
  }
}

function minimizeWindow(win) {
  win.classList.add('window--hidden');
  win.classList.remove('is-active');
  const button = ensureTaskButton(win);
  button.classList.remove('is-active');
}

function closeWindow(win) {
  restorePreviousPosition(win);
  win.classList.add('window--hidden');
  win.classList.remove('is-active');
  win.style.display = 'none';
  const button = taskButtonMap.get(win.id);
  if (button) {
    button.remove();
    taskButtonMap.delete(win.id);
  }
}

function toggleMaximize(win) {
  if (win.classList.contains('window--maximized')) {
    restorePreviousPosition(win);
  } else {
    win.dataset.previousPosition = JSON.stringify({
      left: win.style.left || `${win.offsetLeft}px`,
      top: win.style.top || `${win.offsetTop}px`,
      width: win.style.width || `${win.offsetWidth}px`,
      height: win.style.height || `${win.offsetHeight}px`
    });
    win.classList.add('window--maximized');
    win.style.width = '100%';
    win.style.height = `calc(100% - 4.5rem)`;
    win.style.left = '0';
    win.style.top = '2.5rem';
  }
  bringToFront(win);
}

function openWindow(win) {
  if (!win) return;
  showWindow(win);
}

function restorePreviousPosition(win) {
  if (!win.classList.contains('window--maximized')) return;
  win.classList.remove('window--maximized');
  const previous = win.dataset.previousPosition;
  if (previous) {
    const { left, top, width, height } = JSON.parse(previous);
    win.style.left = left;
    win.style.top = top;
    win.style.width = width;
    win.style.height = height;
    delete win.dataset.previousPosition;
  }
}

icons.forEach((icon) => {
  icon.addEventListener('dblclick', () => {
    const win = document.getElementById(icon.dataset.window);
    openWindow(win);
  });

  icon.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const win = document.getElementById(icon.dataset.window);
      openWindow(win);
    }
  });
});

windows.forEach((win) => {
  const titlebar = win.querySelector('.window__titlebar');
  titlebar.addEventListener('dblclick', () => toggleMaximize(win));

  win.addEventListener('mousedown', () => bringToFront(win));

  win.querySelectorAll('.window__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'minimize') {
        minimizeWindow(win);
      } else if (action === 'maximize') {
        toggleMaximize(win);
      } else if (action === 'close') {
        closeWindow(win);
      }
    });
  });
});

let isDragging = false;
let dragTarget = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function startDrag(event, win) {
  if (win.classList.contains('window--maximized')) return;
  isDragging = true;
  dragTarget = win;
  const rect = win.getBoundingClientRect();
  dragOffsetX = event.clientX - rect.left;
  dragOffsetY = event.clientY - rect.top;
  win.style.position = 'absolute';
  bringToFront(win);
}

function onPointerMove(event) {
  if (!isDragging || !dragTarget) return;
  const desktopRect = desktop.getBoundingClientRect();
  const newLeft = event.clientX - dragOffsetX - desktopRect.left;
  const newTop = event.clientY - dragOffsetY - desktopRect.top;
  dragTarget.style.left = `${Math.max(0, newLeft)}px`;
  dragTarget.style.top = `${Math.max(0, newTop)}px`;
}

function stopDrag() {
  isDragging = false;
  dragTarget = null;
}

desktop.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.window__btn')) return;
  const titlebar = event.target.closest('.window__titlebar');
  if (titlebar) {
    const win = titlebar.closest('.window');
    startDrag(event, win);
  }
});

desktop.addEventListener('pointermove', onPointerMove);
desktop.addEventListener('pointerup', stopDrag);
desktop.addEventListener('pointercancel', stopDrag);
window.addEventListener('pointerup', stopDrag);
window.addEventListener('pointermove', onPointerMove);

function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  taskbarClock.textContent = `${hours}:${minutes}`;
}

setInterval(updateClock, 30000);
updateClock();

simulateBoot();
