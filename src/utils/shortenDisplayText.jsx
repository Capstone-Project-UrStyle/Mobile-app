export const shortenDisplayText = (text, maxLength) => {
    let displayText = text
    if (displayText && displayText.length > maxLength) {
        displayText = displayText.slice(0, maxLength) + '...'
    }
    return displayText
}
