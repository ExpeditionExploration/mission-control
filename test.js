function shortestRotationAngle(currentAngle, targetAngle) {
    // Normalize the angles to be within the range [0, 360)
    currentAngle = ((currentAngle % 360) + 360) % 360;
    targetAngle = ((targetAngle % 360) + 360) % 360;

    // Calculate the absolute difference between the angles
    let diff = targetAngle - currentAngle;

    // Normalize the difference to be within the range [-180, 180)
    if (diff < -180) {
        diff += 360;
    } else if (diff >= 180) {
        diff -= 360;
    }

    return diff;
}

// Test cases
console.log(shortestRotationAngle(180, 170)); // Output: -5
