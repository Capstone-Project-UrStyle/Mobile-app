export const shortenDisplayText = (text, maxLength) => {
    let displayText = text
    if (displayText.length > maxLength) {
        displayText = displayText.slice(0, maxLength) + '...'
    }
    return displayText
}
