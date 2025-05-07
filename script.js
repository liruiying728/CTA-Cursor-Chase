document.addEventListener('DOMContentLoaded', function() {
    // Get floating button element
    const floatingButton = document.getElementById('floating-button');

    // Initialize variables
    let lastPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let currentPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let isMoving = false;
    let isHovered = false;
    let isDefaultCursor = true;
    let hideTimeout = null;
    let lastMoveTime = Date.now();

    // Set initial button position
    updateButtonPosition(lastPosition.x, lastPosition.y);

    // Check if text is being selected
    function isTextSelected() {
        const selection = window.getSelection();
        return selection && selection.toString().length > 0;
    }

    // Mouse move event handler
    document.addEventListener('mousemove', function(e) {
        // Update current mouse position
        currentPosition = { x: e.clientX, y: e.clientY };

        // Calculate movement distance
        const distance = Math.sqrt(
            Math.pow(currentPosition.x - lastPosition.x, 2) +
            Math.pow(currentPosition.y - lastPosition.y, 2)
        );

        // If moved
        if (distance > 0) {
            // Update last move time
            lastMoveTime = Date.now();

            // Mark as moving
            isMoving = true;
            lastPosition = { ...currentPosition };

            // Start hide countdown
            startHideTimeout();

            // Show button if conditions are met
            if ((isDefaultCursor || isHovered) && !isTextSelected()) {
                showButton();
            } else {
                hideButton();
            }

            // Update button position if not hovering
            if (!isHovered) {
                updateButtonPosition(currentPosition.x, currentPosition.y);
            }
        }
    });

    // Text selection event handler
    document.addEventListener('selectionchange', function() {
        if (isTextSelected()) {
            hideButton();
        } else if (isMoving && isDefaultCursor) {
            showButton();
        }
    });

    // Detect cursor style
    document.addEventListener('mouseover', debounce(function(e) {
        // Skip button itself
        if (floatingButton.contains(e.target)) {
            return;
        }

        const target = e.target;
        if (target) {
            const computedStyle = window.getComputedStyle(target);
            const cursorStyle = computedStyle.cursor;
            const isDefault = cursorStyle === 'default' || cursorStyle === 'auto';

            // Only update if state changed
            if (isDefault !== isDefaultCursor) {
                isDefaultCursor = isDefault;

                // Hide button if cursor becomes non-default and not hovering
                if (!isDefault && !isHovered) {
                    hideButton();
                } else if (isDefault && isMoving && !isTextSelected()) {
                    showButton();
                }
            }
        }
    }, 50));

    // Button hover events
    floatingButton.addEventListener('mouseenter', function() {
        isHovered = true;
        if (!isTextSelected()) {
            showButton();
        }

        // Clear hide countdown
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
    });

    floatingButton.addEventListener('mouseleave', function() {
        isHovered = false;

        // Update position immediately when leaving button
        updateButtonPosition(currentPosition.x, currentPosition.y);

        // Check if should hide button
        if (!isDefaultCursor || isTextSelected()) {
            hideButton();
        } else if (!isMoving) {
            startHideTimeout();
        }
    });

    // Helper functions

    // Update button position
    function updateButtonPosition(x, y) {
        floatingButton.style.left = x + 'px';
        floatingButton.style.top = y + 'px';
    }

    // Show button
    function showButton() {
        floatingButton.classList.remove('hidden');
        floatingButton.classList.add('visible');
    }

    // Hide button
    function hideButton() {
        floatingButton.classList.remove('visible');
        floatingButton.classList.add('hidden');
    }

    // Start hide countdown
    function startHideTimeout() {
        // Clear existing countdown
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }

        // Set new countdown, hide after 2 seconds
        hideTimeout = setTimeout(function() {
            const timeElapsed = Date.now() - lastMoveTime;

            // Only hide if all conditions are met:
            // 1. No movement for at least 2 seconds
            // 2. Not hovering over button
            // 3. Cursor is default style
            // 4. No text is being selected
            if (timeElapsed >= 2000 && !isHovered && isDefaultCursor && !isTextSelected()) {
                isMoving = false;
                hideButton();
            }
        }, 2000);
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout = null;

        return function(...args) {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }
});
